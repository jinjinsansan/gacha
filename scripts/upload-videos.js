#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

// Utility script to map Japanese-named gacha videos to canonical pattern IDs
// and upload them to Cloudflare R2 via the S3-compatible API.

const fs = require("fs");
const path = require("path");

const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const REQUIRED_ENV = [
  "CLOUDFLARE_ACCOUNT_ID",
  "CLOUDFLARE_R2_ACCESS_KEY_ID",
  "CLOUDFLARE_R2_SECRET_ACCESS_KEY",
  "CLOUDFLARE_R2_BUCKET_NAME",
];

const SOURCE_ROOT_CANDIDATES = [
  path.resolve(process.cwd(), "tmp_video_bundle/ガチャガチャ"),
  path.resolve(process.cwd(), "tmp_video_bundle"),
];

const OUTPUT_DIR = path.resolve(process.cwd(), "tmp_video_bundle/processed");
const REPORT_PATH = path.resolve(process.cwd(), "tmp_video_bundle/upload-report.json");
const SEED_PATH = path.resolve(process.cwd(), "supabase/seed.sql");

const ARROW_DELIMITER = "→";
const DRY_RUN = process.argv.includes("--dry-run");
const ALLOW_MISSING = process.argv.includes("--allow-missing");

function ensureEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]?.trim());
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

function findSourceRoot() {
  for (const candidate of SOURCE_ROOT_CANDIDATES) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      return candidate;
    }
  }
  throw new Error("Could not locate tmp_video_bundle directory with extracted videos.");
}

function parseSeedFile() {
  const content = fs.readFileSync(SEED_PATH, "utf8");
  const patternRegex = /\(\s*(\d+)\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(true|false)\s*,\s*'([^']+)'\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/g;
  const patterns = [];
  let match;
  while ((match = patternRegex.exec(content)) !== null) {
    patterns.push({
      id: Number(match[1]),
      currency: match[2],
      machineColor: match[3],
      effect1: match[4],
      effect2: match[5],
      baseResult: match[6] === "true",
      videoUrl: match[7],
      weight: Number(match[8]),
      prizeAmount: Number(match[9]),
    });
  }
  if (patterns.length === 0) {
    throw new Error("Failed to parse gacha_patterns from supabase/seed.sql");
  }
  return patterns;
}

function collectVideoFiles(root) {
  const files = [];
  const walk = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".mp4")) {
        files.push(fullPath);
      }
    }
  };
  walk(root);
  if (files.length === 0) {
    throw new Error(`No .mp4 files found under ${root}`);
  }
  return files;
}

const currencyMap = [
  { prefix: "イーサリアム", value: "ETH" },
  { prefix: "ETH", value: "ETH" },
  { prefix: "BTC", value: "BTC" },
  { prefix: "TRX", value: "TRX" },
  { prefix: "TRON", value: "TRX" },
  { prefix: "XRP", value: "XRP" },
];

const colorMap = new Map(
  Object.entries({
    金: "Gold",
    ゴールド: "Gold",
    黒: "Black",
    ブラック: "Black",
    銀: "Silver",
    シルバー: "Silver",
    青: "Blue",
    ブルー: "Blue",
    赤: "Red",
    レッド: "Red",
    紫: "Purple",
    パープル: "Purple",
    ピンク: "Pink",
    緑: "Green",
    グリーン: "Green",
  })
);

const effectMap = new Map(
  Object.entries({
    熱: "Hot",
    暗: "Dark",
    返: "Return",
    返し: "Return",
  })
);

const resultMap = new Map(
  Object.entries({
    当たり: true,
    ハズレ: false,
  })
);

function stripDecorations(value) {
  return value
    .replace(/\s+/g, "")
    .replace(/[()（）]/g, "")
    .replace(/_?v\d+$/i, "")
    .replace(/[０-９0-9]+$/g, "")
    .replace(/コピー$/i, "");
}

function extractCurrencyAndColor(token) {
  for (const entry of currencyMap) {
    if (token.startsWith(entry.prefix)) {
      const remainder = token.slice(entry.prefix.length);
      const color = colorMap.get(remainder);
      if (!color) {
        throw new Error(`Unknown machine color token "${remainder}" in ${token}`);
      }
      return { currency: entry.value, color };
    }
  }
  throw new Error(`Unknown currency token in ${token}`);
}

function mapEffect(token) {
  const mapped = effectMap.get(token);
  if (!mapped) {
    throw new Error(`Unknown effect token "${token}"`);
  }
  return mapped;
}

function mapResult(token) {
  const mapped = resultMap.get(token);
  if (typeof mapped === "undefined") {
    throw new Error(`Unknown result token "${token}"`);
  }
  return mapped;
}

function scoreFileName(name) {
  let score = 0;
  if (/\d/.test(name)) score += 2;
  if (/\(\d+\)|（\d+）/.test(name)) score += 3;
  if (/copy|コピー/i.test(name)) score += 5;
  if (/v\d+/i.test(name)) score += 4;
  return score;
}

function parseVideoMetadata(filePath) {
  const fileName = path.basename(filePath, path.extname(filePath));
  const normalized = fileName.split(ARROW_DELIMITER).map((segment) => stripDecorations(segment));
  if (normalized.length !== 4) {
    throw new Error(`Unexpected filename format: ${fileName}`);
  }
  const [currencyColor, effect1Raw, effect2Raw, resultRaw] = normalized;
  const { currency, color } = extractCurrencyAndColor(currencyColor);
  return {
    currency,
    machineColor: color,
    effect1: mapEffect(effect1Raw),
    effect2: mapEffect(effect2Raw),
    baseResult: mapResult(resultRaw),
    filePath,
    fileName,
    score: scoreFileName(fileName),
  };
}

function buildKey({ currency, machineColor, effect1, effect2, baseResult }) {
  return [currency, machineColor, effect1, effect2, baseResult ? "WIN" : "LOSE"].join("|");
}

function matchPatterns(patterns, videoMetas) {
  const fileMap = new Map();
  for (const meta of videoMetas) {
    const key = buildKey(meta);
    const current = fileMap.get(key);
    if (!current || meta.score < current.score) {
      fileMap.set(key, meta);
    }
  }

  const missing = [];
  const resolved = new Map();
  for (const pattern of patterns) {
    const key = buildKey(pattern);
    const match = fileMap.get(key);
    if (!match) {
      missing.push(pattern);
    } else {
      resolved.set(pattern.id, match);
    }
  }

  return { matches: resolved, missing };
}

function createS3Client() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const endpoint =
    process.env.CLOUDFLARE_R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`;
  return new S3Client({
    region: "auto",
    endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    },
  });
}

async function uploadToR2(client, bucket, key, filePath) {
  const upload = new Upload({
    client,
    params: {
      Bucket: bucket,
      Key: key,
      Body: fs.createReadStream(filePath),
      ContentType: "video/mp4",
      CacheControl: "public, max-age=31536000, immutable",
    },
  });
  await upload.done();
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function padId(id) {
  return id.toString().padStart(2, "0");
}

function buildPublicUrl(base, objectKey) {
  if (!base) return null;
  return `${base.replace(/\/+$/, "")}/${objectKey}`;
}

async function main() {
  ensureEnv();
  const sourceRoot = findSourceRoot();
  const patterns = parseSeedFile();
  const videoFiles = collectVideoFiles(sourceRoot);
  const videoMetas = videoFiles.map((file) => {
    try {
      return parseVideoMetadata(file);
    } catch (error) {
      console.warn(`Skipping ${path.basename(file)}: ${error.message}`);
      return null;
    }
  }).filter(Boolean);

  const { matches, missing } = matchPatterns(patterns, videoMetas);
  if (missing.length && !ALLOW_MISSING) {
    const hint = missing
      .map(
        (p) =>
          `${p.id}: ${p.currency} ${p.machineColor} ${p.effect1}→${p.effect2} ${p.baseResult ? "WIN" : "LOSE"}`
      )
      .join("\n");
    throw new Error(`Missing video files for ${missing.length} pattern(s):\n${hint}`);
  }
  if (missing.length) {
    console.warn(`Warning: ${missing.length} pattern(s) do not have matching videos. They will be skipped.`);
  }
  ensureDir(OUTPUT_DIR);

  const s3Client = DRY_RUN ? null : createS3Client();
  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  const publicBase = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL;

  const reportEntries = [];
  const processedIds = [];
  for (const pattern of patterns) {
    const videoMeta = matches.get(pattern.id);
    if (!videoMeta) {
      continue;
    }
    const targetFileName = `pattern_${padId(pattern.id)}.mp4`;
    const localCopyPath = path.join(OUTPUT_DIR, targetFileName);
    fs.copyFileSync(videoMeta.filePath, localCopyPath);

    const objectKey = `videos/${targetFileName}`;
    const entry = {
      id: pattern.id,
      currency: pattern.currency,
      machineColor: pattern.machineColor,
      effect1: pattern.effect1,
      effect2: pattern.effect2,
      baseResult: pattern.baseResult,
      sourceFile: path.relative(process.cwd(), videoMeta.filePath),
      localCopy: path.relative(process.cwd(), localCopyPath),
      objectKey,
      uploaded: false,
      publicUrl: buildPublicUrl(publicBase, objectKey),
    };

    if (!DRY_RUN) {
      await uploadToR2(s3Client, bucket, objectKey, localCopyPath);
      entry.uploaded = true;
    }

    reportEntries.push(entry);
    processedIds.push(pattern.id);
    console.log(`${DRY_RUN ? "Prepared" : "Uploaded"} pattern ${pattern.id} -> ${objectKey}`);
  }

  fs.writeFileSync(
    REPORT_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        dryRun: DRY_RUN,
        bucket,
        videoCount: reportEntries.length,
        skippedPatternIds: missing.map((p) => p.id),
        entries: reportEntries,
      },
      null,
      2
    )
  );

  console.log(`\nReport written to ${path.relative(process.cwd(), REPORT_PATH)}`);
  if (DRY_RUN) {
    console.log("Dry run complete. Re-run without --dry-run to upload to R2.");
  } else {
    console.log("Upload complete.");
  }
}

main().catch((error) => {
  console.error("\nUpload failed:", error);
  process.exit(1);
});

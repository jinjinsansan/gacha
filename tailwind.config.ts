import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0F",
        foreground: "#FFFFFF",
        "card-bg": "#1A1A24",
        "card-bg-hover": "#252532",
        "accent-primary": "#00FF88",
        "accent-secondary": "#9945FF",
        "accent-win": "#FFD700",
        "accent-jackpot": "#FF1493",
        "text-secondary": "#888888",
        "text-muted": "#555555",
        btc: "#F7931A",
        eth: "#627EEA",
        xrp: "#23292F",
        trx: "#FF0013",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glow: "0 0 30px rgba(0, 255, 136, 0.35)",
      },
    },
  },
  darkMode: "class",
};

export default config;

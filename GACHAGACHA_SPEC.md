# GACHAGACHA - Crypto Gacha Platform

## Project Overview

A cryptocurrency-based gacha (capsule toy) gaming platform. Users pay $10 USDT per play and can win various cryptocurrency prizes based on probability.

- **Site Name**: GACHAGACHA
- **Language**: English only
- **Target Market**: International (NOT Japan)
- **Theme**: Dark/Futuristic

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API Routes, Supabase Edge Functions |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (Google OAuth only) |
| Video Storage | Cloudflare R2 |
| Hosting | Vercel |
| Blockchain | Ethereum (ERC-20 USDT) |

---

## User Flow

```
TOP Page
    ↓ Click "PLAY NOW"
Google Login (if not logged in)
    ↓
Deposit Page (show USDT address + QR code)
    ↓ User sends $10 USDT
Waiting Page (checking blockchain confirmation)
    ↓ Deposit confirmed
Gacha Start Button Active
    ↓ Click to play
Video Plays (one of 50 patterns)
    ↓
Result Page
    ├─ WIN → Enter withdrawal address → Submit
    └─ LOSE → "Try Again" button
```

---

## Video Sequence Order

Each video displays in this order:
1. Currency Type (BTC/ETH/XRP/TRX)
2. Machine Color
3. Effect 1 Animation
4. Effect 2 Animation
5. Result (WIN/LOSE)

---

## Probability Design

### Currency Appearance Rate (per 100 plays)

| Currency | Appearance Rate | Patterns | Win Rate within Currency | Wins per 100 plays |
|----------|-----------------|----------|-------------------------|-------------------|
| BTC | 2% | 2 | 100% (2/2) | 2 |
| ETH | 20% | 14 | 71.4% (10/14) | ~14.3 |
| XRP | 30% | 16 | 50% (8/16) | 15 |
| TRX | 48% | 18 | 22.2% (4/18) | ~10.7 |
| **Total** | 100% | 50 | - | ~42 wins |

### Prize Amounts (Fixed)

| Currency | Prize per Win |
|----------|---------------|
| BTC | $250 |
| ETH | $15 |
| XRP | $4 |
| TRX | $3 |

### Revenue Structure (per 100 plays)

| Item | Amount |
|------|--------|
| Total Revenue | $1,000 |
| Jackpot Pool ($1/play) | $100 |
| Available for prizes | $900 |
| Prize Payout (at 90% RTP) | ~$806.6 |
| Operator Profit | ~$93.4 |

---

## RTP (Return to Player) System

### How RTP Works

- **Default RTP**: 90%
- **Range**: 50% - 99%
- **Mechanism**: RTP adjusts win/lose probability, NOT prize amounts

### RTP Logic (Pseudocode)

```javascript
function playGacha(userId) {
  // 1. Select currency based on appearance rate
  const currency = selectCurrency(); // BTC:2%, ETH:20%, XRP:30%, TRX:48%
  
  // 2. Select pattern within that currency
  const pattern = selectPattern(currency);
  
  // 3. Get base result from pattern
  const baseResult = pattern.isWin; // true or false from Excel data
  
  // 4. Apply RTP modifier (only if base is WIN)
  let finalResult = baseResult;
  if (baseResult === true) {
    const currentRTP = getSystemRTP(); // e.g., 90
    const random = Math.random() * 100;
    if (random >= currentRTP) {
      // Convert WIN to LOSE
      finalResult = false;
      // Play a LOSE variant video of same currency
    }
  }
  
  // 5. Return result
  return {
    pattern: pattern,
    result: finalResult,
    prize: finalResult ? pattern.prizeAmount : 0
  };
}
```

### RTP Examples

| RTP | Expected Wins/100 | Operator Profit |
|-----|-------------------|-----------------|
| 99% | ~42 | ~$93 |
| 90% | ~38 | ~$170 |
| 70% | ~29 | ~$335 |
| 50% | ~21 | ~$500 |

---

## 50 Video Patterns Data

Import this data into the `gacha_patterns` table.

### BTC Patterns (2 patterns) - Prize: $250

| No | Color | Effect1 | Effect2 | Result |
|----|-------|---------|---------|--------|
| 1 | Gold | Hot | Hot | WIN |
| 2 | Black | Hot | Hot | WIN |

### ETH Patterns (14 patterns) - Prize: $15

| No | Color | Effect1 | Effect2 | Result |
|----|-------|---------|---------|--------|
| 3 | Gold | Hot | Hot | WIN |
| 4 | Silver | Hot | Hot | WIN |
| 5 | Blue | Hot | Hot | WIN |
| 6 | Blue | Dark | Return | WIN |
| 7 | Silver | Dark | Return | WIN |
| 8 | Gold | Dark | Dark | WIN |
| 9 | Silver | Hot | Return | WIN |
| 10 | Blue | Dark | Dark | WIN |
| 11 | Gold | Hot | Return | WIN |
| 12 | Blue | Hot | Return | WIN |
| 13 | Silver | Dark | Dark | LOSE |
| 14 | Gold | Hot | Hot | LOSE |
| 15 | Blue | Dark | Dark | LOSE |
| 16 | Gold | Hot | Return | LOSE |

### XRP Patterns (16 patterns) - Prize: $4

| No | Color | Effect1 | Effect2 | Result |
|----|-------|---------|---------|--------|
| 17 | Pink | Dark | Dark | WIN |
| 18 | Blue | Dark | Dark | WIN |
| 19 | Green | Dark | Dark | WIN |
| 20 | Blue | Dark | Return | WIN |
| 21 | Pink | Dark | Return | WIN |
| 22 | Green | Dark | Return | WIN |
| 23 | Pink | Hot | Return | WIN |
| 24 | Blue | Hot | Return | WIN |
| 25 | Blue | Dark | Return | LOSE |
| 26 | Pink | Dark | Dark | LOSE |
| 27 | Green | Dark | Dark | LOSE |
| 28 | Pink | Hot | Dark | LOSE |
| 29 | Blue | Hot | Dark | LOSE |
| 30 | Green | Hot | Hot | LOSE |
| 31 | Pink | Hot | Hot | LOSE |
| 32 | Blue | Hot | Hot | LOSE |

### TRX Patterns (18 patterns) - Prize: $3

| No | Color | Effect1 | Effect2 | Result |
|----|-------|---------|---------|--------|
| 33 | Red | Dark | Dark | WIN |
| 34 | Black | Dark | Return | WIN |
| 35 | Purple | Hot | Return | WIN |
| 36 | Purple | Hot | Hot | WIN |
| 37 | Red | Dark | Dark | LOSE |
| 38 | Black | Dark | Dark | LOSE |
| 39 | Purple | Dark | Dark | LOSE |
| 40 | Red | Hot | Dark | LOSE |
| 41 | Black | Hot | Hot | LOSE |
| 42 | Purple | Hot | Return | LOSE |
| 43 | Red | Dark | Return | LOSE |
| 44 | Black | Dark | Return | LOSE |
| 45 | Red | Hot | Hot | LOSE |
| 46 | Black | Hot | Dark | LOSE |
| 47 | Purple | Dark | Return | LOSE |
| 48 | Red | Hot | Return | LOSE |
| 49 | Black | Hot | Return | LOSE |
| 50 | Purple | Dark | Dark | LOSE |

---

## Database Schema

### Table: users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR NOT NULL,
  deposit_address VARCHAR UNIQUE NOT NULL,
  balance DECIMAL(18,6) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table: gacha_patterns

```sql
CREATE TABLE gacha_patterns (
  id INT PRIMARY KEY,
  currency VARCHAR(10) NOT NULL, -- BTC, ETH, XRP, TRX
  machine_color VARCHAR(20) NOT NULL,
  effect_1 VARCHAR(20) NOT NULL, -- Hot, Dark
  effect_2 VARCHAR(20) NOT NULL, -- Hot, Dark, Return
  base_result BOOLEAN NOT NULL, -- true=WIN, false=LOSE
  video_url VARCHAR(500) NOT NULL,
  prize_amount DECIMAL(18,6) NOT NULL
);
```

### Table: transactions

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  type VARCHAR(20) NOT NULL, -- DEPOSIT, WITHDRAWAL, PLAY, WIN, JACKPOT
  amount DECIMAL(18,6) NOT NULL,
  tx_hash VARCHAR(100),
  wallet_address VARCHAR(100),
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, CONFIRMED, FAILED
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table: gacha_history

```sql
CREATE TABLE gacha_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  pattern_id INT REFERENCES gacha_patterns(id) NOT NULL,
  final_result BOOLEAN NOT NULL,
  rtp_at_play INT NOT NULL,
  prize_amount DECIMAL(18,6) DEFAULT 0,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table: campaign_codes

```sql
CREATE TABLE campaign_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  plays_granted INT NOT NULL DEFAULT 1,
  max_uses INT NOT NULL DEFAULT 100,
  current_uses INT DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table: code_redemptions

```sql
CREATE TABLE code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  code_id UUID REFERENCES campaign_codes(id) NOT NULL,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, code_id)
);
```

### Table: system_settings

```sql
CREATE TABLE system_settings (
  key VARCHAR(50) PRIMARY KEY,
  value VARCHAR(500) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initial settings
INSERT INTO system_settings (key, value) VALUES
  ('current_rtp', '90'),
  ('jackpot_pool', '0'),
  ('operator_wallet', '0x...YOUR_WALLET_ADDRESS...');
```

### Table: admin_users

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Jackpot System

### Accumulation
- $1 from each $10 play goes to jackpot pool
- Stored in `system_settings` table (key: `jackpot_pool`)
- Displayed on TOP page with animated counter

### Triggering (Admin Only)
1. Admin opens admin panel
2. Views current jackpot amount
3. Selects winner from recent players list
4. Clicks "Trigger Jackpot" button
5. System:
   - Creates JACKPOT transaction for winner
   - Resets jackpot_pool to 0
   - Notifies winner (if online)

---

## Campaign Code System

### Admin Creates Code
```javascript
{
  code: "WELCOME2024",
  plays_granted: 3,    // User gets 3 free plays
  max_uses: 1000,      // Total redemptions allowed
  expires_at: "2024-12-31T23:59:59Z"
}
```

### User Redeems Code
1. User enters code on deposit page
2. System validates:
   - Code exists and is active
   - Not expired
   - max_uses not reached
   - User hasn't already redeemed this code
3. If valid: Add plays_granted to user's balance

---

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jackpot` | Get current jackpot amount |

### User Endpoints (Requires Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile + balance |
| GET | `/api/user/deposit-address` | Get deposit address |
| POST | `/api/user/redeem-code` | Redeem campaign code |
| GET | `/api/user/history` | Get play history |
| POST | `/api/user/withdraw` | Request withdrawal |

### Gacha Endpoints (Requires Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/gacha/play` | Execute gacha play |
| GET | `/api/gacha/result/:id` | Get specific play result |

### Admin Endpoints (Requires Admin Role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Get stats |
| GET | `/api/admin/rtp` | Get current RTP |
| PUT | `/api/admin/rtp` | Update RTP (50-99) |
| GET | `/api/admin/jackpot` | Get jackpot details |
| POST | `/api/admin/jackpot/trigger` | Trigger jackpot |
| GET | `/api/admin/codes` | List campaign codes |
| POST | `/api/admin/codes` | Create campaign code |
| PUT | `/api/admin/codes/:id` | Update code |
| DELETE | `/api/admin/codes/:id` | Deactivate code |
| GET | `/api/admin/users` | List users |
| GET | `/api/admin/users/:id` | Get user details |
| GET | `/api/admin/withdrawals` | List pending withdrawals |
| PUT | `/api/admin/withdrawals/:id` | Approve/reject withdrawal |

---

## UI/UX Design

### Color Palette

```css
:root {
  /* Backgrounds */
  --bg-primary: #0A0A0F;
  --bg-card: #1A1A24;
  --bg-card-hover: #252532;
  
  /* Accents */
  --accent-primary: #00FF88;    /* Neon Green - CTAs */
  --accent-secondary: #9945FF;  /* Neon Purple */
  --accent-win: #FFD700;        /* Gold - Win */
  --accent-jackpot: #FF1493;    /* Hot Pink - Jackpot */
  
  /* Text */
  --text-primary: #FFFFFF;
  --text-secondary: #888888;
  --text-muted: #555555;
  
  /* Currency Colors */
  --btc: #F7931A;
  --eth: #627EEA;
  --xrp: #23292F;
  --trx: #FF0013;
}
```

### Page Components

#### TOP Page
- Large "GACHAGACHA" logo (centered)
- Animated jackpot counter (prominent)
- "PLAY NOW" CTA button (neon green, pulsing)
- Minimal text, dark background
- Optional: Recent winners ticker at bottom

#### Deposit Page
- QR code for deposit address
- Address with copy button
- "$10 USDT" amount displayed
- "Or enter campaign code" input field
- "Check Payment" button

#### Waiting Page
- Animated loading spinner
- "Confirming your deposit..."
- Estimated wait time
- Transaction status updates

#### Gacha Page
- Full-screen video player
- No skip button
- Video plays automatically

#### Result Page (WIN)
- Celebration animation (confetti, glow)
- Currency icon + prize amount
- "Enter your wallet address" input
- "Claim Prize" button
- "Play Again" secondary button

#### Result Page (LOSE)
- Subtle animation
- "Better luck next time"
- "Try Again" CTA button

### Admin Panel

#### Dashboard
- Total plays (today/week/month/all)
- Revenue chart
- Current RTP display
- Jackpot pool balance
- Active users count
- Recent activity feed

#### RTP Control
- Slider (50-99%)
- Current value display
- "Update" button
- Change history log

#### Jackpot Management
- Current pool amount
- Recent players list (selectable)
- "Trigger Jackpot" button
- Jackpot history

#### Campaign Codes
- Create new code form
- Active codes list
- Usage statistics
- Activate/deactivate toggle

#### Users
- User list with search
- Click to view details
- Play history per user
- Transaction history
- Manual balance adjustment

#### Withdrawals
- Pending queue
- Approve/Reject buttons
- Enter tx_hash after sending
- History of processed withdrawals

---

## File Structure

```
gachagacha/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # TOP page
│   ├── play/
│   │   └── page.tsx                # Deposit + Waiting + Gacha
│   ├── result/
│   │   └── [id]/page.tsx           # Result page
│   ├── admin/
│   │   ├── layout.tsx              # Admin layout with sidebar
│   │   ├── page.tsx                # Dashboard
│   │   ├── rtp/page.tsx
│   │   ├── jackpot/page.tsx
│   │   ├── codes/page.tsx
│   │   ├── users/page.tsx
│   │   └── withdrawals/page.tsx
│   └── api/
│       ├── jackpot/route.ts
│       ├── user/
│       │   ├── profile/route.ts
│       │   ├── deposit-address/route.ts
│       │   ├── redeem-code/route.ts
│       │   ├── history/route.ts
│       │   └── withdraw/route.ts
│       ├── gacha/
│       │   ├── play/route.ts
│       │   └── result/[id]/route.ts
│       └── admin/
│           ├── dashboard/route.ts
│           ├── rtp/route.ts
│           ├── jackpot/
│           │   ├── route.ts
│           │   └── trigger/route.ts
│           ├── codes/
│           │   ├── route.ts
│           │   └── [id]/route.ts
│           ├── users/
│           │   ├── route.ts
│           │   └── [id]/route.ts
│           └── withdrawals/
│               ├── route.ts
│               └── [id]/route.ts
├── components/
│   ├── ui/                         # Reusable UI components
│   ├── GachaVideo.tsx
│   ├── JackpotCounter.tsx
│   ├── DepositQR.tsx
│   └── AdminSidebar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── admin.ts
│   ├── gacha/
│   │   ├── selectPattern.ts
│   │   └── applyRTP.ts
│   ├── blockchain/
│   │   └── checkDeposit.ts
│   └── utils.ts
├── types/
│   └── index.ts
└── public/
    └── videos/                     # Or use Cloudflare R2 URLs
```

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=xxx
CLOUDFLARE_R2_ACCESS_KEY_ID=xxx
CLOUDFLARE_R2_SECRET_ACCESS_KEY=xxx
CLOUDFLARE_R2_BUCKET_NAME=gachagacha-videos

# Ethereum
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/xxx
USDT_CONTRACT_ADDRESS=0xdAC17F958D2ee523a2206206994597C13D831ec7

# App
NEXT_PUBLIC_SITE_URL=https://gachagacha.com
OPERATOR_WALLET_ADDRESS=0x...
```

---

## Video File Naming Convention

Store videos in Cloudflare R2 with this naming:

```
/videos/pattern_{NO}.mp4

Examples:
/videos/pattern_01.mp4  (BTC Gold Hot Hot WIN)
/videos/pattern_02.mp4  (BTC Black Hot Hot WIN)
...
/videos/pattern_50.mp4  (TRX Purple Dark Dark LOSE)
```

---

## Security Requirements

1. **All gacha logic MUST run server-side**
2. **Use cryptographically secure random number generator**
3. **Validate all user inputs**
4. **Implement rate limiting on API endpoints**
5. **Use Supabase RLS (Row Level Security)**
6. **Admin routes require admin role verification**
7. **Never expose private keys in client code**

---

## Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Project setup (Next.js 14, TypeScript, Tailwind)
- [ ] Supabase setup (database, auth)
- [ ] Google OAuth integration
- [ ] Basic UI layout (dark theme)
- [ ] Database tables creation

### Phase 2: Core Features (Week 3-4)
- [ ] Deposit address generation
- [ ] Blockchain deposit checking
- [ ] Gacha logic implementation
- [ ] Video player integration
- [ ] RTP system
- [ ] Result page with withdrawal

### Phase 3: Admin & Extras (Week 5-6)
- [ ] Admin panel
- [ ] RTP control
- [ ] Jackpot system
- [ ] Campaign code system
- [ ] Withdrawal processing

### Phase 4: Polish & Launch (Week 7-8)
- [ ] UI/UX refinement
- [ ] Upload videos to Cloudflare R2
- [ ] Testing
- [ ] Production deployment

---

## Notes for Development

1. **Deposit Detection**: Use a webhook or polling to detect incoming USDT transfers to user deposit addresses.

2. **Video Preloading**: Preload videos during waiting screen to ensure smooth playback.

3. **Real-time Updates**: Use Supabase Realtime for jackpot counter updates.

4. **Mobile Responsive**: All pages must work on mobile devices.

5. **Error Handling**: Graceful error handling for blockchain failures, video loading issues, etc.

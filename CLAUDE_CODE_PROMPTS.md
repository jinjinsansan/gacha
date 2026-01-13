# GACHAGACHA Development Prompt for Claude Code

## Initial Setup Prompt

```
Read the GACHAGACHA_SPEC.md file first. This is a crypto gacha platform specification.

Create a new Next.js 14 project with the following setup:
- App Router
- TypeScript
- Tailwind CSS
- Supabase for database and auth

Project name: gachagacha

After creating the project, set up the following:
1. Install dependencies: @supabase/supabase-js, @supabase/ssr
2. Create the Supabase client utilities in /lib/supabase/
3. Set up the dark theme in tailwind.config.ts with the color palette from the spec
4. Create the database schema SQL file for all tables
```

---

## Phase 1: Database & Auth

```
Based on GACHAGACHA_SPEC.md, create:

1. A SQL migration file at /supabase/migrations/001_initial_schema.sql with all tables:
   - users
   - gacha_patterns
   - transactions
   - gacha_history
   - campaign_codes
   - code_redemptions
   - system_settings
   - admin_users

2. A seed file at /supabase/seed.sql that inserts:
   - All 50 gacha patterns from the spec
   - Initial system_settings (rtp=90, jackpot_pool=0)

3. Row Level Security policies for each table

4. Supabase client setup:
   - /lib/supabase/client.ts (browser client)
   - /lib/supabase/server.ts (server client)
   - /lib/supabase/admin.ts (service role client)
```

---

## Phase 2: Authentication

```
Implement Google OAuth authentication:

1. Create auth callback route at /app/auth/callback/route.ts

2. Create a middleware.ts that:
   - Refreshes session
   - Protects /play and /admin routes
   - Redirects unauthenticated users to home

3. Create login/logout functions in /lib/auth.ts

4. On first login, automatically:
   - Create user record
   - Generate unique deposit address (for now, use a placeholder format)
```

---

## Phase 3: TOP Page

```
Create the TOP page (app/page.tsx):

Requirements:
- Full dark background (#0A0A0F)
- Centered "GACHAGACHA" logo (large, bold text with glow effect)
- Jackpot counter component showing current pool (animated number)
- "PLAY NOW" button (neon green #00FF88, pulsing animation)
- Minimal design, no explanatory text

Components to create:
- /components/JackpotCounter.tsx (fetches from /api/jackpot, uses Supabase realtime)
- /components/PlayButton.tsx

The page should feel like a futuristic arcade game entrance.
```

---

## Phase 4: Play Flow - Deposit Page

```
Create the deposit page flow at /app/play/page.tsx:

This page has multiple states:

State 1: Deposit Required
- Show user's unique deposit address
- QR code for the address
- "$10 USDT (ERC-20)" text
- Copy button for address
- Campaign code input field with "Redeem" button
- "Check Payment" button

State 2: Waiting for Confirmation
- Show "Checking blockchain..." message
- Animated loading spinner
- Auto-refresh every 10 seconds
- Show transaction status when found

State 3: Ready to Play
- Show "Deposit Confirmed!" message
- Large "START GACHA" button (enabled)

API endpoints needed:
- GET /api/user/deposit-address
- POST /api/user/redeem-code
- GET /api/user/balance
```

---

## Phase 5: Gacha Logic

```
Implement the core gacha system:

1. Create /lib/gacha/selectPattern.ts:
   - Select currency based on appearance rates (BTC:2%, ETH:20%, XRP:30%, TRX:48%)
   - Select random pattern within that currency
   - Use crypto.getRandomValues() for secure randomness

2. Create /lib/gacha/applyRTP.ts:
   - Get current RTP from system_settings
   - If base_result is WIN, apply RTP modifier
   - Random < RTP = keep WIN, Random >= RTP = convert to LOSE

3. Create POST /api/gacha/play route:
   - Verify user has balance >= 1 (one play)
   - Deduct 1 from balance
   - Add $1 to jackpot_pool
   - Execute gacha logic
   - Save to gacha_history
   - Return result with video URL
```

---

## Phase 6: Video Player & Result

```
Create the gacha video and result pages:

1. /components/GachaVideo.tsx:
   - Full-screen video player
   - Autoplay, no controls
   - On video end, redirect to result page
   - Preload video during deposit confirmation

2. /app/result/[id]/page.tsx:
   - Fetch result from gacha_history by ID
   - WIN state:
     * Celebration animation (confetti, golden glow)
     * Show currency icon and prize amount
     * Wallet address input for withdrawal
     * "Claim Prize" button
     * "Play Again" secondary button
   - LOSE state:
     * Subtle animation
     * "Better luck next time" message
     * "Try Again" button (prominent)

3. POST /api/user/withdraw:
   - Validate wallet address format
   - Create WITHDRAWAL transaction (PENDING status)
   - Return success message
```

---

## Phase 7: Admin Panel - Layout & Dashboard

```
Create the admin panel:

1. Admin layout at /app/admin/layout.tsx:
   - Check if user has admin role (redirect if not)
   - Sidebar navigation:
     * Dashboard
     * RTP Control
     * Jackpot
     * Campaign Codes
     * Users
     * Withdrawals
   - Dark theme consistent with main site

2. Dashboard at /app/admin/page.tsx:
   - Stats cards:
     * Total plays (today/week/month/all)
     * Total revenue
     * Current RTP
     * Jackpot pool
     * Active users
   - Recent activity feed
   - Revenue chart (optional)

3. GET /api/admin/dashboard endpoint
```

---

## Phase 8: Admin - RTP Control

```
Create RTP control page:

1. /app/admin/rtp/page.tsx:
   - Display current RTP value
   - Slider input (range: 50-99)
   - Preview of expected win rate at current setting
   - "Update RTP" button
   - History log of RTP changes

2. API endpoints:
   - GET /api/admin/rtp
   - PUT /api/admin/rtp (validate 50-99 range)

Make sure RTP changes take effect immediately for new plays.
```

---

## Phase 9: Admin - Jackpot Management

```
Create jackpot management page:

1. /app/admin/jackpot/page.tsx:
   - Current jackpot pool amount (large display)
   - List of recent players (last 100 plays)
   - Checkbox to select winner
   - "Trigger Jackpot" button (requires selection)
   - Confirmation modal before triggering
   - Jackpot history table

2. API endpoints:
   - GET /api/admin/jackpot (pool amount + recent players)
   - POST /api/admin/jackpot/trigger (winner_user_id in body)

When triggered:
- Create JACKPOT transaction for winner
- Reset jackpot_pool to 0
- Log the event
```

---

## Phase 10: Admin - Campaign Codes

```
Create campaign code management:

1. /app/admin/codes/page.tsx:
   - "Create New Code" form:
     * Code string input
     * Plays granted (number)
     * Max uses (number)
     * Expiration date (optional)
   - Active codes table:
     * Code, plays, used/max, expires, status
     * Toggle active/inactive
     * Delete button
   - Redemption statistics

2. API endpoints:
   - GET /api/admin/codes
   - POST /api/admin/codes
   - PUT /api/admin/codes/[id]
   - DELETE /api/admin/codes/[id]
```

---

## Phase 11: Admin - Users & Withdrawals

```
Create user management and withdrawal processing:

1. /app/admin/users/page.tsx:
   - User list with search
   - Columns: Email, Balance, Plays, Joined
   - Click row to expand details:
     * Full play history
     * Transaction history
     * Manual balance adjustment form

2. /app/admin/withdrawals/page.tsx:
   - Pending withdrawals table
   - Columns: User, Amount, Address, Requested
   - Action buttons: Approve, Reject
   - On approve: Input tx_hash, mark as CONFIRMED
   - Processed withdrawals history

3. API endpoints:
   - GET /api/admin/users
   - GET /api/admin/users/[id]
   - PUT /api/admin/users/[id]/balance
   - GET /api/admin/withdrawals
   - PUT /api/admin/withdrawals/[id]
```

---

## Phase 12: Real-time Features

```
Implement real-time updates using Supabase Realtime:

1. Jackpot counter on TOP page:
   - Subscribe to system_settings changes
   - Animate number changes smoothly

2. Admin dashboard:
   - Real-time play notifications
   - Live updating stats

3. Deposit confirmation:
   - Subscribe to transactions table for user
   - Auto-update when deposit confirmed
```

---

## Phase 13: Final Polish

```
Final improvements:

1. Loading states:
   - Skeleton loaders for all data-fetching components
   - Button loading states

2. Error handling:
   - Toast notifications for errors
   - Friendly error messages
   - Retry mechanisms

3. Mobile responsiveness:
   - Test all pages on mobile viewport
   - Adjust layouts as needed

4. Animations:
   - Page transitions
   - Button hover effects
   - Win/lose celebrations

5. SEO:
   - Meta tags
   - Open Graph images
   - Favicon
```

---

## Testing Checklist

```
Before deployment, test:

[ ] User can sign in with Google
[ ] User sees unique deposit address
[ ] Campaign code redemption works
[ ] Balance updates correctly
[ ] Gacha video plays smoothly
[ ] RTP affects win rate correctly
[ ] Withdrawals can be requested
[ ] Admin can adjust RTP
[ ] Admin can trigger jackpot
[ ] Admin can create campaign codes
[ ] Admin can process withdrawals
[ ] Real-time jackpot updates work
[ ] Mobile layout looks good
[ ] All error states handled
```

---

## Quick Commands Reference

```bash
# Start development
npm run dev

# Generate Supabase types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts

# Deploy to Vercel
vercel --prod

# Run database migrations
npx supabase db push
```

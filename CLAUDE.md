# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About

Habits is a premium SaaS web app helping people build consistent daily routines. The design philosophy is **"quiet, premium, low-stimulus"** - intentional and restrained interfaces that let users focus on what matters. Features cloud sync, subscription tiers, and a founding member program with lifetime access.

**Production URL**: https://habit-psi.vercel.app

## Commands

```bash
cd habits-app && npm run dev      # Start dev server (Vite) - localhost:5173
cd habits-app && npm run build    # TypeScript check + production build
cd habits-app && npm run lint     # ESLint
cd habits-app && npm run preview  # Preview production build
```

## Tech Stack

- **React 19** with TypeScript
- **Vite 7** for bundling
- **Tailwind CSS 4** (via PostCSS, `darkMode: 'class'`)
- **Framer Motion** for animations
- **Lucide React** for icons
- **Supabase** for auth, database, storage, and realtime
- **Stripe** for payments (via Edge Functions)
- **jsPDF** for PDF report generation

## Architecture

```
habits-app/
├── src/
│   ├── App.tsx                    # Root component with routing
│   ├── main.tsx                   # Entry point
│   ├── index.css                  # Design system + Tailwind
│   ├── types/index.ts             # TypeScript types
│   ├── contexts/
│   │   ├── AuthContext.tsx        # Auth state, profile updates, avatar upload
│   │   ├── HabitsContext.tsx      # Habit CRUD, completions, streaks
│   │   ├── SubscriptionContext.tsx # Subscription status, Stripe integration
│   │   └── ThemeContext.tsx       # Light/dark theme
│   ├── hooks/
│   │   └── useDiamondSpots.ts     # Founding member slot management
│   ├── components/
│   │   ├── Pages/
│   │   │   ├── LandingPage.tsx    # Marketing page with pricing
│   │   │   ├── AuthPage.tsx       # Login/signup with founding claim
│   │   │   ├── Dashboard.tsx      # Main habit tracking view
│   │   │   ├── Calendar.tsx       # Month view
│   │   │   ├── Stats.tsx          # Analytics & streak history
│   │   │   └── Settings.tsx       # User preferences, admin panel
│   │   ├── Modals/
│   │   │   ├── AddHabitModal.tsx        # Create habit
│   │   │   ├── EditHabitModal.tsx       # Edit habit
│   │   │   ├── PaywallModal.tsx         # Upgrade prompt
│   │   │   ├── FoundingCelebration.tsx  # Epic confetti celebration
│   │   │   ├── FeedbackModal.tsx        # User feedback/bug reports
│   │   │   ├── ConsistencyReport.tsx    # PDF report preview
│   │   │   └── TermsModal.tsx           # T&C acceptance
│   │   ├── Reusable/
│   │   │   ├── HabitCard.tsx      # Single habit with toggle
│   │   │   ├── WeekView.tsx       # Date selector with dots
│   │   │   ├── CompletionDots.tsx # Visual completion indicators
│   │   │   ├── GlobalStreak.tsx   # Streak counter with emoji
│   │   │   └── Navigation.tsx     # Bottom nav bar
│   │   └── Admin/
│   │       └── AdminFeedbackView.tsx  # Admin feedback management
│   └── utils/
│       ├── supabase.ts            # Supabase client
│       ├── stripe.ts              # Stripe integration
│       ├── dateUtils.ts           # Date formatting, streak calculation
│       ├── storage.ts             # localStorage wrapper
│       ├── reportGenerator.ts     # PDF report generation
│       ├── avatarUtils.ts         # Avatar validation
│       └── motivationalMessages.ts # Progress-based messages
├── supabase/
│   ├── migrations/                # SQL migrations (3 files)
│   ├── functions/                 # Edge Functions (Stripe)
│   │   ├── stripe-webhook/        # Handle Stripe events
│   │   ├── create-checkout-session/
│   │   └── create-portal-session/
│   └── email-templates/           # Custom auth emails
├── public/
│   └── og-image.png               # Social media preview
└── index.html                     # Entry HTML with OG meta tags
```

## Subscription Tiers

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Up to 3 habits, daily/weekly views, local storage |
| **Pro** | $9/month | Unlimited habits, cloud sync, PDF reports |
| **Diamond** | $0 (Lifetime) | All Pro features forever, founding member exclusive |

### Founding Member System

Limited slots (currently 5) for lifetime Diamond access:
- Auto-claimed on signup if spots available
- Epic celebration modal with confetti animation
- Managed via `founding_slots` table and RPC functions
- Admin can view/revoke in Settings (jonas@jonasinfocus.com only)

## Database Schema (Supabase)

### Tables

```sql
-- User subscription data
user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  stripe_customer_id TEXT UNIQUE,
  subscription_status TEXT, -- 'free' | 'active' | 'canceled' | 'past_due' | 'diamond'
  subscription_id TEXT,
  price_id TEXT,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN
)

-- User habits
habits (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  name TEXT,
  color TEXT,
  frequency TEXT, -- 'daily' | 'weekly' | 'custom'
  custom_days JSONB -- {monday: true, tuesday: false, ...}
)

-- Habit completions
completions (
  id UUID PRIMARY KEY,
  user_id UUID,
  habit_id UUID REFERENCES habits,
  date TEXT -- YYYY-MM-DD format
)

-- Founding member slots
founding_slots (
  id UUID PRIMARY KEY,
  claimed_by_user_id UUID REFERENCES auth.users,
  claimed_at TIMESTAMPTZ
)

-- User feedback/bug reports
user_feedback (
  id UUID PRIMARY KEY,
  user_id UUID,
  user_email TEXT,
  type TEXT, -- 'feedback' | 'bug'
  priority TEXT, -- 'fyi' | 'minor' | 'important' | 'critical'
  title TEXT,
  message TEXT,
  status TEXT, -- 'open' | 'in_progress' | 'resolved'
  page TEXT,
  platform TEXT,
  app_version TEXT
)

-- Streak history
broken_streaks (
  id UUID PRIMARY KEY,
  user_id UUID,
  habit_id UUID,
  streak_length INT,
  broken_date DATE
)
```

### RPC Functions

```sql
-- Founding slots
get_founding_slots_remaining() -> INTEGER
get_founding_slots_total() -> INTEGER
claim_founding_slot(user_id UUID) -> {success, error, message}
get_founding_users_info() -> [{user_id, email, display_name, claimed_at}]
revoke_founding_status(target_user_id UUID) -> {success, error, message}

-- User helpers
is_subscribed(user_uuid UUID) -> BOOLEAN
is_feedback_admin() -> BOOLEAN
```

### Storage Buckets

- `avatars` - User profile images (2MB max, public)

## Key Patterns

### State Management

Four React Contexts with custom hooks:

```typescript
const { user, signOut, updateDisplayName, uploadAvatar } = useAuth();
const { habits, addHabit, toggleCompletion, isCompleted } = useHabits();
const { isPro, isDiamond, hasPremiumAccess, openCheckout } = useSubscription();
const { theme, toggleTheme } = useTheme();
```

### Subscription Checking

```typescript
// In components
const { hasPremiumAccess, isDiamond, isPro } = useSubscription();

// hasPremiumAccess = isPro || isDiamond (use for feature gating)
if (!hasPremiumAccess) {
  setShowPaywall(true);
}
```

### Habit Limit (Free Tier)

```typescript
const { habitLimitReached } = useHabits();
// Returns true if !hasPremiumAccess && habits.length >= 3
```

### Optimistic Updates

```typescript
// Toggle completion updates UI immediately, syncs to server in background
await toggleCompletion(habitId, date);
// If server fails, UI reverts automatically
```

### Founding Slot Claim Flow

```typescript
// In AuthPage.tsx after signup
const { spotsRemaining } = useDiamondSpots();
if (spotsRemaining > 0) {
  const result = await claimFoundingSlot(userId);
  if (result.success) {
    setShowFoundingCelebration(true); // Epic confetti modal
  }
}
```

## Environment Variables

```bash
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_STRIPE_MONTHLY_PRICE_ID=price_...
VITE_STRIPE_ANNUAL_PRICE_ID=price_...

# Edge Functions (in Supabase dashboard)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Admin Features

Admin email: `jonas@jonasinfocus.com`

- **Founding Slots Management**: View claimed slots, user info, revoke status
- **User Feedback**: View/filter feedback, add internal notes, mark resolved
- Located in Settings.tsx, gated by email check

## Key Components

### FoundingCelebration.tsx
Epic celebration modal with:
- 60 confetti particles with physics
- Animated diamond icon with glow rings
- Gradient text animation
- Feature unlock display

### FeedbackModal.tsx
3-step wizard:
1. Select type (Feedback/Bug)
2. Select priority (FYI/Minor/Important/Critical)
3. Enter title and description

### PaywallModal.tsx
Shows when free user hits limits:
- Feature comparison table
- Monthly/annual pricing toggle
- Redirects to Stripe checkout

## Stripe Integration

### Edge Functions

```typescript
// create-checkout-session - Creates Stripe checkout
// create-portal-session - Opens billing portal
// stripe-webhook - Handles subscription events:
//   - customer.subscription.created/updated/deleted
//   - invoice.payment_succeeded
```

### Webhook Flow
1. Stripe sends event to Edge Function
2. Function updates `user_profiles.subscription_status`
3. SubscriptionContext receives realtime update
4. UI updates automatically

---

# UI/UX Design System Guide

## Design Philosophy

**"Quiet, Premium, Low-Stimulus"**

1. **Restraint over decoration** - No unnecessary visual elements
2. **Typography-first hierarchy** - Size and weight create hierarchy
3. **Minimal color palette** - Dark backgrounds with single accent
4. **Glass morphism** - Frosted surfaces create depth
5. **Smooth, subtle motion** - 200-400ms transitions
6. **High contrast** - Accessibility through clear contrast

## Color System

### CSS Variables (Dark Mode Default)

```css
--bg-primary: #0B0B0B          /* Main background */
--bg-secondary: #141414        /* Cards, containers */
--bg-tertiary: #181818         /* Elevated surfaces */
--accent: #E85D4F              /* Primary action (coral) */
--text-primary: #F5F5F5        /* Headlines */
--text-secondary: #A0A0A0      /* Body text */
--text-muted: #6F6F6F          /* Metadata */
```

### Diamond/Founding Accent

```css
/* Cyan gradient for founding member elements */
background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(139, 92, 246, 0.15));
border: 1px solid rgba(6, 182, 212, 0.25);
color: #22d3ee;
```

### Habit Color Palette

```typescript
const HABIT_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#06b6d4'
];
```

## Typography System

| Class | Size | Weight | Use For |
|-------|------|--------|---------|
| `.text-hero` | 34px | 600 | Landing headlines |
| `.text-display` | 32px | 600 | Page titles |
| `.text-section-header` | 22px | 500 | Section headers |
| `.text-title` | 18px | 500 | Modal headers |
| `.text-body-main` | 15px | 400 | Body text |
| `.text-metadata` | 12px | 500 | Labels (uppercase) |
| `.stat-number` | 64px | 500 | Large statistics |

## Animation Patterns

```typescript
// Standard easing for all animations
const EASE = [0.32, 0.72, 0, 1];

// Page transitions
initial={{ opacity: 0 }}
animate={{ opacity: 1, transition: { duration: 0.2 } }}
exit={{ opacity: 0, transition: { duration: 0.15 } }}

// List stagger
transition={{ delay: index * 0.05 }}

// Interactive feedback
whileTap={{ scale: 0.95 }}
whileHover={{ scale: 1.02 }}
```

## Modal Pattern

```jsx
<AnimatePresence>
  {isOpen && (
    <>
      <motion.div className="liquid-glass-backdrop" onClick={onClose} />
      <motion.div className="liquid-glass-modal">
        {/* Header with close button */}
        {/* Content */}
        {/* Action buttons */}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

## Component Checklist

When building new components:

- [ ] Uses CSS variables for colors
- [ ] Follows typography class hierarchy
- [ ] Has Framer Motion entrance animation
- [ ] Uses `whileTap` for interactive elements
- [ ] Has proper loading/error states
- [ ] Uses `AnimatePresence` for conditional content
- [ ] Respects 4px spacing increments
- [ ] Handles `hasPremiumAccess` for paywalled features

## Quick Reference

| Element | Class/Pattern |
|---------|---------------|
| Page title | `.text-display` |
| Primary button | `.btn-pill-primary` |
| Secondary button | `.btn-pill-secondary` |
| Text input | `.liquid-glass-input` |
| Modal wrapper | `.liquid-glass-modal` |
| Accent color | `var(--accent)` / `#E85D4F` |
| Diamond accent | `#22d3ee` / `#06b6d4` |
| Animation ease | `[0.32, 0.72, 0, 1]` |
| Tap feedback | `whileTap={{ scale: 0.95 }}` |

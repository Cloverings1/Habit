# Habits

A calm habit tracking app with a premium, low-stimulus design.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Tech Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- Framer Motion
- Supabase (Auth, Database, Storage, Realtime)
- Stripe (Payments)

## Environment Variables

Create `.env.local`:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
VITE_STRIPE_MONTHLY_PRICE_ID=price_xxx
VITE_STRIPE_ANNUAL_PRICE_ID=price_xxx
```

## Project Structure

```
src/
├── components/     # React components
├── contexts/       # State management (Auth, Habits, Subscription, Theme)
├── hooks/          # Custom hooks (useDiamondSpots)
├── utils/          # Helpers (date, storage, stripe, etc.)
└── types/          # TypeScript definitions

supabase/
├── migrations/     # Database schema
├── functions/      # Edge Functions (Stripe webhooks)
└── email-templates/ # Auth email templates
```

## Features

- **Habit Tracking**: Daily, weekly, or custom schedules
- **Streak Tracking**: Current and longest streaks with motivational messages
- **Calendar View**: Monthly progress visualization
- **Cloud Sync**: Real-time sync across devices
- **Subscription Tiers**: Free (3 habits), Pro ($9/mo), Diamond (Lifetime)
- **Founding Members**: Limited lifetime access slots
- **PDF Reports**: Export consistency reports (Pro+)

## Scripts

```bash
npm run dev       # Development server
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview build
```

## Documentation

See [CLAUDE.md](../CLAUDE.md) for comprehensive documentation including:
- Architecture details
- Database schema
- Design system
- Component patterns

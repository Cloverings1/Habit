# Habits App - Internal Updates

A running log of what's been shipped. Written by Jonas.

---

## December 23, 2025

### Founding Member System (Major Feature)

Built out a complete founding member system with limited lifetime access slots.

**What was built:**
- `founding_slots` table with 5 pre-allocated slots
- Auto-claim on signup via `claim_founding_slot()` RPC function
- Real-time slot availability using Supabase subscriptions
- Epic celebration modal (`FoundingCelebration.tsx`) with:
  - 60 confetti particles with physics
  - Animated diamond icon with glow rings
  - Gradient text animation
  - Feature unlock display
- `useDiamondSpots` hook for managing slot state
- Admin panel in Settings to view claimed slots and revoke status

**Files:**
- `src/hooks/useDiamondSpots.ts` (new)
- `src/components/FoundingCelebration.tsx` (new)
- `src/components/AuthPage.tsx` (modified - auto-claim flow)
- `src/components/LandingPage.tsx` (modified - spots display)
- `src/components/Settings.tsx` (modified - admin panel)

---

### User Feedback System

Added ability for users to submit feedback and bug reports.

**What was built:**
- 3-step wizard modal (Type → Priority → Details)
- `user_feedback` table with RLS policies
- Admin-only view for managing feedback
- Filter by type, priority, status
- Internal notes and resolution tracking

**Files:**
- `src/components/FeedbackModal.tsx` (new)
- `src/components/AdminFeedbackView.tsx` (new)
- `supabase/migrations/003_add_user_feedback.sql` (new)

---

### Diamond Plan Display

Fixed Settings page to properly show Diamond status for founding members.

**What was fixed:**
- Added `isDiamond` and `hasPremiumAccess` from SubscriptionContext
- Settings now shows "Diamond Plan" with cyan "Lifetime Access" badge
- Premium features (PDF export) properly gated by `hasPremiumAccess`
- Removed "Upgrade to Pro" button for Diamond users

---

### Mobile Optimization

Made the landing page mobile-responsive.

**What was changed:**
- Responsive padding: `px-4 sm:px-6`, `py-6 sm:py-10`
- Responsive typography: `text-[28px] sm:text-[34px]`
- Founding spots pill repositioned: `mt-2 sm:-mt-4`
- Pricing grid: single column on mobile

---

### Signup Flow Improvement

All CTA buttons now go directly to signup instead of login.

**What was changed:**
- Added `?mode=signup` URL parameter support to AuthPage
- Updated all landing page buttons to use `/login?mode=signup`
- "Sign In" button kept at `/login` for returning users

---

### Open Graph Meta Tags

Added social media preview support.

**What was added:**
- `og-image.png` in public folder
- OG meta tags in `index.html`
- Twitter Card meta tags
- Updated page title: "Habits - Build habits gently"

---

## December 22, 2025

### Security Lockdown (Critical)

Finally did a proper security audit before inviting friends to beta. Found some scary stuff - **RLS was disabled on the main tables**. This meant any logged-in user could technically see everyone else's habits. Fixed immediately.

**What was fixed:**
- Enabled Row Level Security on `habits` table
- Enabled Row Level Security on `completions` table
- Enabled Row Level Security on `profiles` table
- Fixed 3 database functions that had security warnings
- Each user's data is now completely isolated at the database level

**Added trust signals:**
- Landing page hero: "Private & encrypted" with lock icon
- Landing page footer: "Your data is isolated and protected with row-level security"
- Login page: Added header with back-to-home navigation + "Secure login" indicator
- Login page: Added footer with security message + Privacy/Terms links

---

### Fixed "Create Habit" Bug

The create habit button wasn't working. Clicked it, filled everything in, hit create... nothing happened. Super frustrating.

**Root cause:**
1. Code was sending a `customDays` field to Supabase but that column didn't exist in the database
2. The error was being silently swallowed because the submit handler wasn't using async/await properly
3. Modal was closing before the API call finished, so it looked like nothing happened

**What was fixed:**
- Added `custom_days` column to the habits table in Supabase
- Fixed all the snake_case/camelCase mismatches between frontend and database
- Made the form submission properly async with try/catch
- Added loading state ("Creating...") so users know something's happening
- Added error display if something goes wrong
- Button now stays disabled while submitting

---

### Home Page Revamp

Made the dashboard feel like an actual product instead of a prototype.

**New features:**
- **Global streak indicator** - Shows your overall streak with a fire emoji (or sleeping emoji when you're at 0)
- **Progress indicator** - "Today: 2/3" so you know how many habits you've done
- **Motivational messages** - Short, punchy quotes that change based on your progress. Alex Hormozi / Tony Robbins style. Things like "Your future self is watching" and "Momentum is building. Keep going."
- **Completion dots on week view** - Each day shows colored dots for which habits you completed
- **Completion dots on calendar** - Same thing but for the full calendar view. Dots overlap if you have more than 3 habits.
- **Celebration animation** - Quick toast + confetti particles when you complete a habit
- **"My Habits" section header** - Shows the count of habits you have
- **Better empty state** - Pulsing cyan button with motivating copy to get people started
- **Add habit button pulse** - Calm, slow cyan pulse animation when you have no habits yet

**Code quality:**
- Created reusable `CompletionDots` component
- Created `GlobalStreak` component
- Added `getCompletedHabitsForDate` to context to avoid duplicate logic
- Fixed timezone bug in streak calculation (was using raw milliseconds, now uses proper date arithmetic)
- Extracted shared streak calculation logic to keep things DRY

---

## Status

Alpha launch complete. Founding member system live. Security is solid, core features work, UI feels polished.

**Current state:**
- 5 founding slots (3 remaining)
- Admin: jonas@jonasinfocus.com
- Production: https://habit-psi.vercel.app

**Architecture:**
- React 19 + TypeScript + Vite 7
- Supabase (Auth, DB, Storage, Realtime)
- Stripe (Edge Functions for webhooks)
- Tailwind CSS 4 + Framer Motion

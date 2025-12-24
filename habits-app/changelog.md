# Changelog

All notable changes to Habits will be documented in this file.

---

## December 23, 2025

### Mobile Optimization & UX Improvements
- Optimized landing page for mobile devices (responsive spacing, typography)
- Updated all CTA buttons to navigate directly to signup
- Added `?mode=signup` URL parameter support for direct signup flow
- Fixed founding spots pill positioning on mobile

### Diamond Plan Display Fix
- Settings now correctly shows "Diamond Plan" for founding members
- Added "Lifetime Access" badge for Diamond users
- Premium features (PDF export, unlimited habits) now properly gated by `hasPremiumAccess`

### Open Graph Meta Tags
- Added OG image for social media/iMessage link previews
- Updated page title to "Habits - Build habits gently"
- Added meta description for SEO

### Founding Member System
- Implemented founding slots with auto-claim on signup
- Epic celebration modal with 60 confetti particles
- Admin panel for viewing/revoking founding status
- Real-time slot availability display

### User Feedback System
- 3-step feedback/bug report wizard
- Priority levels: FYI, Minor, Important, Critical
- Admin view for managing feedback (jonas@jonasinfocus.com)

### Alpha Launch
**9:38 AM CST**

Habits app is going into alpha. After weeks of building in private, we're finally ready to share this with a small group of friends.

**What's included:**
- Core habit tracking with daily, weekly, and custom schedules
- Streak tracking with motivational messages
- Calendar view for monthly progress
- Stats dashboard with completion analytics
- Cloud sync across devices
- Row-level security for complete data privacy

*Here we go.*

---

## December 22, 2025

### Security Lockdown
Critical security audit completed. Enabled row-level security on all tables. Your data is now completely isolated at the database level.

### Create Habit Fix
Fixed a bug where creating habits would silently fail. Added proper error handling and loading states.

### Dashboard Revamp
- Global streak indicator
- Progress tracking ("Today: 2/3")
- Motivational messages
- Celebration animations on habit completion
- Completion dots on calendar and week view

---

## December 21, 2025

### Foundation
Initial build with authentication, habit CRUD operations, and basic UI. Dark mode aesthetic with liquid glass design system.

---

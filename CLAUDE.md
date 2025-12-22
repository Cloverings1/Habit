# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About

Habits is a SaaS web app helping people master their routines and build daily dependability. The design philosophy is "quiet, premium, low-stimulus" - intentional and restrained interfaces that let users focus on what matters.

## Commands

```bash
cd habits-app && npm run dev      # Start dev server (Vite)
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
- **Supabase** for auth (email/password)
- **localStorage** for habit data persistence

## Architecture

```
habits-app/src/
├── App.tsx              # Root component with view routing
├── main.tsx             # Entry point
├── index.css            # Design system + Tailwind
├── types/index.ts       # TypeScript types
├── contexts/
│   ├── HabitsContext.tsx  # Habits state (CRUD, completions, streaks)
│   └── ThemeContext.tsx   # Light/dark theme
├── components/
│   ├── LandingPage.tsx    # Marketing page with pricing
│   ├── AuthPage.tsx       # Login/signup (Supabase)
│   ├── Dashboard.tsx      # Main habit tracking view
│   ├── Calendar.tsx       # Month view
│   ├── Stats.tsx          # Analytics (streaks, completion rates)
│   ├── Settings.tsx       # User preferences
│   ├── Sidebar.tsx        # Navigation
│   ├── HabitCard.tsx      # Stacked card UI for habits
│   ├── WeekView.tsx       # Date strip selector
│   └── AddHabitModal.tsx  # Habit creation modal
└── utils/
    ├── storage.ts         # localStorage wrapper (import/export)
    ├── supabase.ts        # Supabase client
    └── dateUtils.ts       # Date formatting, streak calculation
```

## Key Patterns

**State**: React Context (`useHabits`, `useTheme` hooks). Habits sync to localStorage on every change.

**Data Model**:
- `Habit`: id, name, color, createdAt, recurrence (daily/weekly/custom), customDays
- `CompletedDay`: habitId + date (YYYY-MM-DD)
- Dates stored as ISO strings, compared using YYYY-MM-DD format

**Navigation**: Simple `ViewType` union for in-app views. LandingPage/AuthPage use react-router-dom.

**Theme**: Dark mode default. Class `light` applied to `document.documentElement` for light mode.

## Design System

CSS classes defined in `index.css` following "liquid glass" aesthetic:

- **Layout**: `.app-layout`, `.main-content`, `.sidebar`
- **Typography**: `.text-hero`, `.text-display`, `.text-section-header`, `.text-metadata`
- **Buttons**: `.btn-pill-primary`, `.btn-pill-secondary`, `.btn-ghost`
- **Cards**: `.habit-card`, `.card-pill`, `.card-rounded`
- **Modal**: `.liquid-glass-modal`, `.liquid-glass-backdrop`, `.liquid-glass-input`
- **Stats**: `.stat-number`, `.stat-label`, `.progress-bar`

CSS variables: `--bg-primary`, `--bg-secondary`, `--accent` (#E85D4F), `--text-primary`, `--text-secondary`, `--text-muted`

## Environment Variables

Required for Supabase auth:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Pricing Tiers

- **Free**: Up to 3 habits, daily/weekly views, local storage
- **Pro** ($9/mo): Unlimited habits, cloud sync, advanced analytics

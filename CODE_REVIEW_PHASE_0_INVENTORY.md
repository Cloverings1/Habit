# CODE REVIEW - PHASE 0: INVENTORY

**Date**: 2025-01-XX  
**Reviewer**: Codex Engineering Team  
**Scope**: Complete end-to-end code review + validation pass (Stripe/billing OUT OF SCOPE)

---

## A) FEATURE MAP

### Routes & Components

| Route | Component | Purpose | Auth Required | Access Check |
|-------|-----------|---------|---------------|--------------|
| `/` | `LandingPage` | Marketing/pricing page | No | None |
| `/login` | `AuthPage` | Signup/login | No | Redirects if authenticated |
| `/app` | `AppLayout` → `Dashboard` | Main habit tracking | Yes | `TrialGuard` (allows all, paywall on interaction) |
| `/app/habit/:id` | `HabitDetail` | Habit analytics | Yes | `TrialGuard` |
| `/app` (stats) | `Stats` | Analytics dashboard | Yes | `TrialGuard` |
| `/app` (calendar) | `Calendar` | Month view | Yes | `TrialGuard` |
| `/app` (settings) | `Settings` | User preferences, admin | Yes | `TrialGuard` |
| `/billing/return` | `BillingReturnPage` | Stripe checkout return | Yes | None |
| `/privacy` | `PrivacyPage` | Privacy policy | No | None |
| `/terms` | `TermsPage` | Terms of service | No | None |
| `/release-notes` | `ReleaseNotesPage` | Changelog | No | None |
| `/status` | `StatusPage` | Health check | No | None |

### Core Features

#### 1. Authentication & User Management
- **Location**: `src/contexts/AuthContext.tsx`, `src/components/AuthPage.tsx`
- **Supabase Tables**: `auth.users` (Supabase Auth)
- **Storage Buckets**: `avatars` (public, 2MB limit)
- **Operations**:
  - Signup/login (email/password, magic link)
  - Sign out
  - Update display name (stored in `user_metadata.display_name`)
  - Update email
  - Update password
  - Upload avatar (validated: PNG/JPG/WebP, 2MB max, stored in `avatars/{user_id}/avatar-{timestamp}.{ext}`)

#### 2. Habit Management
- **Location**: `src/contexts/HabitsContext.tsx`, `src/components/Dashboard.tsx`, `src/components/HabitCard.tsx`, `src/components/AddHabitModal.tsx`, `src/components/EditHabitModal.tsx`
- **Supabase Tables**: `habits`, `completions`
- **Operations**:
  - Create habit (name, color, frequency: daily/weekly/custom, custom days)
  - Edit habit (name, color, frequency, custom days)
  - Delete habit
  - Archive/unarchive habit
  - Toggle completion (optimistic updates)
  - View habits (filtered by `archived` flag)
  - View completions by date/habit

#### 3. Analytics & Stats
- **Location**: `src/components/Stats.tsx`, `src/components/Analytics/HabitDetail.tsx`, `src/components/Analytics/GlobalConsistency.tsx`, `src/components/Analytics/GlobalHeatmap.tsx`
- **Supabase Tables**: `habits`, `completions`, `broken_streaks`
- **Operations**:
  - Calculate streaks (habit-specific, global)
  - Week completion count
  - Consistency metrics
  - Heatmap visualization
  - Habit detail analytics

#### 4. Calendar View
- **Location**: `src/components/Calendar.tsx`, `src/components/MonthGrid.tsx`
- **Supabase Tables**: `habits`, `completions`
- **Operations**:
  - Month view with completion dots
  - Navigate months
  - Click date to view completions

#### 5. User Feedback
- **Location**: `src/components/FeedbackModal.tsx`, `src/components/AdminFeedbackView.tsx`
- **Supabase Tables**: `user_feedback`
- **Operations**:
  - Submit feedback/bug report (type, priority, message, metadata)
  - Admin view/manage feedback (admin only: `jonas@jonasinfocus.com`)

#### 6. Settings & Profile
- **Location**: `src/components/Settings.tsx`
- **Supabase Tables**: `auth.users` (metadata), `user_entitlements`, `founding_slots` (admin)
- **Operations**:
  - Update display name
  - Update email
  - Update password
  - Upload avatar
  - View subscription status (via `useEntitlement`)
  - Reset all habits (deletes habits, completions, broken_streaks)
  - Admin: View/manage founding slots
  - Admin: View/manage user feedback

#### 7. PDF Report Generation
- **Location**: `src/components/ConsistencyReport.tsx`, `src/utils/reportGenerator.ts`
- **Supabase Tables**: `habits`, `completions`
- **Operations**:
  - Generate PDF report (jsPDF)
  - Preview before download

#### 8. Trial & Access Control
- **Location**: `src/components/TrialGuard.tsx`, `src/components/TrialBanner.tsx`, `src/components/TrialExpiredModal.tsx`, `src/components/PaywallModal.tsx`
- **Supabase Tables**: `user_entitlements`
- **Operations**:
  - Check access (`hasAccess` from `useEntitlement`)
  - Show paywall on interaction if no access
  - Trial banner (shows during active trial)
  - Trial expired modal

---

## B) DATA MAP

### Database Tables

#### Core Tables (User Data - Tenant-Scoped)

| Table | Primary Key | Tenant Key | RLS Enabled | Purpose |
|-------|-------------|------------|-------------|---------|
| `habits` | `id` (UUID) | `user_id` | ✅ Yes | Habit definitions |
| `completions` | `id` (UUID) | `user_id` | ✅ Yes | Daily completions |
| `broken_streaks` | `id` (UUID) | `user_id` | ✅ Yes | Streak break history |

**Note**: `habits` and `completions` tables are referenced in migrations but CREATE TABLE statements are missing. They must exist in production but schema is not version-controlled.

#### Subscription/Billing Tables

| Table | Primary Key | Tenant Key | RLS Enabled | Purpose |
|-------|-------------|------------|-------------|---------|
| `user_profiles` | `id` (UUID) | `id` | ✅ Yes | Legacy subscription data (Stripe) |
| `user_entitlements` | `user_id` (UUID) | `user_id` | ✅ Yes | Current subscription system (plan, status, trial dates) |
| `billing_customers` | `user_id` (UUID) | `user_id` | ✅ Yes | Stripe customer mapping |
| `founding_slots` | `id` (UUID) | N/A (admin) | ✅ Yes | Founding member slots (5 total) |

#### Admin/System Tables

| Table | Primary Key | Tenant Key | RLS Enabled | Purpose |
|-------|-------------|------------|-------------|---------|
| `user_feedback` | `id` (UUID) | `user_id` | ✅ Yes | User feedback/bug reports |
| `processed_webhook_events` | `id` (TEXT) | N/A | ✅ Yes | Stripe webhook idempotency |

### Storage Buckets

| Bucket | Public | Max Size | Allowed Types | Tenant Isolation |
|--------|--------|---------|--------------|------------------|
| `avatars` | ✅ Yes | 2MB | PNG, JPEG, JPG, WebP | ✅ Yes (folder = `{user_id}/`) |

### RLS Policies Summary

#### `habits` Table
- **SELECT**: `auth.uid() = user_id` ✅
- **INSERT**: `auth.uid() = user_id AND has_subscription_access(auth.uid())` ✅
- **UPDATE**: `auth.uid() = user_id AND has_subscription_access(auth.uid())` ✅
- **DELETE**: `auth.uid() = user_id` ✅

#### `completions` Table
- **SELECT**: `auth.uid() = user_id` ✅
- **INSERT**: `auth.uid() = user_id AND has_subscription_access(auth.uid())` ✅
- **UPDATE**: `auth.uid() = user_id` ✅
- **DELETE**: `auth.uid() = user_id` ✅

#### `broken_streaks` Table
- **SELECT**: `auth.uid() = user_id` ✅
- **INSERT**: `auth.uid() = user_id` ✅
- **DELETE**: `auth.uid() = user_id` ✅

#### `user_entitlements` Table
- **SELECT**: `auth.uid() = user_id` ✅
- **INSERT**: `auth.uid() = user_id AND plan = 'none' AND status = 'none'` ✅ (constrained)
- **UPDATE**: ❌ **NO POLICY** (service role only) ✅
- **DELETE**: ❌ **NO POLICY** (service role only) ✅

#### `billing_customers` Table
- **SELECT**: `auth.uid() = user_id` ✅
- **INSERT**: `auth.uid() = user_id` ✅
- **UPDATE**: ❌ **NO POLICY** (service role only) ✅
- **DELETE**: ❌ **NO POLICY** (service role only) ✅

#### `user_feedback` Table
- **SELECT**: Admin only (`email = 'jonas@jonasinfocus.com'`) ✅
- **INSERT**: `auth.uid() = user_id` ✅
- **UPDATE**: Admin only ✅
- **DELETE**: ❌ **NO POLICY** (intentional - feedback cannot be deleted)

#### `founding_slots` Table
- **SELECT**: All authenticated users ✅ (public read for slot counts)
- **INSERT/UPDATE/DELETE**: Service role only ✅

#### `processed_webhook_events` Table
- **ALL OPERATIONS**: Service role only ✅

### RPC Functions

| Function | Purpose | Access | Security |
|----------|---------|--------|----------|
| `has_subscription_access(user_uuid UUID)` | Check if user has active access | `authenticated` | ✅ Reads `user_entitlements` |
| `is_trial_expired(user_uuid UUID)` | Check if trial expired | `authenticated` | ✅ Reads `user_entitlements` |
| `is_subscribed(user_uuid UUID)` | Legacy subscription check | `authenticated` | ⚠️ Reads `user_profiles` (legacy) |
| `has_pro_access(user_uuid UUID)` | Check Pro/Founding access | `authenticated` | ✅ Reads `user_entitlements` |
| `get_founding_slots_remaining()` | Count unclaimed slots | `authenticated` | ✅ Public read |
| `get_founding_slots_total()` | Count total slots | `authenticated` | ✅ Public read |
| `claim_founding_slot(user_uuid UUID)` | Claim founding slot | ❌ **REVOKED** | ✅ Only service role |
| `is_feedback_admin()` | Check if admin | `authenticated` | ✅ Email check |
| `is_admin()` | Check if admin | `authenticated` | ✅ Email check |
| `get_all_users_with_entitlements()` | Admin user list | `authenticated` | ✅ Admin only |
| `admin_update_user_plan(...)` | Admin update plan | `authenticated` | ✅ Admin only |
| `admin_cancel_user_plan(...)` | Admin cancel plan | `authenticated` | ✅ Admin only |
| `is_webhook_event_processed(event_id TEXT)` | Check webhook idempotency | `service_role` | ✅ |
| `mark_webhook_event_processed(...)` | Mark webhook processed | `service_role` | ✅ |

### Realtime Subscriptions

| Channel Pattern | Table | Filter | Purpose |
|----------------|-------|--------|---------|
| `user_entitlements:{user_id}` | `user_entitlements` | `user_id=eq.{user_id}` | Update entitlement state |
| `user_profiles:{user_id}` | `user_profiles` | `id=eq.{user_id}` | Update subscription state (legacy) |

---

## C) PRIVILEGED OPERATIONS

### Client-Side Operations (Require Auth)
1. **Habit CRUD**: Create/update/delete habits (gated by `has_subscription_access()`)
2. **Completion Toggle**: Insert/delete completions (gated by `has_subscription_access()`)
3. **Avatar Upload**: Upload to `avatars/{user_id}/` bucket
4. **Profile Updates**: Update display name, email, password (via Supabase Auth)
5. **Feedback Submission**: Insert into `user_feedback`
6. **Reset All Habits**: Delete habits, completions, broken_streaks for user

### Server-Side Operations (Service Role Only)
1. **Entitlement Updates**: Update `user_entitlements` (via Stripe webhook)
2. **Billing Updates**: Update `billing_customers` (via Stripe webhook)
3. **Founding Slot Claims**: Update `founding_slots` (via Stripe webhook)
4. **Webhook Idempotency**: Insert into `processed_webhook_events`

### Admin Operations (Email-Gated)
1. **View All Feedback**: Read all `user_feedback` rows
2. **Update Feedback**: Update `user_feedback` (internal notes, resolved_at)
3. **View Founding Slots**: Read `founding_slots` with user info
4. **Revoke Founding Status**: Call RPC `revoke_founding_status()` (if exists)
5. **View All Users**: Call `get_all_users_with_entitlements()`
6. **Update User Plans**: Call `admin_update_user_plan()`

---

## D) STATE MANAGEMENT ARCHITECTURE

### Context Providers (Order Matters)
1. `AuthProvider` (outermost) - Auth state, session
2. `ThemeProvider` - Light/dark theme
3. `SubscriptionProvider` - Legacy subscription (reads `user_profiles`)
4. `EntitlementProvider` - Current subscription (reads `user_entitlements`)
5. `HabitsProvider` (innermost) - Habits, completions, streaks

### Key Hooks
- `useAuth()` - User, session, profile updates
- `useEntitlement()` - **USE THIS FOR ACCESS CHECKS** (`hasAccess`, `isPro`, `isFounding`)
- `useSubscription()` - Legacy subscription (avoid for access checks)
- `useHabits()` - Habits CRUD, completions, streaks
- `useTheme()` - Theme toggle

---

## E) CRITICAL FINDINGS FROM INVENTORY

### P0 - Missing Schema Definition
**Location**: `supabase/migrations/`  
**Issue**: `habits` and `completions` tables are referenced in migrations but CREATE TABLE statements are missing.  
**Impact**: Cannot verify schema correctness, constraints, indexes, or initial RLS setup.  
**Action Required**: Add migration `000_initial_schema.sql` with CREATE TABLE statements for `habits` and `completions`.

### P1 - Dual Subscription System
**Location**: `src/contexts/SubscriptionContext.tsx` (legacy) vs `src/contexts/EntitlementContext.tsx` (current)  
**Issue**: Two contexts read from different tables (`user_profiles` vs `user_entitlements`).  
**Impact**: Potential confusion, inconsistent state.  
**Action Required**: Verify which system is active, deprecate legacy if unused.

### P1 - Beta Access Metadata Check
**Location**: `src/contexts/EntitlementContext.tsx:153`  
**Issue**: `hasAccess` checks `user?.user_metadata?.beta_access === true` as bypass.  
**Impact**: If this metadata is set, user bypasses all subscription checks.  
**Action Required**: Document this feature or remove if not intended.

---

## NEXT STEPS

Proceed to **PHASE 1: Frontend Feature Correctness Review**


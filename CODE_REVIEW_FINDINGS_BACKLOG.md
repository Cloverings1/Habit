# CODE REVIEW - FINDINGS BACKLOG

**Date**: 2025-01-XX  
**Reviewer**: Codex Engineering Team  
**Scope**: Complete end-to-end code review + validation pass (Stripe/billing OUT OF SCOPE)

---

## SEVERITY LEGEND

- **P0**: Ship blocker - Security vulnerability, data corruption risk, or critical bug
- **P1**: High priority - Feature broken, incorrect behavior, or significant UX issue
- **P2**: Medium priority - Edge case, validation gap, or minor UX issue

---

## P0 FINDINGS (SHIP BLOCKERS)

### P0-1: Missing Core Table Schema Definitions
**Severity**: P0  
**Location**: `supabase/migrations/`  
**Issue**: `habits` and `completions` tables are referenced throughout migrations but CREATE TABLE statements are missing.  
**Impact**: 
- Cannot verify schema correctness (columns, types, constraints)
- Cannot verify initial RLS setup
- Cannot verify indexes exist
- Migration history incomplete
- Risk of schema drift in production

**Steps to Reproduce**:
1. Check `supabase/migrations/` directory
2. Search for `CREATE TABLE habits` or `CREATE TABLE completions`
3. Result: No CREATE TABLE statements found

**Expected**: Migration `000_initial_schema.sql` or similar with:
```sql
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'custom')),
  custom_days JSONB,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date TEXT NOT NULL CHECK (date ~ '^\d{4}-\d{2}-\d{2}$'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, habit_id, date)
);
```

**Fix**: Create migration `000_initial_schema.sql` with CREATE TABLE statements, indexes, and initial RLS policies.

**Regression Test**: 
- Test name: `test_habits_table_exists_with_correct_schema`
- Assert: Table exists with all columns, types, constraints, indexes
- Test name: `test_completions_table_exists_with_correct_schema`
- Assert: Table exists with all columns, types, constraints, indexes, UNIQUE constraint

---

### P0-2: Habit Name Input Validation Missing
**Severity**: P0  
**Location**: `src/components/AddHabitModal.tsx:186-193`, `src/components/EditHabitModal.tsx:140-147`  
**Issue**: No `maxLength` constraint on habit name input. User can submit extremely long strings.  
**Impact**: 
- Database may reject (if TEXT has limit) or store huge strings
- UI may break with very long names
- Performance issues with long habit names

**Steps to Reproduce**:
1. Open Add Habit modal
2. Paste 10,000 character string into name field
3. Submit
4. Result: No validation error, submission proceeds

**Expected**: Input should have `maxLength={100}` (or reasonable limit) and validation error shown.

**Fix**: 
```typescript
<input
  type="text"
  value={habitName}
  onChange={(e) => setHabitName(e.target.value)}
  placeholder={getSampleHabit()}
  autoFocus
  maxLength={100}
  className="liquid-glass-input"
/>
```

**Regression Test**:
- Test name: `test_habit_name_max_length_enforced`
- Assert: Input rejects strings > 100 chars, shows error message

---

### P0-3: No Database-Level Constraints on Habit Name
**Severity**: P0  
**Location**: Database schema (missing migration)  
**Issue**: No CHECK constraint on `habits.name` to enforce length or prevent empty strings.  
**Impact**: 
- Empty strings can be stored if frontend validation bypassed
- Extremely long strings can be stored
- Data integrity not enforced at DB level

**Steps to Reproduce**:
1. As authenticated user, execute:
```sql
INSERT INTO habits (user_id, name, color, frequency)
VALUES (auth.uid(), '', '#ef4444', 'daily');
```
2. Result: Insert succeeds (if no constraint exists)

**Expected**: Database should reject empty names and enforce length limit.

**Fix**: Add migration:
```sql
ALTER TABLE habits
ADD CONSTRAINT habits_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
ADD CONSTRAINT habits_name_max_length CHECK (LENGTH(name) <= 100);
```

**Regression Test**:
- Test name: `test_habits_name_constraints_enforced`
- Assert: INSERT with empty name fails, INSERT with name > 100 chars fails

---

### P0-4: Feedback Modal Allows Invalid Type
**Severity**: P0  
**Location**: `src/components/FeedbackModal.tsx:13-19`  
**Issue**: Type includes `'feature'` but database CHECK constraint only allows `'feedback'` or `'bug'` (from migration 003).  
**Impact**: 
- Submitting feedback with type `'feature'` will fail at database level
- User sees error but doesn't know why
- Type mismatch between frontend and backend

**Steps to Reproduce**:
1. Open Feedback modal
2. Select "Feature Request" (type: `'feature'`)
3. Fill form and submit
4. Result: Database error (CHECK constraint violation)

**Expected**: Either:
- Remove `'feature'` from frontend types, OR
- Update database CHECK constraint to include `'feature'`

**Fix**: Update `FeedbackModal.tsx`:
```typescript
type FeedbackType = 'feedback' | 'bug'; // Remove 'feature'
```

OR update migration 003:
```sql
ALTER TABLE user_feedback
DROP CONSTRAINT user_feedback_type_check;
ALTER TABLE user_feedback
ADD CONSTRAINT user_feedback_type_check CHECK (type IN ('feedback', 'bug', 'feature'));
```

**Regression Test**:
- Test name: `test_feedback_type_matches_database_constraint`
- Assert: All frontend types are valid per database CHECK constraint

---

### P0-5: Feedback Submission Missing Title Field Validation
**Severity**: P0  
**Location**: `src/components/FeedbackModal.tsx:68-79`  
**Issue**: Database schema (migration 003) shows `user_feedback` has `title TEXT` but code inserts `title` field. However, migration shows `message TEXT NOT NULL` but no `title` field in CREATE TABLE.  
**Impact**: 
- Schema mismatch - code expects `title` but table may not have it
- OR table has `title` but migration doesn't show it
- Need to verify actual schema

**Steps to Reproduce**:
1. Check migration `003_add_user_feedback.sql`
2. Check `FeedbackModal.tsx:68` - inserts `title` field
3. Result: Mismatch between migration and code

**Expected**: Migration should include `title TEXT` field if code uses it.

**Fix**: Verify actual database schema, update migration or code to match.

**Regression Test**:
- Test name: `test_feedback_table_has_title_column`
- Assert: `user_feedback` table has `title` column if code inserts it

---

### P0-6: No Input Sanitization for User-Generated Content
**Severity**: P0  
**Location**: All form inputs (habit names, feedback, etc.)  
**Issue**: User input is inserted directly into database without sanitization. While Supabase uses parameterized queries (safe from SQL injection), XSS risk exists if data is displayed unsafely.  
**Impact**: 
- XSS vulnerability if habit names/feedback are rendered without escaping
- React escapes by default, but need to verify all rendering paths

**Steps to Reproduce**:
1. Create habit with name: `<script>alert('XSS')</script>`
2. View habit in UI
3. Result: Script may execute if React doesn't escape (unlikely but need to verify)

**Expected**: All user input should be sanitized or React should escape all rendering.

**Fix**: Verify React escapes all user content. Add explicit sanitization if needed:
```typescript
import DOMPurify from 'isomorphic-dompurify';
const sanitize = (input: string) => DOMPurify.sanitize(input);
```

**Regression Test**:
- Test name: `test_xss_prevention_in_habit_names`
- Assert: Habit name with `<script>` tag is escaped/not executed

---

## P1 FINDINGS (HIGH PRIORITY)

### P1-1: Dual Subscription System Confusion
**Severity**: P1  
**Location**: `src/contexts/SubscriptionContext.tsx` (legacy) vs `src/contexts/EntitlementContext.tsx` (current)  
**Issue**: Two contexts read from different tables (`user_profiles` vs `user_entitlements`). Documentation says to use `useEntitlement()` but `useSubscription()` still exists.  
**Impact**: 
- Developer confusion about which to use
- Potential inconsistent state
- Legacy code may still use old context

**Steps to Reproduce**:
1. Search codebase for `useSubscription()` usage
2. Check if any components use it for access checks
3. Result: `Dashboard.tsx:27` uses `useSubscription()` for `isTrialing` check

**Expected**: Either deprecate `SubscriptionContext` or clearly document when to use each.

**Fix**: 
- Audit all `useSubscription()` usages
- Migrate to `useEntitlement()` where appropriate
- Add deprecation notice to `SubscriptionContext`

**Regression Test**:
- Test name: `test_no_components_use_legacy_subscription_for_access`
- Assert: No components use `useSubscription().hasPremiumAccess` for feature gating

---

### P1-2: Beta Access Metadata Bypass
**Severity**: P1  
**Location**: `src/contexts/EntitlementContext.tsx:153`  
**Issue**: `hasAccess` checks `user?.user_metadata?.beta_access === true` as bypass for all subscription checks.  
**Impact**: 
- If this metadata is set, user bypasses all subscription checks
- No clear way to set/remove this metadata
- Security risk if metadata can be modified by user

**Steps to Reproduce**:
1. Check `EntitlementContext.tsx:151-155`
2. If `user_metadata.beta_access === true`, `hasAccess` returns `true` regardless of subscription
3. Result: User with beta_access bypasses all paywalls

**Expected**: 
- Document this feature if intentional
- OR remove if not intended
- Ensure metadata cannot be modified by user (Supabase Auth metadata is user-writable by default)

**Fix**: 
- Verify if this is intentional feature
- If yes, document it and ensure metadata is admin-only
- If no, remove the check

**Regression Test**:
- Test name: `test_beta_access_metadata_cannot_be_set_by_user`
- Assert: User cannot modify `user_metadata.beta_access` via client

---

### P1-3: No Error Handling for Optimistic Updates
**Severity**: P1  
**Location**: `src/contexts/HabitsContext.tsx:183-234`  
**Issue**: `toggleCompletion` does optimistic updates but error handling only logs to console. User may not see error if network fails.  
**Impact**: 
- User thinks completion was saved but it wasn't
- No retry mechanism
- Silent failures

**Steps to Reproduce**:
1. Toggle habit completion
2. Disconnect network mid-request
3. Result: UI updates optimistically, error logged to console, user doesn't know

**Expected**: Show error toast/notification to user, allow retry.

**Fix**: Add error notification:
```typescript
if (error) {
  console.error('Failed to complete habit:', error);
  // Show error toast
  showErrorToast('Failed to save. Please try again.');
  // Revert optimistic update
  setCompletedDays(prev => [...prev, { habitId, date: dateStr }]);
  throw error;
}
```

**Regression Test**:
- Test name: `test_toggle_completion_shows_error_on_failure`
- Assert: Error toast appears when network request fails

---

### P1-4: Missing Loading States in Multiple Components
**Severity**: P1  
**Location**: Various components  
**Issue**: Many async operations don't show loading states (e.g., `Settings.tsx` avatar upload, `EditHabitModal.tsx` delete).  
**Impact**: 
- User doesn't know operation is in progress
- User may click multiple times (double-submit)
- Poor UX

**Steps to Reproduce**:
1. Upload avatar in Settings
2. Click multiple times quickly
3. Result: Multiple uploads may trigger

**Expected**: Show loading spinner/disabled state during async operations.

**Fix**: Add loading states to all async operations.

**Regression Test**:
- Test name: `test_async_operations_show_loading_state`
- Assert: All async operations show loading indicator

---

### P1-5: No Validation for Custom Days Selection
**Severity**: P1  
**Location**: `src/components/AddHabitModal.tsx:92-97`  
**Issue**: User can select "custom" recurrence but deselect all days, leaving habit with no valid days.  
**Impact**: 
- Habit with no days cannot be completed
- Confusing UX
- Data inconsistency

**Steps to Reproduce**:
1. Create habit with "custom" recurrence
2. Deselect all days
3. Submit
4. Result: Habit created with no valid days

**Expected**: Validation should require at least one day selected for custom recurrence.

**Fix**: Add validation:
```typescript
if (recurrence === 'custom' && !Object.values(customDays).some(Boolean)) {
  setError('Please select at least one day');
  return;
}
```

**Regression Test**:
- Test name: `test_custom_recurrence_requires_at_least_one_day`
- Assert: Form rejects submission if no days selected for custom recurrence

---

### P1-6: Date Format Validation Missing
**Severity**: P1  
**Location**: Database schema (completions.date)  
**Issue**: `completions.date` is TEXT with format `YYYY-MM-DD` but no CHECK constraint enforces format.  
**Impact**: 
- Invalid date strings can be stored
- Date parsing may fail
- Data corruption risk

**Steps to Reproduce**:
1. As authenticated user, execute:
```sql
INSERT INTO completions (user_id, habit_id, date)
VALUES (auth.uid(), 'some-habit-id', 'invalid-date');
```
2. Result: Insert succeeds (if no constraint)

**Expected**: Database should enforce date format.

**Fix**: Add migration:
```sql
ALTER TABLE completions
ADD CONSTRAINT completions_date_format CHECK (date ~ '^\d{4}-\d{2}-\d{2}$');
```

**Regression Test**:
- Test name: `test_completions_date_format_enforced`
- Assert: INSERT with invalid date format fails

---

### P1-7: No Unique Constraint on Completions
**Severity**: P1  
**Location**: Database schema (completions table)  
**Issue**: No UNIQUE constraint on `(user_id, habit_id, date)` to prevent duplicate completions.  
**Impact**: 
- Same completion can be inserted multiple times
- Data inconsistency
- Incorrect streak calculations

**Steps to Reproduce**:
1. Toggle habit completion multiple times rapidly
2. Result: Multiple completion records may be created

**Expected**: Database should prevent duplicate completions.

**Fix**: Add migration:
```sql
ALTER TABLE completions
ADD CONSTRAINT completions_unique_user_habit_date UNIQUE (user_id, habit_id, date);
```

**Regression Test**:
- Test name: `test_completions_unique_constraint_enforced`
- Assert: INSERT of duplicate completion fails

---

### P1-8: Avatar Upload Path Injection Risk
**Severity**: P1  
**Location**: `src/contexts/AuthContext.tsx:84`  
**Issue**: Avatar file path is constructed as `${user.id}/avatar-${Date.now()}.${ext}`. While `user.id` is from auth (trusted), filename construction could be improved.  
**Impact**: 
- Low risk since user.id is trusted, but path construction could be more explicit
- If `user.id` were ever user-controlled, path traversal risk

**Steps to Reproduce**:
1. Check `AuthContext.tsx:84`
2. Verify path construction
3. Result: Path is safe but could be more explicit

**Expected**: Use explicit path sanitization or Supabase storage helper.

**Fix**: Already safe, but add comment:
```typescript
// user.id is from auth.uid() - trusted, but be explicit
const filePath = `${user.id}/avatar-${Date.now()}.${ext}`;
```

**Regression Test**:
- Test name: `test_avatar_path_construction_safe`
- Assert: Path cannot contain `..` or other traversal characters

---

## P2 FINDINGS (MEDIUM PRIORITY)

### P2-1: No Input Length Validation on Feedback Message
**Severity**: P2  
**Location**: `src/components/FeedbackModal.tsx:329-346`  
**Issue**: Feedback message textarea has no `maxLength` constraint.  
**Impact**: 
- Extremely long messages can be submitted
- Database storage waste
- UI may break with very long text

**Fix**: Add `maxLength={5000}` to textarea.

**Regression Test**:
- Test name: `test_feedback_message_max_length_enforced`
- Assert: Textarea rejects input > 5000 chars

---

### P2-2: Missing Accessibility Labels
**Severity**: P2  
**Location**: Multiple icon buttons (e.g., `Dashboard.tsx:172-188`)  
**Issue**: Icon-only buttons lack `aria-label` attributes.  
**Impact**: 
- Screen readers cannot identify button purpose
- Accessibility violation

**Fix**: Add `aria-label` to all icon buttons:
```typescript
<motion.button
  aria-label="View calendar"
  onClick={() => onNavigate('calendar')}
  ...
>
```

**Regression Test**:
- Test name: `test_all_icon_buttons_have_aria_labels`
- Assert: All icon buttons have `aria-label` or `aria-labelledby`

---

### P2-3: No Keyboard Navigation for Custom Days
**Severity**: P2  
**Location**: `src/components/AddHabitModal.tsx:234-249`  
**Issue**: Custom days selection buttons don't have proper keyboard navigation (tab order, Enter key handling).  
**Impact**: 
- Keyboard users cannot easily select days
- Accessibility issue

**Fix**: Ensure buttons are focusable and handle Enter key.

**Regression Test**:
- Test name: `test_custom_days_keyboard_navigation`
- Assert: All day buttons are focusable and respond to Enter key

---

### P2-4: No Debouncing on Search/Filter Inputs
**Severity**: P2  
**Location**: `src/components/AdminFeedbackView.tsx` (if search exists)  
**Issue**: Search inputs may trigger excessive queries if not debounced.  
**Impact**: 
- Performance issues
- Unnecessary database queries

**Fix**: Add debouncing to search inputs (if they exist).

**Regression Test**:
- Test name: `test_search_inputs_debounced`
- Assert: Search queries are debounced by 300ms

---

### P2-5: localStorage Usage Without Error Handling
**Severity**: P2  
**Location**: `src/utils/storage.ts`  
**Issue**: `localStorage` operations can fail (quota exceeded, private browsing). No try-catch blocks.  
**Impact**: 
- App may crash if localStorage unavailable
- Silent failures

**Fix**: Add try-catch blocks:
```typescript
getHabits: (): Habit[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HABITS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to read habits from localStorage:', error);
    return [];
  }
}
```

**Regression Test**:
- Test name: `test_storage_handles_quota_exceeded`
- Assert: Storage operations handle quota exceeded gracefully

---

### P2-6: No Rate Limiting on API Calls
**Severity**: P2  
**Location**: All Supabase queries  
**Issue**: No client-side rate limiting on API calls. User can spam requests.  
**Impact**: 
- Performance issues
- Potential abuse
- Supabase may rate limit, but no graceful handling

**Fix**: Add rate limiting or request queuing for critical operations.

**Regression Test**:
- Test name: `test_api_calls_rate_limited`
- Assert: Rapid API calls are throttled/queued

---

## NEXT STEPS

1. **Immediate Actions** (P0):
   - Create `000_initial_schema.sql` migration
   - Add input validation (maxLength, required fields)
   - Fix feedback type mismatch
   - Add database constraints (CHECK, UNIQUE)

2. **High Priority** (P1):
   - Resolve dual subscription system confusion
   - Add error handling for optimistic updates
   - Add loading states
   - Validate custom days selection

3. **Medium Priority** (P2):
   - Add accessibility labels
   - Improve keyboard navigation
   - Add error handling for localStorage
   - Consider rate limiting

---

**Continue to PHASE 2: TypeScript + Runtime Validation**


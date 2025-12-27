# CODE REVIEW - PHASE 2: TYPESCRIPT + RUNTIME VALIDATION

**Date**: 2025-01-XX  
**Reviewer**: Codex Engineering Team

---

## TYPESCRIPT CONFIGURATION REVIEW

### Current Settings (`tsconfig.app.json`)

✅ **Good**:
- `strict: true` - Enables all strict type checking
- `noUnusedLocals: true` - Catches unused variables
- `noUnusedParameters: true` - Catches unused function parameters
- `noFallthroughCasesInSwitch: true` - Prevents switch fallthrough bugs
- `noUncheckedSideEffectImports: true` - Ensures imports are typed

### Findings

#### P1-9: Unsafe `any` Type Usage
**Severity**: P1  
**Location**: `src/components/Analytics/HabitDetail.tsx:172`  
**Issue**: `StatCard` component uses `any` for props:
```typescript
const StatCard = ({ icon, label, value, subtext }: any) => (
```

**Impact**: 
- No type safety for component props
- Potential runtime errors if wrong props passed
- No IntelliSense/autocomplete

**Fix**: Define proper interface:
```typescript
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
}

const StatCard = ({ icon, label, value, subtext }: StatCardProps) => (
```

**Regression Test**:
- Test name: `test_stat_card_props_typed`
- Assert: StatCard component has proper TypeScript types

---

## RUNTIME VALIDATION REVIEW

### Current State

❌ **Missing**: No runtime validation library (Zod, Yup, etc.)  
❌ **Missing**: No schema validation at API boundaries  
❌ **Missing**: No validation for Supabase response types

### Findings

#### P0-7: No Runtime Validation for Supabase Responses
**Severity**: P0  
**Location**: All Supabase queries (e.g., `src/contexts/HabitsContext.tsx:51-88`)  
**Issue**: Supabase responses are typed but not validated at runtime. If database schema changes, TypeScript types may be stale.  
**Impact**: 
- Runtime errors if database schema doesn't match TypeScript types
- No detection of schema drift
- Silent data corruption if types are wrong

**Steps to Reproduce**:
1. Change database column type (e.g., `habits.name` from TEXT to INTEGER)
2. TypeScript types still expect string
3. Runtime error when accessing `habit.name`

**Expected**: Validate Supabase responses against schemas at runtime.

**Fix**: Add Zod schemas:
```typescript
import { z } from 'zod';

const HabitSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  frequency: z.enum(['daily', 'weekly', 'custom']),
  custom_days: z.record(z.boolean()).nullable(),
  archived: z.boolean(),
  created_at: z.string(),
});

// In HabitsContext.tsx
const { data: habitsData, error: habitsError } = await supabase
  .from('habits')
  .select('*')
  .eq('user_id', user.id);

if (habitsError) throw habitsError;

// Validate response
const validatedHabits = habitsData.map(h => HabitSchema.parse(h));
```

**Regression Test**:
- Test name: `test_supabase_responses_validated`
- Assert: All Supabase responses are validated against Zod schemas

---

#### P1-10: No Form Input Validation Schemas
**Severity**: P1  
**Location**: All form components (`AddHabitModal`, `EditHabitModal`, `FeedbackModal`, etc.)  
**Issue**: Form validation is done manually with `.trim()` and length checks, but no centralized schema validation.  
**Impact**: 
- Inconsistent validation logic
- Easy to miss validation in new forms
- No type-safe validation

**Fix**: Add Zod schemas for forms:
```typescript
import { z } from 'zod';

const HabitFormSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  recurrence: z.enum(['daily', 'weekly', 'custom']),
  customDays: z.object({
    monday: z.boolean(),
    tuesday: z.boolean(),
    // ... etc
  }).optional(),
});

// In AddHabitModal
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const result = HabitFormSchema.safeParse({
    name: habitName,
    color: selectedColor,
    recurrence,
    customDays: recurrence === 'custom' ? customDays : undefined,
  });
  
  if (!result.success) {
    setError(result.error.errors[0].message);
    return;
  }
  
  // Use validated data
  await addHabit(result.data.name, result.data.color, result.data.recurrence, result.data.customDays);
};
```

**Regression Test**:
- Test name: `test_form_validation_uses_zod_schemas`
- Assert: All forms use Zod schemas for validation

---

#### P1-11: No Validation for Date Strings
**Severity**: P1  
**Location**: `src/utils/dateUtils.ts`, `src/contexts/HabitsContext.tsx`  
**Issue**: Date strings from database (`completions.date`) are not validated. If invalid format stored, parsing may fail.  
**Impact**: 
- Runtime errors if date format is wrong
- Silent failures in date calculations

**Fix**: Add date string validation:
```typescript
import { z } from 'zod';

const DateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

// In HabitsContext
const formattedCompletions: CompletedDay[] = completionsData.map(c => {
  const date = DateStringSchema.parse(c.date);
  return {
    habitId: c.habit_id,
    date,
  };
});
```

**Regression Test**:
- Test name: `test_date_strings_validated`
- Assert: All date strings are validated against regex pattern

---

## RECOMMENDATIONS

### Immediate Actions

1. **Add Zod dependency**:
```bash
npm install zod
```

2. **Create schema definitions file**: `src/schemas/index.ts`
   - Define schemas for all database tables
   - Define schemas for all form inputs
   - Export validated types

3. **Update all Supabase queries** to validate responses

4. **Update all forms** to use Zod schemas

5. **Fix `any` type** in `HabitDetail.tsx`

### Long-term Improvements

1. **Generate TypeScript types from Zod schemas**:
```typescript
import { z } from 'zod';
export const HabitSchema = z.object({...});
export type Habit = z.infer<typeof HabitSchema>;
```

2. **Create validation utilities**:
```typescript
// src/utils/validation.ts
export const validateSupabaseResponse = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  return schema.parse(data);
};
```

3. **Add schema tests** to ensure schemas match database constraints

---

## NEXT STEPS

Proceed to **PHASE 3: Supabase / Database / RLS "Prove Isolation"**


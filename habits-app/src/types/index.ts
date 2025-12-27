export type RecurrenceType = 'daily' | 'weekly' | 'custom';

export type SubscriptionStatus = 'free' | 'trialing' | 'active' | 'canceled' | 'past_due' | 'diamond';

export type Plan = 'none' | 'pro' | 'founding';
export type EntitlementStatus = 'none' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired';

export interface UserProfile {
  id: string;
  stripe_customer_id: string | null;
  subscription_status: SubscriptionStatus;
  subscription_id: string | null;
  price_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  trial_start: string | null;
  trial_end: string | null;
  is_trial_user: boolean;
}

export interface TrialState {
  isTrialing: boolean;
  isExpired: boolean;
  daysRemaining: number;
  trialEnd: Date | null;
}

export interface UserEntitlement {
  user_id: string;
  plan: Plan;
  status: EntitlementStatus;
  stripe_subscription_id: string | null;
  trial_ends_at: string | null;
  current_period_ends_at: string | null;
  updated_at: string;
}

export interface CustomRecurrence {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface Habit {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  recurrence: RecurrenceType;
  customDays?: CustomRecurrence;
  archived?: boolean;
}

export interface CompletedDay {
  habitId: string;
  date: string; // YYYY-MM-DD format
}

export interface UserSettings {
  name: string;
  theme: 'light' | 'dark';
}

export type ViewType = 'home' | 'stats' | 'calendar' | 'settings';

// Predefined colors for habits
export const HABIT_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6366f1', // indigo
  '#06b6d4', // cyan
];

export const getNextColor = (usedColors: string[]): string => {
  const availableColor = HABIT_COLORS.find(c => !usedColors.includes(c));
  return availableColor || HABIT_COLORS[Math.floor(Math.random() * HABIT_COLORS.length)];
};

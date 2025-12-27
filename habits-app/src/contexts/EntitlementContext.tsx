import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';
import type { UserEntitlement, Plan, EntitlementStatus, TrialState } from '../types';

interface EntitlementContextType {
  entitlement: UserEntitlement | null;
  plan: Plan;
  status: EntitlementStatus;
  isPro: boolean;
  isFounding: boolean;
  isBeta: boolean;
  isTrialing: boolean;
  trialState: TrialState | null;
  hasAccess: boolean; // True if Pro active/trialing or Founding active or Beta
  loading: boolean;
}

const EntitlementContext = createContext<EntitlementContextType | undefined>(undefined);

export const EntitlementProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [entitlement, setEntitlement] = useState<UserEntitlement | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEntitlement = useCallback(async () => {
    if (!user) {
      setEntitlement(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_entitlements')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching entitlement:', error);
      } else if (data) {
        setEntitlement({
          user_id: data.user_id,
          plan: data.plan || 'none',
          status: data.status || 'none',
          stripe_subscription_id: data.stripe_subscription_id,
          trial_ends_at: data.trial_ends_at,
          current_period_ends_at: data.current_period_ends_at,
          updated_at: data.updated_at,
        });
      } else {
        // No entitlement row exists yet - user has not initialized billing
        setEntitlement({
          user_id: user.id,
          plan: 'none',
          status: 'none',
          stripe_subscription_id: null,
          trial_ends_at: null,
          current_period_ends_at: null,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error fetching entitlement:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch entitlement on mount and user change
  useEffect(() => {
    fetchEntitlement();
  }, [fetchEntitlement]);

  // Subscribe to realtime changes on user_entitlements table
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user_entitlements:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_entitlements',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const data = payload.new;
            setEntitlement({
              user_id: data.user_id,
              plan: data.plan || 'none',
              status: data.status || 'none',
              stripe_subscription_id: data.stripe_subscription_id,
              trial_ends_at: data.trial_ends_at,
              current_period_ends_at: data.current_period_ends_at,
              updated_at: data.updated_at,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const plan: Plan = entitlement?.plan || 'none';
  const status: EntitlementStatus = entitlement?.status || 'none';
  const isPro = plan === 'pro';
  const isFounding = plan === 'founding';
  const isBeta = user?.user_metadata?.beta_access === true;
  const isTrialing = status === 'trialing';

  // Calculate trial state for Pro users
  const trialState: TrialState | null = useMemo(() => {
    // Founding members don't have trial state
    if (isFounding) return null;

    if (!isTrialing || !entitlement?.trial_ends_at) return null;

    try {
      const trialEnd = new Date(entitlement.trial_ends_at);
      if (isNaN(trialEnd.getTime())) {
        console.error('Invalid trial_ends_at date:', entitlement.trial_ends_at);
        return null;
      }

      const now = new Date();
      const isExpired = trialEnd < now;
      const daysRemaining = Math.max(0, Math.floor((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      return {
        isTrialing: true,
        isExpired,
        daysRemaining,
        trialEnd,
      };
    } catch (err) {
      console.error('Error calculating trial state:', err);
      return null;
    }
  }, [isFounding, isTrialing, entitlement?.trial_ends_at]);

  // Access granted if:
  // - Founding member with active status
  // - Pro user with active status within billing period
  // - Pro user trialing and trial not expired
  const hasAccess = useMemo(() => {
    // Check for beta access in user metadata
    if (user?.user_metadata?.beta_access === true) {
      return true;
    }

    if (isFounding && status === 'active') {
      return true;
    }

    if (isPro && status === 'active') {
      // Check if within billing period
      if (!entitlement?.current_period_ends_at) return true; // No end date = ongoing
      const periodEnd = new Date(entitlement.current_period_ends_at);
      return periodEnd > new Date();
    }

    if (isPro && isTrialing && trialState && !trialState.isExpired) {
      return true;
    }

    return false;
  }, [user, isFounding, isPro, status, isTrialing, trialState, entitlement?.current_period_ends_at]);

  return (
    <EntitlementContext.Provider
      value={{
        entitlement,
        plan,
        status,
        isPro,
        isFounding,
        isBeta,
        isTrialing,
        trialState,
        hasAccess,
        loading,
      }}
    >
      {children}
    </EntitlementContext.Provider>
  );
};

export const useEntitlement = (): EntitlementContextType => {
  const context = useContext(EntitlementContext);
  if (!context) {
    throw new Error('useEntitlement must be used within an EntitlementProvider');
  }
  return context;
};

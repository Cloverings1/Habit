import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';
import { createCheckoutSession, createPortalSession, PRICE_IDS } from '../utils/stripe';
import type { UserProfile, SubscriptionStatus, TrialState } from '../types';

interface SubscriptionContextType {
  status: SubscriptionStatus;
  isPro: boolean;
  isDiamond: boolean;
  isTrialing: boolean;
  trialState: TrialState | null;
  hasPremiumAccess: boolean; // true for Pro, Diamond, or active trial
  hasActiveAccess: boolean; // Same as hasPremiumAccess but more semantic
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  loading: boolean;
  openCheckout: (plan: 'monthly' | 'annual') => Promise<void>;
  openPortal: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
      } else if (data) {
        setProfile({
          id: data.id,
          stripe_customer_id: data.stripe_customer_id,
          subscription_status: data.subscription_status || 'free',
          subscription_id: data.subscription_id,
          price_id: data.price_id,
          current_period_end: data.current_period_end,
          cancel_at_period_end: data.cancel_at_period_end || false,
          trial_start: data.trial_start || null,
          trial_end: data.trial_end || null,
          is_trial_user: data.is_trial_user || false,
        });
      } else {
        // Profile might not exist yet for new users - use defaults
        setProfile({
          id: user.id,
          stripe_customer_id: null,
          subscription_status: 'free',
          subscription_id: null,
          price_id: null,
          current_period_end: null,
          cancel_at_period_end: false,
          trial_start: null,
          trial_end: null,
          is_trial_user: false,
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch profile on mount and user change
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Subscribe to realtime changes on user_profiles table
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user_profiles:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const data = payload.new;
            setProfile({
              id: data.id,
              stripe_customer_id: data.stripe_customer_id,
              subscription_status: data.subscription_status || 'free',
              subscription_id: data.subscription_id,
              price_id: data.price_id,
              current_period_end: data.current_period_end,
              cancel_at_period_end: data.cancel_at_period_end || false,
              trial_start: data.trial_start || null,
              trial_end: data.trial_end || null,
              is_trial_user: data.is_trial_user || false,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const status: SubscriptionStatus = profile?.subscription_status || 'free';
  const isPro = status === 'active';
  const isDiamond = status === 'diamond';
  const isTrialing = status === 'trialing';
  const currentPeriodEnd = profile?.current_period_end || null;
  const cancelAtPeriodEnd = profile?.cancel_at_period_end || false;

  // Calculate trial state
  const trialState: TrialState | null = useMemo(() => {
    // Diamond users never have trial state
    if (isDiamond) return null;

    if (!isTrialing || !profile?.trial_end) return null;

    try {
      const trialEnd = new Date(profile.trial_end);
      if (isNaN(trialEnd.getTime())) {
        console.error('Invalid trial_end date:', profile.trial_end);
        return null;
      }

      const now = new Date();
      const isExpired = trialEnd < now;
      // Use Math.floor for consistent rounding (don't surprise users with early expiration)
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
  }, [isDiamond, isTrialing, profile?.trial_end]);

  // Premium access includes trialing users (if not expired)
  // If isTrialing but trialState is null (missing trial_end), treat as expired for safety
  const hasPremiumAccess = isPro || isDiamond || (isTrialing && trialState !== null && !trialState.isExpired);
  const hasActiveAccess = hasPremiumAccess;

  const openCheckout = useCallback(async (plan: 'monthly' | 'annual') => {
    const priceId = plan === 'monthly' ? PRICE_IDS.monthly : PRICE_IDS.annual;
    await createCheckoutSession(priceId);
  }, []);

  const openPortal = useCallback(async () => {
    await createPortalSession();
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        status,
        isPro,
        isDiamond,
        isTrialing,
        trialState,
        hasPremiumAccess,
        hasActiveAccess,
        currentPeriodEnd,
        cancelAtPeriodEnd,
        loading,
        openCheckout,
        openPortal,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

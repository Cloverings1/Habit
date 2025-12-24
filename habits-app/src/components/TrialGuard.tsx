import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';

interface TrialGuardProps {
  children: React.ReactNode;
}

/**
 * TrialGuard protects the app from:
 * 1. Users with expired trials
 * 2. Users without any subscription access
 *
 * It redirects them to the landing page with appropriate query params.
 */
export const TrialGuard = ({ children }: TrialGuardProps) => {
  const { user } = useAuth();
  const { hasActiveAccess, isTrialing, trialState, isDiamond, loading } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth and subscription data to load
    if (loading || !user) return;

    // Diamond members always have access
    if (isDiamond) return;

    // Expired trial - redirect to pricing with modal
    if (isTrialing && trialState?.isExpired) {
      navigate('/?trial_expired=true', { replace: true });
      return;
    }

    // No subscription access at all - redirect to pricing
    // This catches: free users, canceled subscriptions, past_due, etc.
    if (!hasActiveAccess) {
      navigate('/?no_access=true', { replace: true });
      return;
    }
  }, [hasActiveAccess, isTrialing, trialState, isDiamond, loading, user, navigate]);

  // Show nothing while checking (prevents flash of content)
  if (loading) return null;

  // Show nothing if no access (will redirect)
  if (!hasActiveAccess && !isDiamond) return null;

  // Render app
  return <>{children}</>;
};

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntitlement } from '../contexts/EntitlementContext';
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
  const { hasAccess, isTrialing, trialState, isFounding, loading } = useEntitlement();
  const navigate = useNavigate();

  useEffect(() => {
    // Skip if checkout is in progress (prevents race condition with Stripe redirect)
    if (sessionStorage.getItem('checkout_in_progress') === 'true') {
      return;
    }

    // Wait for auth and subscription data to load
    if (loading || !user) return;

    // Founding members always have access
    if (isFounding) return;

    // Expired trial - redirect to pricing with modal
    if (isTrialing && trialState?.isExpired) {
      navigate('/?trial_expired=true', { replace: true });
      return;
    }

    // No subscription access at all - redirect to pricing
    // This catches: free users (plan='none'), canceled subscriptions, etc.
    if (!hasAccess) {
      navigate('/?no_access=true', { replace: true });
      return;
    }
  }, [hasAccess, isTrialing, trialState, isFounding, loading, user, navigate]);

  // Show nothing while checking (prevents flash of content)
  if (loading) return null;

  // Don't block if checkout is in progress (user is being redirected to Stripe)
  if (sessionStorage.getItem('checkout_in_progress') === 'true') {
    return <>{children}</>;
  }

  // Show nothing if no access (will redirect)
  if (!hasAccess && !isFounding) return null;

  // Render app
  return <>{children}</>;
};

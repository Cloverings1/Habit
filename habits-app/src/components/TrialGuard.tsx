import { useAuth } from '../contexts/AuthContext';
import { useEntitlement } from '../contexts/EntitlementContext';
import { motion } from 'framer-motion';

interface TrialGuardProps {
  children: React.ReactNode;
}

/**
 * TrialGuard now allows users into the app regardless of subscription status.
 * The paywall is shown when they try to interact (toggle habit, add habit, etc.)
 * This provides a better UX - users can see their data before being asked to pay.
 */
export const TrialGuard = ({ children }: TrialGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const { loading: entitlementLoading } = useEntitlement();

  // Show loading indicator while auth or entitlement is loading
  if (authLoading || entitlementLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-[#6F6F6F]"
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Always render the app - paywall is triggered on interaction
  return <>{children}</>;
};

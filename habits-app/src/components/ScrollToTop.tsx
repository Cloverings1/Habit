import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scroll restoration for SPA route changes.
 * Ensures users land at the top when navigating between static pages (and any route).
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use instant scroll to avoid "fighting" page entrance animations.
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
};



import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise && stripePublishableKey) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise || Promise.resolve(null);
};

export const createCheckoutSession = async (priceId: string): Promise<void> => {
  const { data: sessionData, error } = await supabase.auth.getSession();

  if (error || !sessionData?.session?.access_token) {
    throw new Error('You must be logged in to subscribe');
  }

  const response = await supabase.functions.invoke('create-checkout-session', {
    body: { priceId },
    headers: {
      Authorization: `Bearer ${sessionData.session.access_token}`,
    },
  });

  if (response.error) {
    throw new Error(response.error.message || 'Failed to create checkout session');
  }

  const { sessionId } = response.data;

  const stripe = await getStripe();
  if (!stripe) {
    throw new Error('Stripe failed to initialize');
  }

  const { error: redirectError } = await stripe.redirectToCheckout({ sessionId });

  if (redirectError) {
    throw new Error(redirectError.message || 'Failed to redirect to checkout');
  }
};

export const createPortalSession = async (): Promise<void> => {
  const { data: sessionData, error } = await supabase.auth.getSession();

  if (error || !sessionData?.session?.access_token) {
    throw new Error('You must be logged in to manage subscription');
  }

  const response = await supabase.functions.invoke('create-portal-session', {
    body: {},
    headers: {
      Authorization: `Bearer ${sessionData.session.access_token}`,
    },
  });

  if (response.error) {
    throw new Error(response.error.message || 'Failed to create portal session');
  }

  const { url } = response.data;

  if (url) {
    window.location.href = url;
  } else {
    throw new Error('No portal URL returned');
  }
};

// Price IDs - these should match your Stripe dashboard
export const PRICE_IDS = {
  monthly: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID || 'price_monthly',
  annual: import.meta.env.VITE_STRIPE_ANNUAL_PRICE_ID || 'price_annual',
  proMonthly: import.meta.env.VITE_STRIPE_PRICE_ID_PRO_MONTHLY || 'price_pro_monthly',
  foundingOneTime: import.meta.env.VITE_STRIPE_PRICE_ID_FOUNDING_ONE_TIME || 'price_founding_one_time',
} as const;

/**
 * Create a checkout session for Pro 7-day trial
 * Redirects to Stripe-hosted checkout page
 */
export const createProTrialCheckout = async (): Promise<void> => {
  try {
    const { data: sessionData, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Session fetch error:', error);
      throw new Error('Failed to get session');
    }

    if (!sessionData?.session?.access_token) {
      console.error('No session or access token available');
      throw new Error('You must be logged in to subscribe');
    }

    console.log('Invoking create-pro-trial-session function...');
    const response = await supabase.functions.invoke('create-pro-trial-session', {
      body: {},
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
    });

    if (response.error) {
      console.error('Function invoke error:', response.error);
      throw new Error(response.error.message || 'Failed to create checkout session');
    }

    const { url } = response.data;

    if (!url) {
      console.error('No URL in response:', response.data);
      throw new Error('No checkout URL returned from server');
    }

    console.log('Redirecting to Stripe checkout...');
    window.location.href = url;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('createProTrialCheckout error:', message);
    throw err;
  }
};

/**
 * Create a checkout session for Founding membership ($149 one-time)
 * Redirects to Stripe-hosted checkout page
 */
export const createFoundingCheckout = async (): Promise<void> => {
  try {
    const { data: sessionData, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Session fetch error:', error);
      throw new Error('Failed to get session');
    }

    if (!sessionData?.session?.access_token) {
      console.error('No session or access token available');
      throw new Error('You must be logged in to purchase founding access');
    }

    console.log('Invoking create-founding-session function...');
    const response = await supabase.functions.invoke('create-founding-session', {
      body: {},
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
    });

    if (response.error) {
      console.error('Function invoke error:', response.error);
      throw new Error(response.error.message || 'Failed to create checkout session');
    }

    const { url } = response.data;

    if (!url) {
      console.error('No URL in response:', response.data);
      throw new Error('No checkout URL returned from server');
    }

    console.log('Redirecting to Stripe checkout...');
    window.location.href = url;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('createFoundingCheckout error:', message);
    throw err;
  }
};

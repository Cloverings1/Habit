// Supabase Edge Function: stripe-webhook
// Handles Stripe webhook events for subscription management
// Deploy with: supabase functions deploy stripe-webhook --no-verify-jwt

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@14.10.0?target=deno";

// Initialize Stripe with the secret key
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

// Initialize Supabase with service role key to bypass RLS
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Webhook signing secret for signature verification
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

// Type definitions for better type safety
interface SubscriptionUpdate {
  subscription_status: "free" | "trialing" | "active" | "canceled" | "past_due";
  subscription_id: string | null;
  price_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  trial_start?: string | null;
  trial_end?: string | null;
  is_trial_user?: boolean;
  updated_at: string;
}

// Helper function to update user profile
async function updateUserProfile(
  stripeCustomerId: string,
  updates: Partial<SubscriptionUpdate>
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("user_profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", stripeCustomerId);

  if (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Map Stripe subscription status to our internal status
function mapStripeStatus(
  stripeStatus: Stripe.Subscription.Status
): "free" | "trialing" | "active" | "canceled" | "past_due" {
  switch (stripeStatus) {
    case "active":
      return "active";
    case "trialing":
      return "trialing"; // Now properly tracked as distinct status
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    case "incomplete":
    case "paused":
    default:
      return "free";
  }
}

// Handle subscription.created event
async function handleSubscriptionCreated(
  subscription: Stripe.Subscription
): Promise<Response> {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const priceId = subscription.items.data[0]?.price.id ?? null;
  const status = mapStripeStatus(subscription.status);

  // Extract trial information
  const isTrialing = subscription.status === "trialing";
  const trialStart = subscription.trial_start
    ? new Date(subscription.trial_start * 1000).toISOString()
    : null;
  const trialEnd = subscription.trial_end
    ? new Date(subscription.trial_end * 1000).toISOString()
    : null;

  const result = await updateUserProfile(customerId, {
    subscription_status: status,
    subscription_id: subscription.id,
    price_id: priceId,
    current_period_end: new Date(
      subscription.current_period_end * 1000
    ).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    trial_start: trialStart,
    trial_end: trialEnd,
    is_trial_user: isTrialing,
  });

  // Also update new billing schema if available
  const userId = subscription.metadata?.supabase_user_id;
  if (userId) {
    const newStatus =
      status === "trialing" ? "trialing" : status === "active" ? "active" : status === "past_due" ? "past_due" : "canceled";
    await supabase.from("user_entitlements").upsert(
      {
        user_id: userId,
        plan: "pro",
        status: newStatus,
        stripe_subscription_id: subscription.id,
        trial_ends_at: trialEnd,
        current_period_ends_at: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  }

  if (!result.success) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log(
    `Subscription created for customer ${customerId}: ${subscription.id}, status: ${status}, trial: ${isTrialing}`
  );

  return new Response(
    JSON.stringify({ received: true, action: "subscription_created" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// Handle subscription.updated event
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<Response> {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const priceId = subscription.items.data[0]?.price.id ?? null;
  const status = mapStripeStatus(subscription.status);

  // Extract trial information - preserve is_trial_user if they were ever trialing
  const isTrialing = subscription.status === "trialing";
  const trialStart = subscription.trial_start
    ? new Date(subscription.trial_start * 1000).toISOString()
    : null;
  const trialEnd = subscription.trial_end
    ? new Date(subscription.trial_end * 1000).toISOString()
    : null;

  const result = await updateUserProfile(customerId, {
    subscription_status: status,
    subscription_id: subscription.id,
    price_id: priceId,
    current_period_end: new Date(
      subscription.current_period_end * 1000
    ).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    trial_start: trialStart,
    trial_end: trialEnd,
    // Only set is_trial_user to true (once a trial user, always tracked as such)
    ...(isTrialing && { is_trial_user: true }),
  });

  // Also update new billing schema if available
  const userId = subscription.metadata?.supabase_user_id;
  if (userId) {
    const newStatus =
      status === "trialing" ? "trialing" : status === "active" ? "active" : status === "past_due" ? "past_due" : "canceled";
    await supabase.from("user_entitlements").upsert(
      {
        user_id: userId,
        plan: "pro",
        status: newStatus,
        stripe_subscription_id: subscription.id,
        trial_ends_at: trialEnd,
        current_period_ends_at: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  }

  if (!result.success) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log(
    `Subscription updated for customer ${customerId}: status=${status}, cancel_at_period_end=${subscription.cancel_at_period_end}`
  );

  return new Response(
    JSON.stringify({ received: true, action: "subscription_updated" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// Helper: Get user_id from customer ID by checking billing_customers and user_profiles
async function getUserIdFromCustomer(stripeCustomerId: string): Promise<string | null> {
  // Try billing_customers first (new table)
  const { data: billingData } = await supabase
    .from('billing_customers')
    .select('user_id')
    .eq('stripe_customer_id', stripeCustomerId)
    .maybeSingle();

  if (billingData?.user_id) {
    console.log('Found user in billing_customers:', billingData.user_id);
    return billingData.user_id;
  }

  // Fallback to user_profiles (legacy)
  const { data: profileData } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('stripe_customer_id', stripeCustomerId)
    .maybeSingle();

  if (profileData?.id) {
    console.log('Found user in user_profiles:', profileData.id);
    return profileData.id;
  }

  return null;
}

// Handle checkout.session.completed event (for one-time payments like Founding)
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<Response> {
  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;

  if (!customerId) {
    console.error("No customer ID in checkout session");
    return new Response(JSON.stringify({ error: "No customer in session" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const planType = session.metadata?.plan_type;
  // Get user_id from metadata first, then fall back to customer lookup
  let userId = session.metadata?.supabase_user_id;

  if (!userId) {
    userId = await getUserIdFromCustomer(customerId) ?? undefined;
  }

  console.log(`Checkout completed: planType=${planType}, userId=${userId}, customerId=${customerId}`);

  // Handle founding membership purchase
  if (planType === "founding") {
    if (!userId) {
      console.error("No user ID in founding checkout session");
      return new Response(JSON.stringify({ error: "No user in session" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      // P1-BILL-3: Use transactional RPC to claim slot atomically
      // This prevents race conditions where two payments could both succeed
      // but only one slot is available. The RPC uses FOR UPDATE locking.
      const { data: claimResult, error: claimError } = await supabase.rpc(
        "claim_founding_slot",
        { user_uuid: userId }
      );

      if (claimError) {
        console.error("Error claiming founding slot:", claimError);
        throw claimError;
      }

      // Check if slot was successfully claimed
      if (!claimResult?.success) {
        // This is an edge case: user paid but no slots available
        // This can happen if slots ran out between checkout creation and payment
        console.error(
          `No founding slots available for user ${userId}. Payment received but slot claim failed.`
        );
        // Still return 200 to Stripe (payment succeeded, we need to handle refund separately)
        // TODO: Trigger a refund via Stripe API or flag for manual review
        return new Response(
          JSON.stringify({
            received: true,
            action: "founding_slot_unavailable",
            warning: "Payment received but no slots available - manual review required",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Update user profile for backward compatibility
      await updateUserProfile(customerId, {
        subscription_status: "diamond",
        subscription_id: null,
        price_id: null,
        current_period_end: null,
        cancel_at_period_end: false,
        trial_start: null,
        trial_end: null,
        is_trial_user: false,
      });

      console.log(
        `Founding membership activated for user ${userId}, slot ${claimResult.slot_id}`
      );

      return new Response(
        JSON.stringify({ received: true, action: "founding_payment_completed" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`Error processing founding checkout: ${errorMessage}`);
      return new Response(
        JSON.stringify({ error: `Error processing founding checkout: ${errorMessage}` }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // Handle Pro subscription checkout (planType === "pro" or subscription exists)
  if (session.subscription && userId) {
    const subscriptionId = typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id;

    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const isTrialing = subscription.status === "trialing";
      const trialEnd = subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null;
      const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

      console.log(`Pro subscription: status=${subscription.status}, trial_end=${trialEnd}, userId=${userId}`);

      // Update user_entitlements for Pro subscription
      const { error: entitlementError } = await supabase.from("user_entitlements").upsert(
        {
          user_id: userId,
          plan: "pro",
          status: isTrialing ? "trialing" : "active",
          stripe_subscription_id: subscriptionId,
          trial_ends_at: trialEnd,
          current_period_ends_at: periodEnd,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (entitlementError) {
        console.error("Error updating entitlement from checkout:", entitlementError);
      } else {
        console.log(`Updated entitlement for user ${userId}: pro/${isTrialing ? "trialing" : "active"}`);
      }

      return new Response(
        JSON.stringify({ received: true, action: "pro_checkout_completed" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (err) {
      console.error("Error processing pro checkout:", err);
    }
  }

  // Acknowledge other checkout session types
  return new Response(
    JSON.stringify({ received: true, action: "checkout_session_completed" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// Handle subscription.deleted event
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<Response> {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const result = await updateUserProfile(customerId, {
    subscription_status: "free",
    subscription_id: null,
    price_id: null,
    current_period_end: null,
    cancel_at_period_end: false,
    trial_start: null,
    trial_end: null,
    // Keep is_trial_user for analytics tracking
  });

  // Also update new billing schema if available
  // P1-BILL-2 FIX: Set plan to 'none' on deletion (not 'pro')
  const userId = subscription.metadata?.supabase_user_id;
  if (userId) {
    await supabase.from("user_entitlements").upsert(
      {
        user_id: userId,
        plan: "none",  // FIXED: Was incorrectly set to 'pro'
        status: "canceled",
        stripe_subscription_id: null,  // Clear subscription reference
        current_period_ends_at: null,  // Clear period end
        trial_ends_at: null,  // Clear trial
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  }

  if (!result.success) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log(`Subscription deleted for customer ${customerId}, downgraded to free tier`);

  return new Response(
    JSON.stringify({ received: true, action: "subscription_deleted" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// Idempotency check: returns true if event was already processed
async function isEventProcessed(eventId: string): Promise<boolean> {
  const { data } = await supabase
    .from("processed_webhook_events")
    .select("id")
    .eq("id", eventId)
    .maybeSingle();
  return data !== null;
}

// Mark event as processed (returns false if already exists)
async function markEventProcessed(
  eventId: string,
  eventType: string,
  metadata: Record<string, unknown> = {}
): Promise<boolean> {
  const { error } = await supabase.from("processed_webhook_events").insert({
    id: eventId,
    event_type: eventType,
    metadata,
  });
  // If conflict (duplicate), error will be set
  return !error;
}

// Main handler
serve(async (req: Request): Promise<Response> => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get the raw body for signature verification
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("Missing stripe-signature header");
    return new Response(
      JSON.stringify({ error: "Missing stripe-signature header" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET environment variable");
    return new Response(
      JSON.stringify({ error: "Webhook secret not configured" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Verify the webhook signature
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return new Response(
      JSON.stringify({ error: `Webhook signature verification failed: ${errorMessage}` }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  console.log(`Received webhook event: ${event.type} (${event.id})`);

  // P0-BILL-1: Idempotency check - skip if already processed
  if (await isEventProcessed(event.id)) {
    console.log(`Event ${event.id} already processed, skipping`);
    return new Response(
      JSON.stringify({ received: true, action: "already_processed" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Mark as processed BEFORE handling (prevents race conditions)
  const marked = await markEventProcessed(event.id, event.type, {
    created: event.created,
    livemode: event.livemode,
  });

  if (!marked) {
    // Another worker already processing this event
    console.log(`Event ${event.id} being processed by another worker`);
    return new Response(
      JSON.stringify({ received: true, action: "duplicate_processing" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Handle the event based on type
  try {
    switch (event.type) {
      case "customer.subscription.created":
        return await handleSubscriptionCreated(
          event.data.object as Stripe.Subscription
        );

      case "customer.subscription.updated":
        return await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );

      case "customer.subscription.deleted":
        return await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );

      case "checkout.session.completed":
        return await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );

      default:
        // Acknowledge receipt of unhandled events
        console.log(`Unhandled event type: ${event.type}`);
        return new Response(
          JSON.stringify({ received: true, action: "ignored" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(`Error handling webhook event: ${errorMessage}`);
    return new Response(
      JSON.stringify({ error: `Error handling webhook: ${errorMessage}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

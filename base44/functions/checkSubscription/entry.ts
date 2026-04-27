import Stripe from "npm:stripe@14";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ subscribed: false, error: "Unauthorized" }, { status: 401 });
    }

    // Search for a Stripe customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 5 });

    if (customers.data.length === 0) {
      return Response.json({ subscribed: false });
    }

    // Check if any customer has an active subscription
    for (const customer of customers.data) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: "active",
        limit: 5,
      });
      if (subscriptions.data.length > 0) {
        return Response.json({ subscribed: true });
      }
    }

    return Response.json({ subscribed: false });
  } catch (error) {
    console.error("checkSubscription error:", error);
    return Response.json({ subscribed: false, error: error.message }, { status: 500 });
  }
});
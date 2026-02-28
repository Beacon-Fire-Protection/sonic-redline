import Stripe from "npm:stripe@14";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
const PRICE_ID = "price_1T5c6YBasBDL6eaX1Q4PP4Nj";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { poem_analysis_id, success_url, cancel_url } = await req.json();

    // Verify the user owns this poem analysis
    const records = await base44.entities.PoemAnalysis.filter({ id: poem_analysis_id });
    const record = records[0];

    if (!record) {
      return Response.json({ error: "Poem not found" }, { status: 404 });
    }

    if (record.created_by !== user.email) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      mode: "payment",
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        poem_analysis_id: poem_analysis_id,
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
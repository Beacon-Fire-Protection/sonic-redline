import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

/**
 * Reusable upgrade/subscribe CTA card.
 * Shows a $0.99/month subscribe button and handles the Stripe checkout flow.
 */
export default function UpgradeCard({ compact = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpgrade = async () => {
    if (window.self !== window.top) {
      alert("Checkout only works from the published app. Please open the app in a new tab.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const successUrl = window.location.origin + window.location.pathname + "?subscribed=1";
      const cancelUrl = window.location.href;

      const res = await base44.functions.invoke("createCheckout", {
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        throw new Error(res.data?.error || "No checkout URL returned.");
      }
    } catch (err) {
      console.error("Upgrade error:", err);
      setError("Could not start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <div>
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-3 text-sm font-bold tracking-[0.15em] uppercase flex items-center justify-center gap-2 disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary)) 0%, #a855f7 100%)",
            color: "hsl(var(--primary-foreground))",
          }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Subscribe — $0.99/mo
        </button>
        {error && <p className="text-xs mt-2 text-center" style={{ color: "#EC4899" }}>{error}</p>}
      </div>
    );
  }

  return (
    <div
      className="border p-5"
      style={{
        borderColor: "hsl(var(--primary) / 0.35)",
        background: "linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(280 100% 70% / 0.06) 100%)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
        <div className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "hsl(var(--primary))" }}>
          Save Your Poems
        </div>
      </div>
      <p className="text-sm mb-4 leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
        Subscribe for <strong style={{ color: "hsl(var(--foreground))" }}>$0.99/month</strong> to save poems and all their versions. Access your full revision history anytime.
      </p>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full py-3 text-xs font-bold tracking-[0.15em] uppercase flex items-center justify-center gap-2 disabled:opacity-60"
        style={{
          background: "linear-gradient(135deg, hsl(var(--primary)) 0%, #a855f7 100%)",
          color: "hsl(var(--primary-foreground))",
        }}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        Subscribe Now — $0.99/mo
      </button>
      {error && <p className="text-xs mt-2 text-center" style={{ color: "#EC4899" }}>{error}</p>}
    </div>
  );
}
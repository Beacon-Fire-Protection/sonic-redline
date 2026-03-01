import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Hook that checks if the current user has an active Stripe subscription.
 * Returns { subscribed, loading, error }
 */
export function useSubscription() {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    base44.functions.invoke("checkSubscription")
      .then(res => {
        setSubscribed(res.data?.subscribed === true);
      })
      .catch(err => {
        console.error("Subscription check failed:", err);
        setError(err);
        setSubscribed(false);
      })
      .finally(() => setLoading(false));
  }, []);

  return { subscribed, loading, error };
}
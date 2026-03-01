import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Loader2, User, ChevronRight, Bookmark } from "lucide-react";
import { useSubscription } from "@/components/useSubscription";
import UpgradeCard from "@/components/UpgradeCard";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedPoems, setSavedPoems] = useState([]);
  const { subscribed, loading: subLoading } = useSubscription();

  useEffect(() => {
    Promise.all([
      base44.auth.me().catch(() => null),
      base44.entities.PoemAnalysis.list("-created_date", 200),
    ]).then(([u, poems]) => {
      setUser(u);
      setSavedPoems(poems.filter(p => p.is_saved === true));
      setLoading(false);
    });
  }, []);

  if (loading || subLoading) return (
    <div className="h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)" }}>
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: "hsl(var(--muted-foreground))" }} />
    </div>
  );

  return (
    <div className="text-foreground" style={{ background: "linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)" }}>
      <style>{`
        .profile-muted-text { color: hsl(var(--muted-foreground)); }
        .profile-card {
          background-color: hsl(var(--card));
          border-color: hsl(var(--border));
          border-radius: 0.75rem;
        }
        .profile-badge {
          background: linear-gradient(135deg, hsl(var(--primary)) 0%, #a855f7 100%);
          color: hsl(var(--primary-foreground));
          border-radius: 0.5rem;
        }
        .profile-button {
          border-color: hsl(var(--border));
          color: hsl(var(--muted-foreground));
          transition: all 0.3s ease;
          border-radius: 0.75rem;
        }
        .profile-button:hover {
          color: hsl(var(--foreground));
          border-color: hsl(var(--primary) / 0.5);
          background-color: hsl(var(--primary) / 0.05);
        }
        .profile-poem-row {
          border-color: hsl(var(--border));
          transition: all 0.2s ease;
        }
        .profile-poem-row:hover {
          border-color: hsl(var(--primary) / 0.4);
          background-color: hsl(var(--primary) / 0.04);
        }
      `}</style>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <User className="w-6 h-6" style={{ color: "hsl(var(--primary))" }} />
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        </div>

        {/* Account */}
        <div className="profile-card border p-5">
          <div className="text-xs uppercase tracking-[0.2em] profile-muted-text mb-3">Account</div>
          {user ? (
            <div className="space-y-1">
              <div className="text-foreground font-bold">{user.full_name || "Poet"}</div>
              <div className="profile-muted-text text-sm">{user.email}</div>
              <div className="mt-3 inline-block profile-badge px-2.5 py-1 text-xs font-bold tracking-widest uppercase">
                {subscribed ? "Subscriber" : "Free"}
              </div>
            </div>
          ) : (
            <div className="profile-muted-text text-sm">Not signed in</div>
          )}
        </div>

        {/* Upgrade CTA for non-subscribers */}
        {user && !subscribed && (
          <UpgradeCard />
        )}

        {/* Saved Poems — only show for subscribers */}
        {subscribed && (
          <div className="profile-card border p-5">
            <div className="flex items-center gap-2 mb-3">
              <Bookmark className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
              <div className="text-xs uppercase tracking-[0.2em] profile-muted-text">Saved Poems</div>
            </div>
            {savedPoems.length === 0 ? (
              <p className="text-sm profile-muted-text">No saved poems yet.</p>
            ) : (
              <div className="space-y-1">
                {savedPoems.map(poem => (
                  <button
                    key={poem.id}
                    onClick={() => navigate(createPageUrl(`Analysis?id=${poem.id}`))}
                    className="profile-poem-row w-full flex items-center justify-between px-3 py-2.5 border text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate text-foreground">{poem.title || "Untitled"}</div>
                      <div className="text-xs profile-muted-text">v{poem.version_number} · Score {poem.poem_score}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 flex-shrink-0 ml-2" style={{ color: "hsl(var(--muted-foreground) / 0.5)" }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sign out */}
        {user && (
          <button
            onClick={() => base44.auth.logout()}
            className="profile-button w-full py-3 text-xs font-bold tracking-[0.15em] uppercase border"
          >
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

const LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a2266141888b3ccda1983d/a97572646_sonic.png";

const RHYTHM_REF = [
  ["Iambic",    "da-DUM da-DUM da-DUM da-DUM"],
  ["Trochaic",  "DUM-da DUM-da DUM-da DUM-da"],
  ["Anapestic", "da-da-DUM da-da-DUM da-da-DUM"],
  ["Dactylic",  "DUM-da-da DUM-da-da DUM-da-da"],
  ["Spondaic",  "DUM-DUM DUM-DUM"],
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)" }}>
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: "hsl(var(--muted-foreground))" }} />
    </div>
  );

  return (
    <div className="min-h-screen text-foreground" style={{ background: "linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)" }}>
      <style>{`
        .profile-header {
          background-color: hsl(var(--background));
          border-color: hsl(var(--border));
        }
        .profile-muted-text {
          color: hsl(var(--muted-foreground));
        }
        .profile-card {
          background-color: hsl(var(--card));
          border-color: hsl(var(--border));
        }
        .profile-badge {
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }
        .profile-button {
          border-color: hsl(var(--border));
          color: hsl(var(--muted-foreground));
          transition: all 0.3s ease;
        }
        .profile-button:hover {
          color: hsl(var(--foreground));
          border-color: hsl(var(--primary) / 0.5);
          background-color: hsl(var(--primary) / 0.05);
        }
        .profile-divider {
          border-color: hsl(var(--border));
        }
        .profile-logo {
          opacity: 0.6;
        }
      `}</style>

      <div className="px-4 pt-10 pb-5 border-b profile-header">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <img src={LOGO} alt="" className="profile-logo w-5 h-5 object-contain" />
            <span className="text-xs tracking-[0.2em] uppercase profile-muted-text">Sonic Redline</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--accent))" }}>Profile</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Account */}
        <div className="profile-card border p-5">
          <div className="text-xs uppercase tracking-[0.2em] profile-muted-text mb-3">Account</div>
          {user ? (
            <div className="space-y-1">
              <div className="text-foreground font-bold">{user.full_name || "Poet"}</div>
              <div className="profile-muted-text text-sm">{user.email}</div>
              <div className="mt-3 inline-block profile-badge px-2.5 py-1 text-xs font-bold tracking-widest uppercase">
                {user.role === "admin" ? "Admin" : "Free"}
              </div>
            </div>
          ) : (
            <div className="profile-muted-text text-sm">Not signed in</div>
          )}
        </div>

        {/* Rhythm Reference */}
        <div className="profile-card border p-5">
          <div className="text-xs uppercase tracking-[0.2em] profile-muted-text mb-4">Rhythm Reference</div>
          <div className="space-y-3">
            {RHYTHM_REF.map(([name, pattern]) => (
              <div key={name} className="flex justify-between items-baseline gap-4">
                <span className="text-foreground text-sm font-bold">{name}</span>
                <span className="profile-muted-text text-xs font-mono tracking-wide text-right">{pattern}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 profile-divider border-t text-xs profile-muted-text">
            <strong style={{ color: "hsl(var(--foreground))" }}>DUM</strong> = stressed · <strong style={{ color: "hsl(var(--foreground))" }}>da</strong> = unstressed
          </div>
        </div>

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
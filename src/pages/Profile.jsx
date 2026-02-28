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
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white">
      <div className="px-4 pt-10 pb-5 border-b border-white/8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <img src={LOGO} alt="" className="w-5 h-5 object-contain opacity-60" />
            <span className="text-xs tracking-[0.2em] uppercase text-white/30">Sonic Redline</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Account */}
        <div className="border border-white/8 p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-white/30 mb-3">Account</div>
          {user ? (
            <div className="space-y-1">
              <div className="text-white font-bold">{user.full_name || "Poet"}</div>
              <div className="text-white/40 text-sm">{user.email}</div>
              <div className="mt-3 inline-block px-2.5 py-1 text-xs font-bold tracking-widest uppercase" style={{ background: "#FF2D2D", color: "#fff" }}>
                {user.role === "admin" ? "Admin" : "Free"}
              </div>
            </div>
          ) : (
            <div className="text-white/40 text-sm">Not signed in</div>
          )}
        </div>

        {/* Rhythm Reference */}
        <div className="border border-white/8 p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-white/30 mb-4">Rhythm Reference</div>
          <div className="space-y-3">
            {RHYTHM_REF.map(([name, pattern]) => (
              <div key={name} className="flex justify-between items-baseline gap-4">
                <span className="text-white/60 text-sm font-bold">{name}</span>
                <span className="text-white/30 text-xs font-mono tracking-wide text-right">{pattern}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/8 text-xs text-white/25">
            <strong className="text-white/40">DUM</strong> = stressed · <strong className="text-white/40">da</strong> = unstressed
          </div>
        </div>

        {/* Sign out */}
        {user && (
          <button
            onClick={() => base44.auth.logout()}
            className="w-full py-3 text-xs font-bold tracking-[0.15em] uppercase text-white/40 hover:text-white/70 border border-white/10 hover:border-white/25 transition-colors"
          >
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
}
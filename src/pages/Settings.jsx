import { Settings as SettingsIcon, Trash2, BookOpen, Info } from "lucide-react";
import { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function Settings() {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleDeleteAccount = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    // In a real app: await base44.auth.deleteAccount();
    setDeleted(true);
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <SettingsIcon className="w-5 h-5 text-amber-400/70" />
          <h1 className="text-2xl font-light text-white">Settings</h1>
        </div>

        {/* About */}
        <div className="mb-6 rounded-2xl border border-white/8 bg-[#141417] divide-y divide-white/5">
          <div className="px-5 py-4 flex items-center gap-3">
            <BookOpen className="w-4 h-4 text-amber-400/60" />
            <div>
              <div className="text-sm text-white/80">Metrical Muse</div>
              <div className="text-xs text-white/30 mt-0.5">Pentameter analyzer for poetry lovers</div>
            </div>
          </div>
          <div className="px-5 py-4 flex items-center gap-3">
            <Info className="w-4 h-4 text-white/30" />
            <div>
              <div className="text-xs text-white/30">Version 1.0</div>
            </div>
          </div>
        </div>

        {/* Clear History */}
        <div className="mb-6 rounded-2xl border border-white/8 bg-[#141417]">
          <button
            onClick={() => { localStorage.removeItem("meter_history"); }}
            className="w-full px-5 py-4 text-left flex items-center justify-between select-none hover:bg-white/5 transition-colors rounded-2xl"
          >
            <span className="text-sm text-white/70">Clear Analysis History</span>
            <Trash2 className="w-4 h-4 text-white/30" />
          </button>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl border border-red-900/40 bg-red-950/20">
          <div className="px-5 py-3 border-b border-red-900/30">
            <span className="text-xs uppercase tracking-widest text-red-500/60 font-medium">Danger Zone</span>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm text-white/40 mb-4 leading-relaxed">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            {deleted ? (
              <p className="text-sm text-red-400">Account deletion initiated. Logging out…</p>
            ) : (
              <button
                onClick={handleDeleteAccount}
                className="w-full py-3 rounded-xl text-sm font-medium tracking-wide select-none transition-all duration-200"
                style={{
                  background: confirmDelete ? "#7f1d1d" : "#1a0a0a",
                  border: "1px solid #7f1d1d",
                  color: confirmDelete ? "#fca5a5" : "#ef4444",
                }}
              >
                {confirmDelete ? "Tap again to confirm deletion" : "Delete Account"}
              </button>
            )}
            {confirmDelete && !deleted && (
              <button
                onClick={() => setConfirmDelete(false)}
                className="w-full mt-2 py-2 text-xs text-white/30 hover:text-white/50 transition-colors select-none"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
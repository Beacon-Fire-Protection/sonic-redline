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
    <div className="min-h-screen text-white px-4 py-12" style={{ background: "linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)" }}>
      <style>{`
        .settings-card {
          background-color: hsl(var(--card));
          border-color: hsl(var(--border));
        }
        .settings-card-divider {
          border-color: hsl(var(--border));
        }
        .settings-icon-accent {
          color: hsl(var(--accent));
        }
        .settings-text-secondary {
          color: hsl(var(--muted-foreground));
        }
        .settings-text-muted {
          color: hsl(var(--muted-foreground));
        }
        .settings-hover:hover {
          background-color: hsl(var(--accent) / 0.05);
        }
        .settings-danger-zone {
          background-color: hsl(var(--primary) / 0.08);
          border-color: hsl(var(--primary) / 0.2);
        }
        .settings-danger-header {
          border-color: hsl(var(--primary) / 0.2);
        }
        .settings-danger-text {
          color: hsl(var(--primary) / 0.7);
        }
        .settings-delete-button-default {
          background-color: hsl(var(--primary) / 0.1);
          border-color: hsl(var(--primary) / 0.3);
          color: hsl(var(--primary));
          transition: all 0.2s ease;
        }
        .settings-delete-button-confirm {
          background-color: hsl(var(--primary) / 0.3);
          border-color: hsl(var(--primary));
          color: hsl(var(--primary));
        }
        .settings-delete-button-default:hover,
        .settings-delete-button-confirm:hover {
          filter: brightness(1.1);
          box-shadow: 0 0 12px hsl(var(--primary) / 0.3);
        }
        .settings-cancel-button {
          color: hsl(var(--muted-foreground));
          transition: color 0.2s ease;
        }
        .settings-cancel-button:hover {
          color: hsl(var(--foreground));
        }
      `}</style>

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <SettingsIcon className="w-5 h-5 settings-icon-accent" />
          <h1 className="text-2xl font-light text-foreground">Settings</h1>
        </div>

        {/* About */}
        <div className="mb-6 rounded-2xl border settings-card divide-y settings-card-divider">
          <div className="px-5 py-4 flex items-center gap-3">
            <BookOpen className="w-4 h-4 settings-icon-accent" />
            <div>
              <div className="text-sm text-foreground">Metrical Muse</div>
              <div className="text-xs settings-text-muted mt-0.5">Pentameter analyzer for poetry lovers</div>
            </div>
          </div>
          <div className="px-5 py-4 flex items-center gap-3">
            <Info className="w-4 h-4 settings-text-muted" />
            <div>
              <div className="text-xs settings-text-muted">Version 1.0</div>
            </div>
          </div>
        </div>

        {/* Clear History */}
        <div className="mb-6 rounded-2xl border settings-card">
          <button
            onClick={() => { localStorage.removeItem("meter_history"); }}
            className="w-full px-5 py-4 text-left flex items-center justify-between select-none settings-hover transition-colors rounded-2xl"
          >
            <span className="text-sm settings-text-secondary">Clear Analysis History</span>
            <Trash2 className="w-4 h-4 settings-text-muted" />
          </button>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl border settings-danger-zone">
          <div className="px-5 py-3 border-b settings-danger-header">
            <span className="text-xs uppercase tracking-widest settings-danger-text font-medium">Danger Zone</span>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm settings-text-secondary mb-4 leading-relaxed">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            {deleted ? (
              <p className="text-sm text-primary">Account deletion initiated. Logging out…</p>
            ) : (
              <>
                <button
                  onClick={handleDeleteAccount}
                  className={`w-full py-3 rounded-xl text-sm font-medium tracking-wide select-none border ${
                    confirmDelete ? "settings-delete-button-confirm" : "settings-delete-button-default"
                  }`}
                >
                  {confirmDelete ? "Tap again to confirm deletion" : "Delete Account"}
                </button>
                {confirmDelete && !deleted && (
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="settings-cancel-button w-full mt-2 py-2 text-xs select-none"
                  >
                    Cancel
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
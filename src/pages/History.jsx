import { Clock, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

// Pentameter colors mapped to unicorn LEGO palette
const PENTAMETERS = {
  iambic: { color: "#FBBF24", bg: "hsl(var(--primary) / 0.08)", border: "hsl(var(--primary) / 0.25)" },
  trochaic: { color: "#EC4899", bg: "hsl(var(--primary) / 0.08)", border: "hsl(var(--primary) / 0.25)" },
  anapestic: { color: "#10B981", bg: "hsl(var(--primary) / 0.08)", border: "hsl(var(--primary) / 0.25)" },
  dactylic: { color: "#10B981", bg: "hsl(var(--primary) / 0.08)", border: "hsl(var(--primary) / 0.25)" },
  spondaic: { color: "#EC4899", bg: "hsl(var(--primary) / 0.08)", border: "hsl(var(--primary) / 0.25)" },
};

export default function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("meter_history");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("meter_history");
    setHistory([]);
  };

  const removeItem = (idx) => {
    const updated = history.filter((_, i) => i !== idx);
    setHistory(updated);
    localStorage.setItem("meter_history", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen text-foreground px-4 py-12" style={{ background: "linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)" }}>
      <style>{`
        .history-header-icon {
          color: hsl(var(--primary));
        }
        .history-title {
          color: hsl(var(--foreground));
        }
        .history-clear-button {
          color: hsl(var(--muted-foreground));
          transition: all 0.3s ease;
        }
        .history-clear-button:hover {
          color: hsl(var(--foreground));
        }
        .history-empty-icon {
          color: hsl(var(--muted-foreground) / 0.3);
        }
        .history-empty-text {
          color: hsl(var(--muted-foreground));
        }
        .history-empty-subtext {
          color: hsl(var(--muted-foreground) / 0.6);
        }
        .history-item {
          border-color: hsl(var(--border));
          background-color: hsl(var(--card) / 0.5);
          transition: all 0.2s ease;
        }
        .history-item:hover {
          background-color: hsl(var(--card) / 0.7);
          border-color: hsl(var(--primary) / 0.3);
        }
        .history-meter-label {
          color: hsl(var(--primary));
        }
        .history-sentence {
          color: hsl(var(--foreground) / 0.7);
        }
        .history-date {
          color: hsl(var(--muted-foreground) / 0.5);
        }
        .history-delete-button {
          color: hsl(var(--muted-foreground) / 0.4);
          transition: all 0.2s ease;
        }
        .history-delete-button:hover {
          color: #EC4899;
        }
      `}</style>

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Clock className="history-header-icon w-5 h-5" />
            <h1 className="history-title text-2xl font-light">History</h1>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="history-clear-button text-xs uppercase tracking-widest select-none"
            >
              Clear All
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-24">
            <Clock className="history-empty-icon w-10 h-10 mx-auto mb-4" />
            <p className="history-empty-text text-sm">No analyses yet.</p>
            <p className="history-empty-subtext text-xs mt-1">Analyzed sentences will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item, idx) => {
              const p = PENTAMETERS[item.meter] || PENTAMETERS.iambic;
              return (
                <div
                  key={idx}
                  className="history-item rounded-2xl border p-4 flex items-start justify-between gap-3"
                  style={{ borderColor: p.border, backgroundColor: p.bg }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="history-meter-label text-xs uppercase tracking-widest mb-1 font-medium" style={{ color: p.color }}>
                      {item.meter} · {item.confidence}%
                    </div>
                    <p className="history-sentence text-sm leading-relaxed truncate">{item.sentence}</p>
                    <p className="history-date text-xs mt-1">{item.date}</p>
                  </div>
                  <button
                    onClick={() => removeItem(idx)}
                    className="history-delete-button mt-1 select-none flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
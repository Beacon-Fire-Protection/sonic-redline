import { Clock, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const PENTAMETERS = {
  iambic: { color: "#C9A84C", bg: "from-amber-950/70 to-yellow-900/50", border: "border-amber-700/60" },
  trochaic: { color: "#9B7ADE", bg: "from-purple-950/70 to-violet-900/50", border: "border-purple-700/60" },
  anapestic: { color: "#5FAAD9", bg: "from-blue-950/70 to-cyan-900/50", border: "border-blue-700/60" },
  dactylic: { color: "#5DB88A", bg: "from-emerald-950/70 to-green-900/50", border: "border-emerald-700/60" },
  spondaic: { color: "#D9705F", bg: "from-red-950/70 to-rose-900/50", border: "border-red-700/60" },
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
    <div className="min-h-screen bg-[#0D0D0F] text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400/70" />
            <h1 className="text-2xl font-light text-white">History</h1>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs text-white/30 hover:text-white/60 transition-colors select-none uppercase tracking-widest"
            >
              Clear All
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-24 text-white/20">
            <Clock className="w-10 h-10 mx-auto mb-4 opacity-30" />
            <p className="text-sm">No analyses yet.</p>
            <p className="text-xs mt-1 opacity-60">Analyzed sentences will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item, idx) => {
              const p = PENTAMETERS[item.meter] || PENTAMETERS.iambic;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border ${p.border} bg-gradient-to-br ${p.bg} p-4 flex items-start justify-between gap-3`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs uppercase tracking-widest mb-1 font-medium" style={{ color: p.color }}>
                      {item.meter} · {item.confidence}%
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed truncate">{item.sentence}</p>
                    <p className="text-white/25 text-xs mt-1">{item.date}</p>
                  </div>
                  <button
                    onClick={() => removeItem(idx)}
                    className="text-white/20 hover:text-white/50 transition-colors mt-1 select-none flex-shrink-0"
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
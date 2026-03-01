import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Music, Loader2 } from "lucide-react";

// Unicorn LEGO rhythm palette - vibrant and magical!
const PENTAMETER_STYLES = {
  iambic:    { color: "#FBBF24", bg: "from-yellow-950/60 to-amber-900/40",   border: "border-yellow-600/50"   },
  trochaic:  { color: "#F472B6", bg: "from-pink-950/60 to-rose-900/40",      border: "border-pink-600/50"    },
  anapestic: { color: "#06B6D4", bg: "from-cyan-950/60 to-blue-900/40",      border: "border-cyan-600/50"    },
  dactylic:  { color: "#10B981", bg: "from-emerald-950/60 to-green-900/40",  border: "border-emerald-600/50" },
  spondaic:  { color: "#EC4899", bg: "from-purple-950/60 to-violet-900/40",  border: "border-purple-600/50"  },
};

const STRESS_COLORS = {
  stressed:   "text-white font-bold",
  unstressed: "text-white/40 font-normal",
};

export default function RhythmHelper() {
  const [sentence, setSentence] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!sentence.trim()) return;
    setLoading(true);
    setResult(null);

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze the meter of this line of poetry or sentence: "${sentence}"\n\nBreak it into syllables, mark each syllable as stressed or unstressed, identify the dominant metrical foot (iambic, trochaic, anapestic, dactylic, or spondaic), and give a confidence score 0-100.`,
      response_json_schema: {
        type: "object",
        properties: {
          meter: { type: "string", description: "one of: iambic, trochaic, anapestic, dactylic, spondaic" },
          confidence: { type: "number", description: "0-100" },
          syllables: {
            type: "array",
            items: {
              type: "object",
              properties: {
                syllable: { type: "string" },
                stress: { type: "string", description: "stressed or unstressed" },
              },
            },
          },
          explanation: { type: "string" },
        },
      },
    });

    setResult(res);
    setLoading(false);
  };

  const style = result ? (PENTAMETER_STYLES[result.meter] || PENTAMETER_STYLES.iambic) : null;

  return (
    <div className="text-white px-4 py-6" style={{ background: "linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)" }}>
      <style>{`
        .rhythm-input {
          background-color: hsl(var(--input));
          border-color: hsl(var(--border));
          color: hsl(var(--foreground));
          border-radius: 0.75rem;
        }
        .rhythm-input::placeholder {
          color: hsl(var(--muted-foreground));
        }
        .rhythm-input:focus {
          border-color: hsl(var(--primary) / 0.7);
          outline: none;
          box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2);
        }
        .rhythm-button {
          background: linear-gradient(135deg, hsl(var(--primary)) 0%, #a855f7 100%);
          color: hsl(var(--primary-foreground));
          transition: all 0.3s ease;
          border-radius: 0.75rem;
        }
        .rhythm-button:hover:not(:disabled) {
          filter: brightness(1.15);
          box-shadow: 0 0 24px hsl(var(--primary) / 0.5);
        }
        .rhythm-button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .rhythm-label {
          color: hsl(var(--muted-foreground));
        }
        .rhythm-text-secondary {
          color: hsl(var(--muted-foreground));
        }
        .rhythm-reference {
          background-color: hsl(var(--input));
          border-color: hsl(var(--border));
          border-radius: 0.75rem;
        }
      `}</style>

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <Music className="w-6 h-6" style={{ color: "#F472B6" }} />
          <h1 className="text-2xl font-bold text-foreground">Rhythm Analyzer</h1>
        </div>
        <p className="rhythm-text-secondary text-sm mb-6 leading-relaxed">
          Paste a line to detect its metrical pattern and syllable stresses.
        </p>

        {/* Input */}
        <div className="flex gap-3 mb-6">
          <input
            value={sentence}
            onChange={e => setSentence(e.target.value)}
            onKeyDown={e => e.key === "Enter" && analyze()}
            placeholder="Shall I compare thee to a summer's day?"
            className="rhythm-input flex-1 border px-4 py-3 transition-colors text-sm"
          />
          <button
            onClick={analyze}
            disabled={loading || !sentence.trim()}
            className="rhythm-button px-5 py-3 text-sm font-medium select-none"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Scan"}
          </button>
        </div>

        {/* Result */}
        {result && style && (
          <div className={`border ${style.border} bg-gradient-to-br ${style.bg} p-6 space-y-5 rounded-xl`}>
            {/* Meter + confidence */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest rhythm-label mb-1 select-none">Meter</div>
                <div className="text-2xl font-light capitalize" style={{ color: style.color }}>{result.meter}</div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-widest rhythm-label mb-1 select-none">Confidence</div>
                <div className="text-2xl font-light text-white">{result.confidence}%</div>
              </div>
            </div>

            {/* Syllable stress breakdown */}
            {result.syllables?.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-widest rhythm-label mb-3 select-none">Syllable Breakdown</div>
                <div className="flex flex-wrap gap-2">
                  {result.syllables.map((s, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className={`text-sm font-mono ${STRESS_COLORS[s.stress] || "text-white/50"}`}>
                        {s.stress === "stressed" ? s.syllable.toUpperCase() : s.syllable}
                      </span>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.stress === "stressed" ? "bg-white" : "bg-white/20"}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Explanation */}
            {result.explanation && (
              <div>
                <div className="text-xs uppercase tracking-widest rhythm-label mb-2 select-none">Analysis</div>
                <p className="text-white/70 text-sm leading-relaxed">{result.explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* Reference */}
        <div className="mt-6 p-4 rhythm-reference border">
          <div className="text-xs uppercase tracking-widest rhythm-label mb-3 select-none">Quick Reference</div>
          <div className="space-y-1.5">
            {[
              ["Iambic", "da-DUM da-DUM da-DUM da-DUM"],
              ["Trochaic", "DUM-da DUM-da DUM-da DUM-da"],
              ["Anapestic", "da-da-DUM da-da-DUM da-da-DUM"],
              ["Dactylic", "DUM-da-da DUM-da-da DUM-da-da"],
              ["Spondaic", "DUM-DUM DUM-DUM DUM-DUM"],
            ].map(([name, pat]) => (
              <div key={name} className="flex justify-between text-xs">
                <span className="rhythm-text-secondary">{name}</span>
                <span className="text-white/40 font-mono">{pat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
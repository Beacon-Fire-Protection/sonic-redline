import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Music, Loader2 } from "lucide-react";

const PENTAMETER_STYLES = {
  iambic:    { color: "#C9A84C", bg: "from-amber-950/70 to-yellow-900/50",   border: "border-amber-700/60"   },
  trochaic:  { color: "#9B7ADE", bg: "from-purple-950/70 to-violet-900/50",  border: "border-purple-700/60"  },
  anapestic: { color: "#5FAAD9", bg: "from-blue-950/70 to-cyan-900/50",      border: "border-blue-700/60"    },
  dactylic:  { color: "#5DB88A", bg: "from-emerald-950/70 to-green-900/50",  border: "border-emerald-700/60" },
  spondaic:  { color: "#D9705F", bg: "from-red-950/70 to-rose-900/50",       border: "border-red-700/60"     },
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
    <div className="min-h-screen bg-[#1A1A1A] text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-1">Rhythm Analyzer</h1>
        <p className="text-white/30 text-sm mb-8 leading-relaxed">
          Paste a line to detect its metrical pattern and syllable stresses.
        </p>

        {/* Input */}
        <div className="flex gap-3 mb-8">
          <input
            value={sentence}
            onChange={e => setSentence(e.target.value)}
            onKeyDown={e => e.key === "Enter" && analyze()}
            placeholder="Shall I compare thee to a summer's day?"
            className="flex-1 bg-[#111] border border-white/10 px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#FF2D2D]/50 transition-colors text-sm"
          />
          <button
            onClick={analyze}
            disabled={loading || !sentence.trim()}
            className="px-5 py-3 rounded-xl text-sm font-medium select-none transition-all disabled:opacity-30"
            style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff" }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Scan"}
          </button>
        </div>

        {/* Result */}
        {result && style && (
          <div className={`rounded-2xl border ${style.border} bg-gradient-to-br ${style.bg} p-6 space-y-6`}>
            {/* Meter + confidence */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-white/30 mb-1 select-none">Meter</div>
                <div className="text-2xl font-light capitalize" style={{ color: style.color }}>{result.meter}</div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-widest text-white/30 mb-1 select-none">Confidence</div>
                <div className="text-2xl font-light text-white">{result.confidence}%</div>
              </div>
            </div>

            {/* Syllable stress breakdown */}
            {result.syllables?.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-widest text-white/30 mb-3 select-none">Syllable Breakdown</div>
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
                <div className="text-xs uppercase tracking-widest text-white/30 mb-2 select-none">Analysis</div>
                <p className="text-white/55 text-sm leading-relaxed">{result.explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* Reference */}
        <div className="mt-10 p-4 rounded-xl bg-[#141417] border border-white/8">
          <div className="text-xs uppercase tracking-widest text-white/25 mb-3 select-none">Quick Reference</div>
          <div className="space-y-1.5">
            {[
              ["Iambic", "da-DUM da-DUM da-DUM da-DUM"],
              ["Trochaic", "DUM-da DUM-da DUM-da DUM-da"],
              ["Anapestic", "da-da-DUM da-da-DUM da-da-DUM"],
              ["Dactylic", "DUM-da-da DUM-da-da DUM-da-da"],
              ["Spondaic", "DUM-DUM DUM-DUM DUM-DUM"],
            ].map(([name, pat]) => (
              <div key={name} className="flex justify-between text-xs">
                <span className="text-white/35">{name}</span>
                <span className="text-white/20 font-mono">{pat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
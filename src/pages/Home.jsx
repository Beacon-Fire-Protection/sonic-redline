import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, BookOpen } from "lucide-react";

const PENTAMETERS = {
  iambic: {
    name: "Iambic",
    pattern: "da-DUM",
    repeat: "da-DUM da-DUM da-DUM da-DUM da-DUM",
    description: "Unstressed followed by stressed — the heartbeat of English poetry",
    color: "#C9A84C",
    bg: "from-amber-950/70 to-yellow-900/50",
    border: "border-amber-700/60",
    example: "Shall I com-PARE thee TO a SUM-mer's DAY",
  },
  trochaic: {
    name: "Trochaic",
    pattern: "DUM-da",
    repeat: "DUM-da DUM-da DUM-da DUM-da DUM-da",
    description: "Stressed followed by unstressed — falling, insistent, driving",
    color: "#9B7ADE",
    bg: "from-purple-950/40 to-violet-900/20",
    border: "border-purple-700/40",
    example: "TY-ger TY-ger BURN-ing BRIGHT",
  },
  anapestic: {
    name: "Anapestic",
    pattern: "da-da-DUM",
    repeat: "da-da-DUM da-da-DUM da-da-DUM",
    description: "Two unstressed then stressed — galloping, light, and swift",
    color: "#5FAAD9",
    bg: "from-blue-950/40 to-cyan-900/20",
    border: "border-blue-700/40",
    example: "And the SOUND of a VOICE that is STILL",
  },
  dactylic: {
    name: "Dactylic",
    pattern: "DUM-da-da",
    repeat: "DUM-da-da DUM-da-da DUM-da-da",
    description: "Stressed then two unstressed — tumbling, classical, expansive",
    color: "#5DB88A",
    bg: "from-emerald-950/40 to-green-900/20",
    border: "border-emerald-700/40",
    example: "EV-ery-y MORN-ing I WAKE and I TEM-per my",
  },
  spondaic: {
    name: "Spondaic",
    pattern: "DUM-DUM",
    repeat: "DUM-DUM DUM-DUM DUM-DUM",
    description: "Both syllables stressed — heavy, slow, emphatic",
    color: "#D9705F",
    bg: "from-red-950/40 to-rose-900/20",
    border: "border-red-700/40",
    example: "STONE WALL COLD NIGHT",
  },
};

export default function Home() {
  const [sentence, setSentence] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!sentence.trim()) return;
    setLoading(true);
    setResult(null);

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a poetry and prosody expert. Analyze the following sentence and determine which metrical foot/pentameter it most closely resembles.

Sentence: "${sentence}"

The options are:
- iambic: unstressed-STRESSED pattern (da-DUM da-DUM), like Shakespeare's sonnets
- trochaic: STRESSED-unstressed (DUM-da DUM-da), like "Tiger Tiger Burning Bright"
- anapestic: unstressed-unstressed-STRESSED (da-da-DUM), galloping rhythm
- dactylic: STRESSED-unstressed-unstressed (DUM-da-da), classical falling rhythm
- spondaic: STRESSED-STRESSED, heavy equal stress on both syllables

Instructions:
1. Count the syllables in each word
2. Determine the stress pattern of the sentence
3. Identify which meter best fits
4. Mark each syllable as either stressed (uppercase) or unstressed (lowercase) in a breakdown
5. Return which meter type it is, a confidence score (0-100), a syllable-by-syllable breakdown, and a brief explanation

Return ONLY valid JSON like this:
{
  "meter": "iambic",
  "confidence": 85,
  "syllable_breakdown": [
    {"word": "the", "syllables": ["the"], "stresses": ["unstressed"]},
    {"word": "quick", "syllables": ["quick"], "stresses": ["stressed"]},
    {"word": "brown", "syllables": ["brown"], "stresses": ["stressed"]}
  ],
  "pattern_display": "da-DUM-DUM",
  "explanation": "Brief explanation of why this meter fits",
  "closest_match": true
}`,
      response_json_schema: {
        type: "object",
        properties: {
          meter: { type: "string" },
          confidence: { type: "number" },
          syllable_breakdown: {
            type: "array",
            items: {
              type: "object",
              properties: {
                word: { type: "string" },
                syllables: { type: "array", items: { type: "string" } },
                stresses: { type: "array", items: { type: "string" } },
              },
            },
          },
          pattern_display: { type: "string" },
          explanation: { type: "string" },
        },
      },
    });

    setResult(response);
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") analyze();
  };

  const meter = result ? PENTAMETERS[result.meter] : null;

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-white flex flex-col items-center justify-start px-4 py-16">
      {/* Header */}
      <div className="flex flex-col items-center mb-14 text-center">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-amber-400 opacity-80" />
          <span className="text-xs tracking-[0.3em] uppercase text-amber-400/70 font-medium">
            Metrical Analysis
          </span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-light text-white tracking-tight leading-none mb-4">
          Pentameter
        </h1>
        <p className="text-[#888] text-base max-w-md leading-relaxed">
          Enter any sentence and discover its underlying rhythmic meter —
          the heartbeat of poetry.
        </p>
      </div>

      {/* Input */}
      <div className="w-full max-w-2xl mb-8">
        <div className="relative">
          <textarea
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type or paste a sentence here…"
            rows={3}
            className="w-full bg-[#141417] border border-white/10 rounded-2xl px-6 py-5 text-white text-lg placeholder-white/20 resize-none focus:outline-none focus:border-white/25 transition-colors leading-relaxed"
          />
          <div className="absolute bottom-4 right-4 text-xs text-white/20">
            Press Enter to analyze
          </div>
        </div>
        <button
          onClick={analyze}
          disabled={loading || !sentence.trim()}
          className="mt-4 w-full py-4 rounded-2xl text-sm font-medium tracking-widest uppercase transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: loading || !sentence.trim()
              ? "#222"
              : "linear-gradient(135deg, #C9A84C 0%, #E8C96A 100%)",
            color: loading || !sentence.trim() ? "#666" : "#0D0D0F",
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing rhythm…
            </span>
          ) : (
            "Analyze Meter"
          )}
        </button>
      </div>

      {/* Result */}
      {result && meter && (
        <div
          className={`w-full max-w-2xl rounded-3xl border ${meter.border} bg-gradient-to-br ${meter.bg} backdrop-blur-sm p-8 animate-in fade-in slide-in-from-bottom-4 duration-500`}
        >
          {/* Meter name + confidence */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div
                className="text-xs tracking-[0.3em] uppercase mb-2 font-medium"
                style={{ color: meter.color }}
              >
                Detected Meter
              </div>
              <h2 className="text-4xl font-light" style={{ color: meter.color }}>
                {meter.name}
              </h2>
              <p className="text-white/40 text-sm mt-1 italic">{meter.pattern}</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/30 uppercase tracking-widest mb-1">
                Confidence
              </div>
              <div className="text-3xl font-light" style={{ color: meter.color }}>
                {result.confidence}%
              </div>
            </div>
          </div>

          {/* Pattern display */}
          <div className="mb-6 p-4 rounded-xl bg-black/30 border border-white/5">
            <div className="text-xs text-white/30 uppercase tracking-widest mb-2">
              Ideal Pattern
            </div>
            <div className="text-white/60 text-sm font-mono">{meter.repeat}</div>
          </div>

          {/* Syllable breakdown */}
          {result.syllable_breakdown && result.syllable_breakdown.length > 0 && (
            <div className="mb-6">
              <div className="text-xs text-white/30 uppercase tracking-widest mb-3">
                Syllable Breakdown
              </div>
              <div className="flex flex-wrap gap-3">
                {result.syllable_breakdown.map((wordObj, wi) => (
                  <div key={wi} className="flex flex-col items-center">
                    <div className="flex gap-1 mb-1">
                      {wordObj.syllables.map((syl, si) => {
                        const isStressed =
                          wordObj.stresses?.[si] === "stressed";
                        return (
                          <div
                            key={si}
                            className={`px-2 py-1 rounded-md text-sm font-mono transition-all ${
                              isStressed
                                ? "text-white font-bold"
                                : "text-white/35 font-normal"
                            }`}
                            style={{
                              background: isStressed
                                ? `${meter.color}22`
                                : "transparent",
                              border: isStressed
                                ? `1px solid ${meter.color}55`
                                : "1px solid transparent",
                            }}
                          >
                            {isStressed ? syl.toUpperCase() : syl.toLowerCase()}
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-white/20 text-xs">{wordObj.word}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explanation */}
          <div className="p-4 rounded-xl bg-black/20 border border-white/5">
            <div className="text-xs text-white/30 uppercase tracking-widest mb-2">
              Analysis
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              {result.explanation}
            </p>
          </div>

          {/* Description */}
          <p className="mt-4 text-white/25 text-xs text-center italic">
            {meter.description}
          </p>
        </div>
      )}

      {/* Reference guide */}
      {!result && !loading && (
        <div className="w-full max-w-2xl mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(PENTAMETERS).map(([key, p]) => (
              <div
                key={key}
                className={`rounded-2xl border ${p.border} bg-gradient-to-br ${p.bg} p-4 cursor-pointer hover:opacity-80 transition-opacity`}
                onClick={() => setSentence(p.example)}
              >
                <div
                  className="text-xs font-medium uppercase tracking-widest mb-1"
                  style={{ color: p.color }}
                >
                  {p.name}
                </div>
                <div className="text-white/40 text-xs font-mono mb-2">{p.pattern}</div>
                <div className="text-white/30 text-xs italic">"{p.example}"</div>
              </div>
            ))}
          </div>
          <p className="text-center text-white/15 text-xs mt-4">
            Click any card to try an example
          </p>
        </div>
      )}
    </div>
  );
}
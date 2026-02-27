import { Music } from "lucide-react";

const METERS = [
  { name: "Iambic", pattern: "da-DUM da-DUM da-DUM da-DUM", color: "#C9A84C", bg: "from-amber-950/70 to-yellow-900/50", border: "border-amber-700/60", description: "Unstressed then stressed. The heartbeat of English poetry. Shakespeare's sonnets." },
  { name: "Trochaic", pattern: "DUM-da DUM-da DUM-da DUM-da", color: "#9B7ADE", bg: "from-purple-950/70 to-violet-900/50", border: "border-purple-700/60", description: "Stressed then unstressed. Falling, insistent, driving. Blake's Tiger." },
  { name: "Anapestic", pattern: "da-da-DUM da-da-DUM da-da-DUM", color: "#5FAAD9", bg: "from-blue-950/70 to-cyan-900/50", border: "border-blue-700/60", description: "Two unstressed then stressed. Galloping, light, swift. Byron." },
  { name: "Dactylic", pattern: "DUM-da-da DUM-da-da DUM-da-da", color: "#5DB88A", bg: "from-emerald-950/70 to-green-900/50", border: "border-emerald-700/60", description: "Stressed then two unstressed. Tumbling, classical, expansive. Homer (translated)." },
  { name: "Spondaic", pattern: "DUM-DUM DUM-DUM DUM-DUM", color: "#D9705F", bg: "from-red-950/70 to-rose-900/50", border: "border-red-700/60", description: "Both syllables equally stressed. Heavy, slow, emphatic. Used sparingly for weight." },
];

export default function RhythmHelper() {
  return (
    <div className="min-h-screen bg-[#0D0D0F] text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4 select-none">
          <Music className="w-5 h-5 text-purple-400/70" />
          <h1 className="text-2xl font-light text-white">Rhythm Reference</h1>
        </div>
        <p className="text-white/30 text-sm mb-10 leading-relaxed">
          Static reference for metrical foot patterns. Use when identifying rhythm in your lines.
        </p>

        <div className="space-y-4">
          {METERS.map((m) => (
            <div key={m.name} className={`rounded-2xl border ${m.border} bg-gradient-to-br ${m.bg} p-5`}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="text-sm font-semibold mb-1" style={{ color: m.color }}>{m.name}</div>
                  <div className="font-mono text-white/80 text-base tracking-wide">{m.pattern}</div>
                </div>
              </div>
              <p className="text-white/40 text-xs leading-relaxed">{m.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 rounded-xl bg-[#141417] border border-white/8">
          <div className="text-xs uppercase tracking-widest text-white/25 mb-2 select-none">Reading the patterns</div>
          <p className="text-white/35 text-xs leading-relaxed">
            <strong className="text-white/50">DUM</strong> = stressed syllable &nbsp;·&nbsp;
            <strong className="text-white/50">da</strong> = unstressed syllable.<br />
            Most English poems mix meters. Identify the dominant pattern, then note where the poem breaks from it and why.
          </p>
        </div>
      </div>
    </div>
  );
}
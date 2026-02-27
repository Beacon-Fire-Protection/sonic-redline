import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart2, Loader2 } from "lucide-react";

export default function Dashboard() {
  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.PoemAnalysis.list("-created_date", 200).then(data => {
      setPoems(data);
      setLoading(false);
    });
  }, []);

  // Latest version per title
  const latestPerTitle = Object.values(
    poems.reduce((acc, p) => {
      const key = p.title || "Untitled";
      if (!acc[key] || p.version_number > acc[key].version_number) acc[key] = p;
      return acc;
    }, {})
  );

  const totalRed = latestPerTitle.reduce((s, p) => s + (p.red_count || 0), 0);
  const totalYellow = latestPerTitle.reduce((s, p) => s + (p.yellow_count || 0), 0);
  const totalGreen = latestPerTitle.reduce((s, p) => s + (p.green_count || 0), 0);
  const avgScore = latestPerTitle.length
    ? (latestPerTitle.reduce((s, p) => s + (p.poem_score || 0), 0) / latestPerTitle.length).toFixed(1)
    : "—";

  const scoreColor = (s) => s >= 8 ? "#5DB88A" : s >= 5 ? "#C9A84C" : "#D9705F";

  if (loading) return (
    <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <BarChart2 className="w-5 h-5 text-blue-400/70" />
          <h1 className="text-2xl font-light text-white">Flag Dashboard</h1>
        </div>

        {/* Collection totals */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="col-span-2 rounded-2xl border border-white/8 bg-[#141417] p-5 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-white/25 mb-1 select-none">Average Score</div>
              <div className="text-4xl font-light text-white">{avgScore}<span className="text-lg text-white/30">/10</span></div>
            </div>
            <div className="text-xs text-white/25">{latestPerTitle.length} poems</div>
          </div>
          <div className="rounded-2xl border border-red-800/30 bg-red-950/20 p-5">
            <div className="text-xs uppercase tracking-widest text-red-500/50 mb-1 select-none">Total Red</div>
            <div className="text-3xl font-light text-red-400">{totalRed}</div>
          </div>
          <div className="rounded-2xl border border-yellow-800/30 bg-yellow-950/20 p-5">
            <div className="text-xs uppercase tracking-widest text-yellow-500/50 mb-1 select-none">Total Yellow</div>
            <div className="text-3xl font-light text-yellow-400">{totalYellow}</div>
          </div>
          <div className="col-span-2 rounded-2xl border border-green-800/30 bg-green-950/20 p-5">
            <div className="text-xs uppercase tracking-widest text-green-500/50 mb-1 select-none">Total Green</div>
            <div className="text-3xl font-light text-green-400">{totalGreen}</div>
          </div>
        </div>

        {/* Per-poem table */}
        {latestPerTitle.length === 0 ? (
          <div className="text-center py-16 text-white/20 text-sm">No poems yet.</div>
        ) : (
          <div className="rounded-2xl border border-white/8 bg-[#141417] overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-4 px-4 py-2 border-b border-white/5">
              <span className="text-xs uppercase tracking-widest text-white/20 select-none">Poem</span>
              <span className="text-xs uppercase tracking-widest text-red-500/40 select-none">R</span>
              <span className="text-xs uppercase tracking-widest text-yellow-500/40 select-none">Y</span>
              <span className="text-xs uppercase tracking-widest text-green-500/40 select-none">G</span>
              <span className="text-xs uppercase tracking-widest text-white/20 select-none">Score</span>
            </div>
            {latestPerTitle.map((p) => (
              <div key={p.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-4 items-center px-4 py-3 border-b border-white/5 last:border-0">
                <div>
                  <div className="text-sm text-white/70 truncate">{p.title || "Untitled"}</div>
                  <div className="text-xs text-white/25">v{p.version_number}</div>
                </div>
                <span className="text-sm text-red-400">{p.red_count}</span>
                <span className="text-sm text-yellow-400">{p.yellow_count}</span>
                <span className="text-sm text-green-400">{p.green_count}</span>
                <span className="text-sm font-light" style={{ color: scoreColor(p.poem_score) }}>{p.poem_score}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
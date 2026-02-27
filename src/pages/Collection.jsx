import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { BookOpen, ChevronRight, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Collection() {
  const navigate = useNavigate();
  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTitle, setExpandedTitle] = useState(null);

  useEffect(() => {
    base44.entities.PoemAnalysis.list("-created_date", 200).then(data => {
      setPoems(data);
      setLoading(false);
    });
  }, []);

  // Group by title
  const grouped = poems.reduce((acc, p) => {
    const key = p.title || "Untitled";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

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
          <BookOpen className="w-5 h-5 text-amber-400/70" />
          <h1 className="text-2xl font-light text-white">My Collection</h1>
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-24 text-white/20">
            <BookOpen className="w-10 h-10 mx-auto mb-4 opacity-30" />
            <p className="text-sm">No poems analyzed yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([title, versions]) => {
              const sorted = [...versions].sort((a, b) => a.version_number - b.version_number);
              const latest = sorted[sorted.length - 1];
              const chartData = sorted.map(v => ({ version: `v${v.version_number}`, score: v.poem_score }));
              const isExpanded = expandedTitle === title;

              return (
                <div key={title} className="rounded-2xl border border-white/8 bg-[#141417] overflow-hidden">
                  {/* Header row */}
                  <button
                    onClick={() => setExpandedTitle(isExpanded ? null : title)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors select-none"
                  >
                    <div className="text-left">
                      <div className="text-white font-medium">{title}</div>
                      <div className="text-white/30 text-xs mt-0.5">
                        {versions.length} version{versions.length !== 1 ? "s" : ""} · Latest v{latest.version_number}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-light" style={{ color: scoreColor(latest.poem_score) }}>
                        {latest.poem_score}/10
                      </span>
                      <ChevronRight className={`w-4 h-4 text-white/25 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-white/5">
                      {/* Score timeline */}
                      {chartData.length > 1 && (
                        <div className="mt-4 mb-4">
                          <div className="text-xs uppercase tracking-widest text-white/20 mb-3 select-none">Score Timeline</div>
                          <ResponsiveContainer width="100%" height={80}>
                            <LineChart data={chartData}>
                              <XAxis dataKey="version" tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} />
                              <YAxis domain={[1, 10]} tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} width={20} />
                              <Tooltip
                                contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 12 }}
                                cursor={false}
                              />
                              <Line type="monotone" dataKey="score" stroke="#C9A84C" strokeWidth={2} dot={{ fill: "#C9A84C", r: 3 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* Versions list */}
                      <div className="space-y-2">
                        {sorted.map(v => (
                          <button
                            key={v.id}
                            onClick={() => navigate(createPageUrl(`Analysis?id=${v.id}`))}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#0D0D0F] border border-white/5 hover:border-white/15 transition-all select-none"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-white/40 text-sm">v{v.version_number}</span>
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                <span className="text-white/30 text-xs">{v.red_count}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                                <span className="text-white/30 text-xs">{v.yellow_count}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <span className="text-white/30 text-xs">{v.green_count}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-light" style={{ color: scoreColor(v.poem_score) }}>{v.poem_score}/10</span>
                              <ChevronRight className="w-3.5 h-3.5 text-white/20" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
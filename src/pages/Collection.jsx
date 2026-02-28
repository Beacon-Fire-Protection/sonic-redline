import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ChevronRight, Loader2, Search, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a2266141888b3ccda1983d/a97572646_sonic.png";

function ScoreBadge({ score }) {
  const bg = score >= 7 ? "#4ADE80" : score >= 5 ? "#FBBF24" : "#FF2D2D";
  return (
    <div className="w-9 h-9 flex items-center justify-center font-bold text-sm text-black flex-shrink-0" style={{ background: bg }}>
      {score}
    </div>
  );
}

export default function Collection() {
  const navigate = useNavigate();
  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTitle, setExpandedTitle] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date");

  useEffect(() => {
    base44.entities.PoemAnalysis.list("-created_date", 200).then(data => {
      setPoems(data);
      setLoading(false);
    });
  }, []);

  const grouped = poems.reduce((acc, p) => {
    const key = p.title || "Untitled";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  let entries = Object.entries(grouped).filter(([title]) =>
    title.toLowerCase().includes(search.toLowerCase())
  );

  if (sort === "score") {
    entries.sort((a, b) => {
      const sa = Math.max(...a[1].map(v => v.poem_score || 0));
      const sb = Math.max(...b[1].map(v => v.poem_score || 0));
      return sb - sa;
    });
  } else if (sort === "title") {
    entries.sort((a, b) => a[0].localeCompare(b[0]));
  }

  if (loading) return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white">

      <div className="max-w-2xl mx-auto px-4 py-5">
        {/* Search + sort */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search poems…"
              className="w-full bg-[#111] border border-white/10 pl-9 pr-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-white/25 text-sm"
            />
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-[#111] border border-white/10 px-3 py-2.5 text-white/50 text-xs uppercase tracking-widest focus:outline-none"
          >
            <option value="date">Date</option>
            <option value="title">Title</option>
            <option value="score">Score</option>
          </select>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-24 text-white/20">
            <p className="text-sm">No saved poems yet.</p>
            <button
              onClick={() => navigate(createPageUrl("Submit"))}
              className="mt-4 text-xs text-[#FF2D2D] uppercase tracking-widest"
            >
              Analyze your first poem →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map(([title, versions]) => {
              const sorted = [...versions].sort((a, b) => a.version_number - b.version_number);
              const latest = sorted[sorted.length - 1];
              const chartData = sorted.map(v => ({ v: `v${v.version_number}`, score: v.poem_score }));
              const isExpanded = expandedTitle === title;

              return (
                <div key={title} className="border border-white/8 overflow-hidden">
                  <button
                    onClick={() => setExpandedTitle(isExpanded ? null : title)}
                    className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/3 transition-colors"
                  >
                    <div className="text-left flex-1 min-w-0 pr-4">
                      <div className="text-white font-bold truncate">{title}</div>
                      <div className="text-white/30 text-xs mt-0.5">
                        {versions.length} version{versions.length !== 1 ? "s" : ""} · v{latest.version_number}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ScoreBadge score={latest.poem_score} />
                      <ChevronRight className={`w-4 h-4 text-white/25 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-white/5 px-4 pb-4">
                      {chartData.length > 1 && (
                        <div className="mt-4 mb-4">
                          <div className="text-xs uppercase tracking-widest text-white/20 mb-2">Score Timeline</div>
                          <ResponsiveContainer width="100%" height={70}>
                            <LineChart data={chartData}>
                              <XAxis dataKey="v" tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} />
                              <YAxis domain={[1, 10]} tick={{ fill: "#555", fontSize: 10 }} axisLine={false} tickLine={false} width={18} />
                              <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", color: "#fff", fontSize: 11 }} cursor={false} />
                              <Line type="monotone" dataKey="score" stroke="#FF2D2D" strokeWidth={2} dot={{ fill: "#FF2D2D", r: 3 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                      <div className="space-y-2">
                        {sorted.map(v => (
                          <button
                            key={v.id}
                            onClick={() => navigate(createPageUrl(`Analysis?id=${v.id}`))}
                            className="w-full flex items-center justify-between px-3 py-2.5 border border-white/5 hover:border-white/15 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-white/40 text-xs font-mono">v{v.version_number}</span>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="w-1.5 h-1.5 bg-[#FF2D2D]" />
                                <span className="text-white/30">{v.red_count}</span>
                                <span className="w-1.5 h-1.5 bg-[#FBBF24]" />
                                <span className="text-white/30">{v.yellow_count}</span>
                                <span className="w-1.5 h-1.5 bg-[#4ADE80]" />
                                <span className="text-white/30">{v.green_count}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <ScoreBadge score={v.poem_score} />
                              <ChevronRight className="w-3 h-3 text-white/20" />
                            </div>
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          const prev = encodeURIComponent(latest.poem_text);
                          const t = encodeURIComponent(latest.title);
                          const v = encodeURIComponent(String((latest.version_number || 1) + 1));
                          navigate(createPageUrl(`Submit?previous=${prev}&title=${t}&version=${v}`));
                        }}
                        className="mt-3 w-full py-2.5 text-xs font-bold tracking-[0.15em] uppercase text-white flex items-center justify-center gap-2"
                        style={{ background: "#FF2D2D" }}
                      >
                        <RefreshCw className="w-3 h-3" />
                        Submit New Revision
                      </button>
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
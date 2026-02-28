import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ChevronRight, Loader2, Search, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a2266141888b3ccda1983d/a97572646_sonic.png";

function ScoreBadge({ score }) {
  const bg = score >= 7 ? "#10B981" : score >= 5 ? "#FBBF24" : "#EC4899";
  return (
    <div className="w-9 h-9 flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: bg, color: "#000" }}>
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)" }}>
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: "hsl(var(--muted-foreground))" }} />
    </div>
  );

  return (
    <div className="min-h-screen text-foreground" style={{ background: "linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)" }}>
      <style>{`
        .collection-input {
          background-color: hsl(var(--card));
          border-color: hsl(var(--border));
          color: hsl(var(--foreground));
        }
        .collection-input::placeholder {
          color: hsl(var(--muted-foreground) / 0.5);
        }
        .collection-input:focus {
          border-color: hsl(var(--primary) / 0.5);
          outline: none;
        }
        .collection-select {
          background-color: hsl(var(--card));
          border-color: hsl(var(--border));
          color: hsl(var(--muted-foreground));
        }
        .collection-select:focus {
          outline: none;
          border-color: hsl(var(--primary) / 0.5);
        }
        .collection-empty-text {
          color: hsl(var(--muted-foreground));
        }
        .collection-empty-button {
          color: hsl(var(--primary));
          transition: all 0.3s ease;
        }
        .collection-empty-button:hover {
          opacity: 0.8;
        }
        .collection-card {
          border-color: hsl(var(--border));
          background-color: hsl(var(--card) / 0.5);
        }
        .collection-card-button:hover {
          background-color: hsl(var(--primary) / 0.05);
        }
        .collection-version-title {
          color: hsl(var(--foreground));
        }
        .collection-version-meta {
          color: hsl(var(--muted-foreground));
        }
        .collection-expanded-divider {
          border-color: hsl(var(--border) / 0.5);
        }
        .collection-chart-label {
          color: hsl(var(--muted-foreground));
        }
        .collection-version-row {
          border-color: hsl(var(--border));
        }
        .collection-version-row:hover {
          border-color: hsl(var(--primary) / 0.3);
          background-color: hsl(var(--primary) / 0.03);
        }
        .collection-version-text {
          color: hsl(var(--muted-foreground) / 0.7);
        }
        .collection-revision-button {
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          transition: all 0.3s ease;
        }
        .collection-revision-button:hover {
          filter: brightness(1.1);
          box-shadow: 0 0 16px hsl(var(--primary) / 0.4);
        }
        .collection-search-icon {
          color: hsl(var(--muted-foreground) / 0.5);
        }
        .collection-flag-dot {
          background-color: currentColor;
        }
      `}</style>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {/* Search + sort */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="collection-search-icon absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search poems…"
              className="collection-input w-full border pl-9 pr-4 py-2.5 text-sm"
            />
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="collection-select border px-3 py-2.5 text-xs uppercase tracking-widest"
          >
            <option value="date">Date</option>
            <option value="title">Title</option>
            <option value="score">Score</option>
          </select>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-sm collection-empty-text">No saved poems yet.</p>
            <button
              onClick={() => navigate(createPageUrl("Submit"))}
              className="collection-empty-button mt-4 text-xs uppercase tracking-widest"
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
                <div key={title} className="collection-card border overflow-hidden">
                  <button
                    onClick={() => setExpandedTitle(isExpanded ? null : title)}
                    className="collection-card-button w-full flex items-center justify-between px-4 py-4 transition-colors"
                  >
                    <div className="text-left flex-1 min-w-0 pr-4">
                      <div className="collection-version-title font-bold truncate">{title}</div>
                      <div className="collection-version-meta text-xs mt-0.5">
                        {versions.length} version{versions.length !== 1 ? "s" : ""} · v{latest.version_number}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ScoreBadge score={latest.poem_score} />
                      <ChevronRight className={`w-4 h-4 transition-transform`} style={{ color: "hsl(var(--muted-foreground) / 0.5)", transform: isExpanded ? "rotate(90deg)" : "rotate(0)" }} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="collection-expanded-divider border-t px-4 pb-4">
                      {chartData.length > 1 && (
                        <div className="mt-4 mb-4">
                          <div className="collection-chart-label text-xs uppercase tracking-widest mb-2">Score Timeline</div>
                          <ResponsiveContainer width="100%" height={70}>
                            <LineChart data={chartData}>
                              <XAxis 
                                dataKey="v" 
                                tick={{ fill: "hsl(var(--muted-foreground) / 0.5)", fontSize: 10 }} 
                                axisLine={false} 
                                tickLine={false} 
                              />
                              <YAxis 
                                domain={[1, 10]} 
                                tick={{ fill: "hsl(var(--muted-foreground) / 0.5)", fontSize: 10 }} 
                                axisLine={false} 
                                tickLine={false} 
                                width={18} 
                              />
                              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", fontSize: 11 }} cursor={false} />
                              <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 3 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                      <div className="space-y-2">
                        {sorted.map(v => (
                          <button
                            key={v.id}
                            onClick={() => navigate(createPageUrl(`Analysis?id=${v.id}`))}
                            className="collection-version-row w-full flex items-center justify-between px-3 py-2.5 border transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <span className="collection-version-text text-xs font-mono">v{v.version_number}</span>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="w-1.5 h-1.5" style={{ background: "#EC4899" }} />
                                <span className="collection-version-text">{v.red_count}</span>
                                <span className="w-1.5 h-1.5" style={{ background: "#FBBF24" }} />
                                <span className="collection-version-text">{v.yellow_count}</span>
                                <span className="w-1.5 h-1.5" style={{ background: "#10B981" }} />
                                <span className="collection-version-text">{v.green_count}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <ScoreBadge score={v.poem_score} />
                              <ChevronRight className="w-3 h-3" style={{ color: "hsl(var(--muted-foreground) / 0.4)" }} />
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
                        className="collection-revision-button mt-3 w-full py-2.5 text-xs font-bold tracking-[0.15em] uppercase flex items-center justify-center gap-2"
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
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Loader2, Download, RefreshCw, Plus, Bookmark } from "lucide-react";

const LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a2266141888b3ccda1983d/a97572646_sonic.png";

// Unicorn LEGO flag colors - vibrant and cohesive!
const FLAG = {
  RED:    { dot: "bg-[#EC4899]", text: "text-[#EC4899]", border: "border-[#EC4899]/25", bg: "bg-[#EC4899]/8" },
  YELLOW: { dot: "bg-[#FBBF24]", text: "text-[#FBBF24]", border: "border-[#FBBF24]/25", bg: "bg-[#FBBF24]/8" },
  GREEN:  { dot: "bg-[#10B981]", text: "text-[#10B981]", border: "border-[#10B981]/25", bg: "bg-[#10B981]/8" },
};

const TABS = ["Poem", "Full Analysis", "Structure", "Comparison"];

function ScoreBadge({ score }) {
  const bg = score >= 7 ? "#10B981" : score >= 5 ? "#FBBF24" : "#EC4899";
  return (
    <div className="w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0" style={{ background: bg, color: "#000" }}>
      {score}
    </div>
  );
}

function ExpandableLine({ line }) {
  const [open, setOpen] = useState(false);
  const s = FLAG[line.flag] || FLAG.GREEN;
  return (
    <div className={`border-b last:border-0 transition-colors ${open ? s.bg : ""}`} style={{ borderColor: "hsl(var(--border))" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <span className="text-xs font-mono w-5 flex-shrink-0" style={{ color: "hsl(var(--muted-foreground))" }}>{line.number}</span>
        <span className={`w-2 h-2 flex-shrink-0 ${s.dot}`} />
        <span className="text-sm font-mono flex-1 leading-relaxed" style={{ color: "hsl(var(--foreground) / 0.7)" }}>{line.text}</span>
      </button>
      {open && (
        <div className={`px-4 pb-4 ml-8 border-l-2 ${s.border}`}>
          <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--foreground) / 0.65)" }}>{line.analysis}</p>
        </div>
      )}
    </div>
  );
}

export default function Analysis() {
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [savingPoem, setSavingPoem] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) { navigate(createPageUrl("Home")); return; }
    base44.entities.PoemAnalysis.filter({ id }).then(results => {
      const r = results[0];
      if (!r) { navigate(createPageUrl("Home")); return; }
      setRecord(r);
      setAnalysis(JSON.parse(r.analysis_raw));
      setLoading(false);
    });
  }, []);

  const handleRevision = () => {
    const prev = encodeURIComponent(record.poem_text);
    const t = encodeURIComponent(record.title);
    const v = encodeURIComponent(String((record.version_number || 1) + 1));
    navigate(createPageUrl(`Submit?previous=${prev}&title=${t}&version=${v}`));
  };

  const handleSave = async () => {
    if (window.self !== window.top) {
      alert("Checkout only works from the published app. Please open the app in a new tab.");
      return;
    }
    setSavingPoem(true);
    const currentUrl = window.location.href;
    const successUrl = currentUrl + (currentUrl.includes("?") ? "&saved=1" : "?saved=1");
    const cancelUrl = currentUrl;
    try {
      const response = await base44.functions.invoke("createCheckout", {
        poem_analysis_id: record.id,
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error(err);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setSavingPoem(false);
    }
  };

  const handleExport = () => {
    if (!record || !analysis) return;
    let md = `# ${record.title} — Version ${record.version_number}\n\n`;
    md += `**Objective: ${analysis.score_objective}/10 | Subjective: ${analysis.score_subjective}/10 | Combined: ${analysis.score_combined}/10**\n\n`;
    md += `🔴 ${record.red_count} · 🟡 ${record.yellow_count} · 🟢 ${record.green_count}\n\n---\n\n## Poem\n\n`;
    analysis.lines?.forEach(l => { md += `[${l.number}] [${l.flag}] ${l.text}\n`; });
    md += `\n---\n\n## Line-by-Line Analysis\n\n`;
    analysis.lines?.forEach(l => { md += `### Line ${l.number} [${l.flag}]\n${l.text}\n\n${l.analysis}\n\n`; });
    md += `## Structural Movements\n\n${analysis.structural_movements}\n\n`;
    md += `## Revision Targets\n\n${analysis.remaining_targets}\n`;
    if (analysis.what_changed) md += `\n## What Changed\n\n${analysis.what_changed}\n`;
    if (analysis.comparison_scorecard) md += `\n## Comparison Scorecard\n\n${analysis.comparison_scorecard}\n`;

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${record.title || "poem"}-v${record.version_number}-analysis.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)" }}>
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: "hsl(var(--muted-foreground))" }} />
    </div>
  );

  const parsedScore = analysis.score_combined ?? record.poem_score;
  const visibleTabs = record.is_revision ? TABS : TABS.filter(t => t !== "Comparison");

  return (
    <div className="min-h-20 text-foreground flex flex-col" style={{ background: "linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)" }}>
      <style>{`
        .analysis-header {
          border-color: hsl(var(--border));
          background-color: hsl(var(--background) / 0.5);
        }
        .analysis-flag-item {
          color: hsl(var(--muted-foreground));
        }
        .analysis-tab {
          border-color: hsl(var(--border));
        }
        .analysis-tab-active {
          border-color: hsl(var(--primary));
          color: hsl(var(--foreground));
        }
        .analysis-tab-inactive {
          color: hsl(var(--muted-foreground));
          border-color: transparent;
        }
        .analysis-tab-inactive:hover {
          color: hsl(var(--foreground) / 0.7);
        }
        .analysis-card {
          border-color: hsl(var(--border));
          background-color: hsl(var(--card));
        }
        .analysis-label {
          color: hsl(var(--muted-foreground));
        }
        .analysis-content {
          color: hsl(var(--foreground) / 0.65);
        }
        .analysis-footer {
          background-color: hsl(var(--background));
          border-color: hsl(var(--border));
        }
        .analysis-btn-primary {
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          transition: all 0.3s ease;
        }
        .analysis-btn-primary:hover:not(:disabled) {
          filter: brightness(1.1);
          box-shadow: 0 0 16px hsl(var(--primary) / 0.4);
        }
        .analysis-btn-secondary {
          border-color: hsl(var(--border));
          color: hsl(var(--muted-foreground));
          transition: all 0.3s ease;
        }
        .analysis-btn-secondary:hover {
          color: hsl(var(--foreground));
          border-color: hsl(var(--primary) / 0.5);
          background-color: hsl(var(--primary) / 0.05);
        }
        .analysis-comparison-highlight {
          border-color: hsl(var(--primary) / 0.3);
          background-color: hsl(var(--primary) / 0.08);
        }
      `}</style>

      {/* Header */}
      <div className="px-4 pt-6 pb-5 border-b analysis-header">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">{record.title || "Untitled"}</h1>
              <div className="analysis-label text-sm mt-0.5">Version {record.version_number}</div>
            </div>
            <ScoreBadge score={parsedScore} />
          </div>

          {/* Flag bar */}
          <div className="flex items-center gap-5 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#EC4899]" />
              <span className="text-sm font-bold" style={{ color: "#EC4899" }}>{record.red_count}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#FBBF24]" />
              <span className="text-sm font-bold" style={{ color: "#FBBF24" }}>{record.yellow_count}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#10B981]" />
              <span className="text-sm font-bold" style={{ color: "#10B981" }}>{record.green_count}</span>
            </div>
            <div className="ml-auto text-xs analysis-label font-mono">
              Obj: {analysis.score_objective} · Sub: {analysis.score_subjective} · Cmb: {analysis.score_combined}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="analysis-tab border-b overflow-x-auto">
        <div className="flex max-w-2xl mx-auto px-4">
          {visibleTabs.map((tab, i) => {
            const realIdx = TABS.indexOf(tab);
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(realIdx)}
                className={`py-3 px-4 text-xs font-bold tracking-[0.15em] uppercase whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === realIdx
                    ? "analysis-tab-active"
                    : "analysis-tab-inactive"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto pb-40">
        <div className="max-w-2xl mx-auto px-4 py-6">

          {/* Tab 0: Poem */}
          {activeTab === 0 && (
            <div className="analysis-card border overflow-hidden">
              {analysis.lines?.map((line) => (
                <ExpandableLine key={line.number} line={line} />
              ))}
            </div>
          )}

          {/* Tab 1: Full Analysis */}
          {activeTab === 1 && (
            <div className="space-y-4">
              {analysis.lines?.map((line) => {
                const s = FLAG[line.flag] || FLAG.GREEN;
                return (
                  <div key={line.number} className={`analysis-card border p-4`}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-mono analysis-label">{line.number}</span>
                      <span className={`w-2 h-2 ${s.dot}`} />
                      <span className={`text-xs font-bold tracking-[0.15em] uppercase ${s.text}`}>{line.flag}</span>
                    </div>
                    <div className="text-sm font-mono mb-3 italic analysis-content">"{line.text}"</div>
                    <p className="text-sm leading-relaxed analysis-content">{line.analysis}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Structure */}
          {activeTab === 2 && (
            <div className="space-y-6">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] analysis-label mb-3">Structural Movements</div>
                <div className="analysis-card border p-5">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap analysis-content">{analysis.structural_movements}</p>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] analysis-label mb-3">Revision Targets</div>
                <div className="analysis-card border p-5">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap analysis-content">{analysis.remaining_targets}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Comparison */}
          {activeTab === 3 && record.is_revision && (
            <div className="space-y-6">
              {analysis.what_changed && (
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] analysis-label mb-3">What Changed</div>
                  <div className="analysis-comparison-highlight border p-5">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap analysis-content">{analysis.what_changed}</p>
                  </div>
                </div>
              )}
              {analysis.comparison_scorecard && (
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] analysis-label mb-3">Comparison Scorecard</div>
                  <div className="analysis-card border p-5">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap analysis-content">{analysis.comparison_scorecard}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="analysis-footer fixed bottom-0 left-0 right-0 border-t p-4 pb-safe">
        <div className="max-w-2xl mx-auto grid grid-cols-4 gap-3">
          <button
            onClick={handleRevision}
            className="analysis-btn-primary py-3 text-xs font-bold tracking-[0.1em] uppercase flex items-center justify-center gap-2 rounded-lg"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Revision
          </button>
          <button
            onClick={handleSave}
            disabled={savingPoem}
            className="analysis-btn-primary py-3 text-xs font-bold tracking-[0.1em] uppercase flex items-center justify-center gap-2 rounded-lg disabled:opacity-50"
          >
            {savingPoem ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bookmark className="w-3.5 h-3.5" />}
            Save
          </button>
          <button
            onClick={handleExport}
            className="analysis-btn-secondary py-3 text-xs font-bold tracking-[0.1em] uppercase border flex items-center justify-center gap-2 rounded-lg"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          <button
            onClick={() => navigate(createPageUrl("Submit"))}
            className="analysis-btn-secondary py-3 text-xs font-bold tracking-[0.1em] uppercase border flex items-center justify-center gap-2 rounded-lg"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Loader2, Download, RefreshCw, Plus } from "lucide-react";

const LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a2266141888b3ccda1983d/a97572646_sonic.png";

const FLAG = {
  RED:    { dot: "bg-[#FF2D2D]", text: "text-[#FF2D2D]", border: "border-[#FF2D2D]/25", bg: "bg-[#FF2D2D]/8" },
  YELLOW: { dot: "bg-[#FBBF24]", text: "text-[#FBBF24]", border: "border-[#FBBF24]/25", bg: "bg-[#FBBF24]/8" },
  GREEN:  { dot: "bg-[#4ADE80]", text: "text-[#4ADE80]", border: "border-[#4ADE80]/25", bg: "bg-[#4ADE80]/8" },
};

const TABS = ["Poem", "Full Analysis", "Structure", "Comparison"];

function ScoreBadge({ score }) {
  const bg = score >= 7 ? "#4ADE80" : score >= 5 ? "#FBBF24" : "#FF2D2D";
  return (
    <div className="w-12 h-12 flex items-center justify-center font-bold text-lg text-black flex-shrink-0" style={{ background: bg }}>
      {score}
    </div>
  );
}

function ExpandableLine({ line }) {
  const [open, setOpen] = useState(false);
  const s = FLAG[line.flag] || FLAG.GREEN;
  return (
    <div className={`border-b border-white/5 last:border-0 ${open ? s.bg : ""} transition-colors`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <span className="text-white/25 text-xs font-mono w-5 flex-shrink-0">{line.number}</span>
        <span className={`w-2 h-2 flex-shrink-0 ${s.dot}`} />
        <span className="text-white/70 text-sm font-mono flex-1 leading-relaxed">{line.text}</span>
      </button>
      {open && (
        <div className={`px-4 pb-4 ml-8 border-l-2 ${s.border}`}>
          <p className="text-white/55 text-sm leading-relaxed">{line.analysis}</p>
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
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
    </div>
  );

  const parsedScore = analysis.score_combined ?? record.poem_score;
  const visibleTabs = record.is_revision ? TABS : TABS.filter(t => t !== "Comparison");

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-5 border-b border-white/8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white truncate">{record.title || "Untitled"}</h1>
              <div className="text-white/35 text-sm mt-0.5">Version {record.version_number}</div>
            </div>
            <ScoreBadge score={parsedScore} />
          </div>

          {/* Flag bar */}
          <div className="flex items-center gap-5 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#FF2D2D]" />
              <span className="text-[#FF2D2D] text-sm font-bold">{record.red_count}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#FBBF24]" />
              <span className="text-[#FBBF24] text-sm font-bold">{record.yellow_count}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#4ADE80]" />
              <span className="text-[#4ADE80] text-sm font-bold">{record.green_count}</span>
            </div>
            <div className="ml-auto text-xs text-white/30 font-mono">
              Obj: {analysis.score_objective} · Sub: {analysis.score_subjective} · Cmb: {analysis.score_combined}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/8 overflow-x-auto">
        <div className="flex max-w-2xl mx-auto px-4">
          {visibleTabs.map((tab, i) => {
            const realIdx = TABS.indexOf(tab);
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(realIdx)}
                className={`py-3 px-4 text-xs font-bold tracking-[0.15em] uppercase whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === realIdx
                    ? "border-[#FF2D2D] text-white"
                    : "border-transparent text-white/35 hover:text-white/60"
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
            <div className="border border-white/8 overflow-hidden">
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
                  <div key={line.number} className={`border ${s.border} p-4`}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-white/20 text-xs font-mono">{line.number}</span>
                      <span className={`w-2 h-2 ${s.dot}`} />
                      <span className={`text-xs font-bold tracking-[0.15em] uppercase ${s.text}`}>{line.flag}</span>
                    </div>
                    <div className="text-white/45 text-sm font-mono mb-3 italic">"{line.text}"</div>
                    <p className="text-white/65 text-sm leading-relaxed">{line.analysis}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Structure */}
          {activeTab === 2 && (
            <div className="space-y-6">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/30 mb-3">Structural Movements</div>
                <div className="border border-white/8 p-5">
                  <p className="text-white/65 text-sm leading-relaxed whitespace-pre-wrap">{analysis.structural_movements}</p>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/30 mb-3">Revision Targets</div>
                <div className="border border-white/8 p-5">
                  <p className="text-white/65 text-sm leading-relaxed whitespace-pre-wrap">{analysis.remaining_targets}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Comparison */}
          {activeTab === 3 && record.is_revision && (
            <div className="space-y-6">
              {analysis.what_changed && (
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-white/30 mb-3">What Changed</div>
                  <div className="border border-[#FF2D2D]/20 bg-[#FF2D2D]/5 p-5">
                    <p className="text-white/65 text-sm leading-relaxed whitespace-pre-wrap">{analysis.what_changed}</p>
                  </div>
                </div>
              )}
              {analysis.comparison_scorecard && (
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-white/30 mb-3">Comparison Scorecard</div>
                  <div className="border border-white/8 p-5">
                    <p className="text-white/65 text-sm leading-relaxed whitespace-pre-wrap">{analysis.comparison_scorecard}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-white/8 p-4 pb-safe">
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-3">
          <button
            onClick={handleRevision}
            className="py-3 text-xs font-bold tracking-[0.1em] uppercase text-white flex items-center justify-center gap-2"
            style={{ background: "#FF2D2D" }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Revision
          </button>
          <button
            onClick={handleExport}
            className="py-3 text-xs font-bold tracking-[0.1em] uppercase text-white/60 hover:text-white border border-white/15 hover:border-white/30 flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          <button
            onClick={() => navigate(createPageUrl("Submit"))}
            className="py-3 text-xs font-bold tracking-[0.1em] uppercase text-white/40 hover:text-white/70 flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Loader2, Download, RefreshCw, PlusCircle, Circle } from "lucide-react";

const FLAG_STYLES = {
  RED: { dot: "bg-red-500", label: "text-red-400", border: "border-red-800/40", bg: "bg-red-950/20" },
  YELLOW: { dot: "bg-yellow-400", label: "text-yellow-400", border: "border-yellow-800/40", bg: "bg-yellow-950/20" },
  GREEN: { dot: "bg-green-500", label: "text-green-400", border: "border-green-800/40", bg: "bg-green-950/20" },
};

function FlagDot({ flag }) {
  const s = FLAG_STYLES[flag] || FLAG_STYLES.GREEN;
  return <span className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${s.dot}`} />;
}

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <div className="text-xs uppercase tracking-[0.25em] text-white/25 mb-4 select-none">{title}</div>
      {children}
    </div>
  );
}

export default function Analysis() {
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

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
    md += `**Poem Score: ${record.poem_score}/10**\n\n---\n\n`;
    md += `## Full Poem\n\n`;
    analysis.lines?.forEach(l => {
      md += `[${l.number}] ${l.flag} — ${l.text}\n`;
    });
    md += `\n---\n\n## Line-by-Line Analysis\n\n`;
    analysis.lines?.forEach(l => {
      md += `### Line ${l.number}\n${l.text}\n\n${l.analysis}\n\n`;
    });
    md += `## Structural Movements\n\n${analysis.structural_movements}\n\n`;
    if (analysis.what_changed) md += `## What Changed\n\n${analysis.what_changed}\n\n`;
    if (analysis.comparison_scorecard) md += `## Comparison Scorecard\n\n${analysis.comparison_scorecard}\n\n`;
    md += `## Remaining Revision Targets\n\n${analysis.remaining_targets}\n`;

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${record.title || "poem"}-v${record.version_number}-analysis.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
      </div>
    );
  }

  const scoreColor = record.poem_score >= 8 ? "#5DB88A" : record.poem_score >= 5 ? "#C9A84C" : "#D9705F";

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="text-xs uppercase tracking-widest text-white/25 mb-2 select-none">Analysis</div>
          <h1 className="text-3xl font-light text-white mb-1">{record.title || "Untitled"}</h1>
          <div className="text-white/30 text-sm">Version {record.version_number}</div>
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              <span className="text-white/40 text-xs">{record.red_count} red</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
              <span className="text-white/40 text-xs">{record.yellow_count} yellow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
              <span className="text-white/40 text-xs">{record.green_count} green</span>
            </div>
            <div className="ml-auto text-lg font-light" style={{ color: scoreColor }}>
              {record.poem_score}/10
            </div>
          </div>
        </div>

        {/* Full Poem */}
        <Section title="Full Poem — Numbered Lines">
          <div className="rounded-2xl border border-white/8 bg-[#141417] overflow-hidden">
            {analysis.lines?.map((line) => {
              const s = FLAG_STYLES[line.flag] || FLAG_STYLES.GREEN;
              return (
                <div key={line.number} className={`flex items-start gap-3 px-4 py-2.5 border-b border-white/5 last:border-0 ${s.bg}`}>
                  <span className="text-white/20 text-xs font-mono w-6 flex-shrink-0 pt-0.5">{line.number}</span>
                  <FlagDot flag={line.flag} />
                  <span className="text-white/70 text-sm font-mono leading-relaxed flex-1">{line.text}</span>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Line-by-Line */}
        <Section title="Line-by-Line Analysis">
          <div className="space-y-4">
            {analysis.lines?.map((line) => {
              const s = FLAG_STYLES[line.flag] || FLAG_STYLES.GREEN;
              return (
                <div key={line.number} className={`rounded-xl border ${s.border} p-4`}>
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-white/20 text-xs font-mono flex-shrink-0 pt-0.5">{line.number}</span>
                    <FlagDot flag={line.flag} />
                    <span className={`text-xs uppercase tracking-widest font-medium ${s.label} select-none`}>{line.flag}</span>
                  </div>
                  <div className="text-white/50 text-sm font-mono mb-2 pl-1 italic">"{line.text}"</div>
                  <p className="text-white/60 text-sm leading-relaxed pl-1">{line.analysis}</p>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Structural Movements */}
        <Section title="Structural Movements">
          <div className="rounded-xl border border-white/8 bg-[#141417] p-5">
            <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">{analysis.structural_movements}</p>
          </div>
        </Section>

        {/* What Changed (revisions only) */}
        {record.is_revision && analysis.what_changed && (
          <Section title="What Changed">
            <div className="rounded-xl border border-amber-800/30 bg-amber-950/20 p-5">
              <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">{analysis.what_changed}</p>
            </div>
          </Section>
        )}

        {/* Comparison Scorecard (revisions only) */}
        {record.is_revision && analysis.comparison_scorecard && (
          <Section title="Comparison Scorecard">
            <div className="rounded-xl border border-white/8 bg-[#141417] p-5">
              <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">{analysis.comparison_scorecard}</p>
            </div>
          </Section>
        )}

        {/* Remaining Targets */}
        <Section title="Remaining Revision Targets">
          <div className="rounded-xl border border-white/8 bg-[#141417] p-5">
            <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">{analysis.remaining_targets}</p>
          </div>
        </Section>

        {/* Poem Score */}
        <div className="rounded-2xl border border-white/10 bg-[#141417] p-6 text-center mb-8">
          <div className="text-xs uppercase tracking-widest text-white/25 mb-3 select-none">Poem Score</div>
          <div className="text-6xl font-light" style={{ color: scoreColor }}>{record.poem_score}</div>
          <div className="text-white/25 text-sm mt-1">/ 10</div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleRevision}
            className="w-full py-4 rounded-2xl text-sm font-medium tracking-widest uppercase select-none transition-all flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)", color: "#fff" }}
          >
            <RefreshCw className="w-4 h-4" />
            Submit a Revision
          </button>
          <button
            onClick={handleExport}
            className="w-full py-4 rounded-2xl text-sm font-medium tracking-widest uppercase select-none transition-all flex items-center justify-center gap-2 bg-[#141417] border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20"
          >
            <Download className="w-4 h-4" />
            Export Analysis
          </button>
          <button
            onClick={() => navigate(createPageUrl("Submit"))}
            className="w-full py-4 rounded-2xl text-sm font-medium tracking-widest uppercase select-none transition-all flex items-center justify-center gap-2 text-white/25 hover:text-white/50"
          >
            <PlusCircle className="w-4 h-4" />
            Start New Poem
          </button>
        </div>
      </div>
    </div>
  );
}
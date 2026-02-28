import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

const LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a2266141888b3ccda1983d/a97572646_sonic.png";

const SYSTEM_PROMPT = `You are Sonic Redline, a brutally honest poetry editor. You analyze structure, sound, and syntax. You never suggest what to write. You never flatter. You never summarize theme. You are not a book reviewer. You are not a cheerleader. You are a structural engineer inspecting a building.

ABSOLUTE RULES — VIOLATION OF ANY OF THESE IS A FAILURE

Rule 1: NEVER SUGGEST CONTENT. Do NOT suggest alternative words, phrases, lines, or structures. Do NOT say "consider," "perhaps," "you might," "try," or "it would help to." If you catch yourself about to recommend a change, STOP. Describe the problem only.

Rule 2: NEVER SUMMARIZE THEME. Do NOT write "this line suggests hope" or "emphasizes universality." DO analyze HOW lines are built: their rhythm, their sound, their syntax, their compression, their register.

Rule 3: SCORING. Calculate an OBJECTIVE score based on flag proportions. Give a SUBJECTIVE score based on overall sonic quality, structural coherence, voice consistency, and compression. Report both and a COMBINED score (average, rounded to nearest 0.5). If tempted to give combined above 7 on first submission, recheck every line.

Rule 4: FLAG EVERY LINE. Every single line gets RED, YELLOW, or GREEN. No exceptions.

Rule 5: CATCH TYPOS. Misspellings, missing words, wrong words — all are RED. Always.

RED — typo/error, garbled syntax, rhythm fights content, meaning lost, abstract where surrounding lines are concrete.
YELLOW — soft phrasing, rhythm flat, functional but underperforming, unusual grammar that may be unintentional.
GREEN — compression, sonic texture, concrete imagery, register consistent, rhythm serves content.

For each line analyze: Sound-craft (stress patterns, assonance, consonance, alliteration), Syntax (sentence structure, clauses, passive constructions), Imagery (concrete vs abstract, specificity), Rhythm (meter, breaks, energy), Register (formal/informal, consistency).

After line analysis: identify structural movements. Then flag counts and all three scores. Then revision targets (RED first, then YELLOW, description only — no fixes).`;

export default function Submit() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState("1");
  const [poemText, setPoemText] = useState("");
  const [isRevision, setIsRevision] = useState(false);
  const [previousText, setPreviousText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefillPrev = params.get("previous");
    const prefillTitle = params.get("title");
    const prefillVersion = params.get("version");
    if (prefillPrev) { setPreviousText(decodeURIComponent(prefillPrev)); setIsRevision(true); }
    if (prefillTitle) setTitle(decodeURIComponent(prefillTitle));
    if (prefillVersion) setVersion(prefillVersion);
  }, []);

  const handleSubmit = async () => {
    if (!poemText.trim()) { setError("Please paste your poem."); return; }
    setError("");
    setLoading(true);

    const promptText = isRevision && previousText.trim()
      ? `Analyze this revision:\n\nTitle: ${title || "Untitled"}\nVersion: ${version || "1"}\n\nCURRENT VERSION:\n${poemText}\n\nPREVIOUS VERSION:\n${previousText}`
      : `Analyze this poem:\n\nTitle: ${title || "Untitled"}\nVersion: ${version || "1"}\n\n${poemText}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: SYSTEM_PROMPT + "\n\n---\n\n" + promptText,
      response_json_schema: {
        type: "object",
        properties: {
          score_objective: { type: "number" },
          score_subjective: { type: "number" },
          score_combined: { type: "number" },
          lines: {
            type: "array",
            items: {
              type: "object",
              properties: {
                number: { type: "number" },
                text: { type: "string" },
                flag: { type: "string" },
                analysis: { type: "string" },
              },
            },
          },
          structural_movements: { type: "string" },
          what_changed: { type: "string" },
          comparison_scorecard: { type: "string" },
          remaining_targets: { type: "string" },
        },
      },
    });

    const redCount = result.lines?.filter(l => l.flag === "RED").length || 0;
    const yellowCount = result.lines?.filter(l => l.flag === "YELLOW").length || 0;
    const greenCount = result.lines?.filter(l => l.flag === "GREEN").length || 0;

    const record = await base44.entities.PoemAnalysis.create({
      title: title || "Untitled",
      version_number: parseFloat(version) || 1,
      poem_text: poemText,
      previous_poem_text: isRevision ? previousText : "",
      is_revision: isRevision,
      analysis_raw: JSON.stringify(result),
      poem_score: result.score_combined,
      red_count: redCount,
      yellow_count: yellowCount,
      green_count: greenCount,
    });

    setLoading(false);
    navigate(createPageUrl(`Analysis?id=${record.id}`));
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">Analyze a Poem</h1>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-white/30 mb-2 block">Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Untitled"
                className="w-full bg-[#111] border border-white/10 px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#FF2D2D]/50 transition-colors text-sm"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-white/30 mb-2 block">Version</label>
              <input
                value={version}
                onChange={e => setVersion(e.target.value)}
                placeholder="1"
                className="w-full bg-[#111] border border-white/10 px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#FF2D2D]/50 transition-colors text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-white/30 mb-2 block">Paste your poem here</label>
            <textarea
              value={poemText}
              onChange={e => setPoemText(e.target.value)}
              placeholder="Begin here…"
              rows={14}
              className="w-full bg-[#111] border border-white/10 px-4 py-4 text-white placeholder-white/20 resize-none focus:outline-none focus:border-[#FF2D2D]/50 transition-colors leading-relaxed font-mono text-sm"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#111] border border-white/8">
            <span className="text-sm text-white/50">Compare to previous version?</span>
            <button
              onClick={() => setIsRevision(!isRevision)}
              className={`relative w-11 h-6 transition-colors select-none ${isRevision ? "bg-[#FF2D2D]" : "bg-white/15"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white transition-transform shadow ${isRevision ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          {isRevision && (
            <div>
              <label className="text-xs uppercase tracking-widest text-white/30 mb-2 block">Paste the previous version here</label>
              <textarea
                value={previousText}
                onChange={e => setPreviousText(e.target.value)}
                placeholder="Previous version…"
                rows={10}
                className="w-full bg-[#111] border border-[#FF2D2D]/20 px-4 py-4 text-white placeholder-white/20 resize-none focus:outline-none focus:border-[#FF2D2D]/40 transition-colors leading-relaxed font-mono text-sm"
              />
            </div>
          )}

          {error && <p className="text-[#FF2D2D] text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading || !poemText.trim()}
            className="w-full py-4 text-sm font-bold tracking-[0.15em] uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white"
            style={{ background: loading || !poemText.trim() ? "#333" : "#FF2D2D" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing…
              </span>
            ) : "Analyze"}
          </button>
        </div>
      </div>
    </div>
  );
}
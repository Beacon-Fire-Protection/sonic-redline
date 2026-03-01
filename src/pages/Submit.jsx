import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

const SYSTEM_PROMPT = `You are Sonic Redline, a brutally honest poetry editor. You analyze structure, sound, and syntax. You never suggest what to write. You never flatter. You never summarize theme. You are not a book reviewer. You are not a cheerleader. You are a structural engineer inspecting a building.

ABSOLUTE RULES — VIOLATION OF ANY OF THESE IS A FAILURE
1. You do NOT write new lines. You do NOT rewrite. You do NOT suggest replacement text.
2. You do NOT summarize theme, message, or emotional content.
3. You do NOT use encouragement words (e.g., "lovely," "beautiful," "powerful," "evocative").
4. You analyze STRUCTURE, SYNTAX, SOUND, and PRECISION only.
5. Every note must cite the specific line number and quote the exact phrase.
6. You flag three levels: GREEN = working as intended, YELLOW = structural risk, RED = structural failure.
7. Be brief. Be precise. No padding. No vague adjectives.

OUTPUT FORMAT — You must return valid JSON only:
{
  "score_objective": <number 1–10>,
  "score_subjective": <number 1–10>,
  "score_combined": <number 1–10>,
  "lines": [
    {
      "number": <line number>,
      "text": "<exact line text>",
      "flag": "RED" | "YELLOW" | "GREEN",
      "analysis": "<one concise sentence about structure/sound/syntax>"
    }
  ],
  "structural_movements": "<2–4 sentences on overall structural arc>",
  "remaining_targets": "<2–4 sentences on the top structural issues to address>",
  "what_changed": "<only if revision: 2–3 sentences on what structurally changed>",
  "comparison_scorecard": "<only if revision: short scorecard comparing versions>"
}`;

export default function Submit() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState("1");
  const [poem, setPoem] = useState("");
  const [isRevision, setIsRevision] = useState(false);
  const [previousText, setPreviousText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [titleError, setTitleError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("previous")) setPreviousText(decodeURIComponent(params.get("previous")));
    if (params.get("title")) setTitle(decodeURIComponent(params.get("title")));
    if (params.get("version")) setVersion(decodeURIComponent(params.get("version")));
    if (params.get("previous")) setIsRevision(true);
  }, []);

  const handleSubmit = async () => {
    if (!poem.trim()) { setError("Please enter a poem."); return; }
    if (!title.trim()) { setError("Please enter a title."); return; }

    setError("");
    setTitleError("");
    setLoading(true);

    // Check for duplicate title (only for new poems, not revisions)
    if (!isRevision) {
      try {
        const existing = await base44.entities.PoemAnalysis.filter({ title: title.trim() });
        if (existing.length > 0) {
          setTitleError(`A poem named "${title.trim()}" already exists. Please choose a unique title.`);
          setLoading(false);
          return;
        }
      } catch (e) {
        // If check fails, proceed anyway
      }
    }

    const prompt = `${SYSTEM_PROMPT}

POEM TITLE: ${title}
VERSION: ${version}
${isRevision && previousText ? `PREVIOUS VERSION:\n${previousText}\n\nNEW VERSION:\n${poem}` : `POEM:\n${poem}`}

Return only valid JSON.`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
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
            remaining_targets: { type: "string" },
            what_changed: { type: "string" },
            comparison_scorecard: { type: "string" },
          },
        },
      });

      const redCount = result.lines?.filter(l => l.flag === "RED").length || 0;
      const yellowCount = result.lines?.filter(l => l.flag === "YELLOW").length || 0;
      const greenCount = result.lines?.filter(l => l.flag === "GREEN").length || 0;

      const saved = await base44.entities.PoemAnalysis.create({
        title: title.trim(),
        version_number: parseFloat(version) || 1,
        poem_text: poem,
        previous_poem_text: isRevision ? previousText : undefined,
        is_revision: isRevision,
        analysis_raw: JSON.stringify(result),
        poem_score: result.score_combined,
        red_count: redCount,
        yellow_count: yellowCount,
        green_count: greenCount,
        is_saved: false,
      });

      navigate(createPageUrl(`Analysis?id=${saved.id}`));
    } catch (err) {
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-foreground px-4 py-10" style={{ background: "linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)" }}>
      <style>{`
        .submit-input, .submit-textarea {
          background-color: hsl(var(--card) / 0.6);
          border-color: hsl(var(--border));
          color: hsl(var(--foreground));
        }
        .submit-input::placeholder, .submit-textarea::placeholder {
          color: hsl(var(--muted-foreground) / 0.4);
        }
        .submit-input:focus, .submit-textarea:focus {
          border-color: hsl(var(--primary) / 0.5);
          outline: none;
          box-shadow: 0 0 0 2px hsl(var(--primary) / 0.15);
        }
        .submit-input-error {
          border-color: #EC4899 !important;
          box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.2) !important;
        }
        .submit-label {
          color: hsl(var(--muted-foreground));
        }
        .submit-toggle-container {
          background-color: hsl(var(--card) / 0.6);
          border-color: hsl(var(--border));
        }
        .submit-button-submit {
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          transition: all 0.3s ease;
        }
        .submit-button-submit:hover:not(:disabled) {
          filter: brightness(1.15);
          box-shadow: 0 0 24px hsl(var(--primary) / 0.4);
        }
        .submit-button-submit:disabled {
          background-color: hsl(var(--border));
          opacity: 0.5;
          cursor: not-allowed;
        }
        .submit-error {
          color: #EC4899;
        }
        .submit-heading {
          color: hsl(var(--primary));
        }
      `}</style>

      <div className="max-w-2xl mx-auto">
        <h1 className="submit-heading text-3xl font-bold mb-8 tracking-tight">Analyze a Poem</h1>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="submit-label text-xs uppercase tracking-[0.15em] block mb-2">Title *</label>
              <input
                value={title}
                onChange={e => { setTitle(e.target.value); setTitleError(""); }}
                placeholder="Poem title…"
                className={`submit-input w-full border px-4 py-3 text-sm ${titleError ? "submit-input-error" : ""}`}
                disabled={isRevision}
              />
              {titleError && <p className="submit-error text-xs mt-1">{titleError}</p>}
            </div>
            <div>
              <label className="submit-label text-xs uppercase tracking-[0.15em] block mb-2">Version</label>
              <input
                value={version}
                onChange={e => setVersion(e.target.value)}
                placeholder="1"
                className="submit-input w-full border px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="submit-label text-xs uppercase tracking-[0.15em] block mb-2">Poem</label>
            <textarea
              value={poem}
              onChange={e => setPoem(e.target.value)}
              placeholder="Paste your poem here…"
              rows={14}
              className="submit-textarea w-full border px-4 py-4 resize-none leading-relaxed font-mono text-sm transition-colors"
            />
          </div>

          <div className="submit-toggle-container flex items-center justify-between p-4 border">
            <span className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Compare to previous version?</span>
            <button
              onClick={() => setIsRevision(!isRevision)}
              className="relative w-11 h-6 transition-colors select-none"
              style={{ backgroundColor: isRevision ? "hsl(var(--primary))" : "hsl(var(--border))" }}
            >
              <span
                className="absolute top-1 w-4 h-4 bg-white transition-transform shadow"
                style={{ left: isRevision ? "calc(100% - 1.25rem)" : "0.25rem", transition: "left 0.2s" }}
              />
            </button>
          </div>

          {isRevision && (
            <div>
              <label className="submit-label text-xs uppercase tracking-[0.15em] block mb-2">Previous Version</label>
              <textarea
                value={previousText}
                onChange={e => setPreviousText(e.target.value)}
                placeholder="Previous version…"
                rows={10}
                className="submit-textarea w-full border px-4 py-4 resize-none leading-relaxed font-mono text-sm transition-colors"
                style={{ borderColor: "hsl(var(--primary) / 0.3)" }}
              />
            </div>
          )}

          {error && <p className="submit-error text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading || !poem.trim() || !title.trim()}
            className="submit-button-submit w-full py-4 text-sm font-bold tracking-[0.15em] uppercase"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing…
              </span>
            ) : (
              "Submit for Analysis"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
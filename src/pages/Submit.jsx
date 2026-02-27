import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Loader2, PenLine } from "lucide-react";

export default function Submit() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState("1");
  const [poemText, setPoemText] = useState("");
  const [isRevision, setIsRevision] = useState(false);
  const [previousText, setPreviousText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill from location state (when coming from "Submit a Revision")
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefillPrev = params.get("previous");
    const prefillTitle = params.get("title");
    const prefillVersion = params.get("version");
    if (prefillPrev) {
      setPreviousText(decodeURIComponent(prefillPrev));
      setIsRevision(true);
    }
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

    const systemPrompt = `You are a poetry editor who provides structural and sonic analysis only. You never suggest rewrites, alternative words, content changes, or thematic directions. You only critique what is written.

When the user provides a poem:
1. Number each line sequentially and assign a priority flag: RED (high priority — typos, garbled syntax, rhythm breaks that fight the content, lines where meaning is lost), YELLOW (medium priority — soft phrasing, abstract where surrounding lines are concrete, rhythmic flatness), GREEN (already working — compression, sonic texture, imagery, rhythm serving content).
2. Write a line-by-line analysis covering sound-craft, syntax, imagery, rhythm, register, and typos.
3. Identify structural movements.
4. Provide a poem score on a 1-10 scale.
${isRevision ? "5. Write a 'What Changed' section identifying every difference from the previous version with analysis of what each change did structurally and sonically.\n6. Include a comparison scorecard.\n7. List remaining revision targets." : ""}

RULES: NEVER suggest what the poet should write. NEVER offer alternative words, phrases, lines, or structures. NEVER say 'this line would benefit from' or 'consider' or 'perhaps try'. You describe what IS on the page.

Return a JSON object with this exact structure:
{
  "poem_score": <number 1-10>,
  "lines": [
    { "number": 1, "text": "line text", "flag": "RED|YELLOW|GREEN", "analysis": "analysis text" }
  ],
  "structural_movements": "description of the poem's natural sections",
  "what_changed": "comparison analysis (only for revisions, else null)",
  "comparison_scorecard": "scorecard text (only for revisions, else null)",
  "remaining_targets": "list of red and yellow items"
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: promptText,
      response_json_schema: {
        type: "object",
        properties: {
          poem_score: { type: "number" },
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
      poem_score: result.poem_score,
      red_count: redCount,
      yellow_count: yellowCount,
      green_count: greenCount,
    });

    setLoading(false);
    navigate(createPageUrl(`Analysis?id=${record.id}`));
  };

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <PenLine className="w-5 h-5 text-red-400/70" />
          <h1 className="text-2xl font-light text-white">Analyze a Poem</h1>
        </div>

        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="text-xs uppercase tracking-widest text-white/30 mb-2 block select-none">Title (optional)</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Untitled"
              className="w-full bg-[#141417] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/25 transition-colors"
            />
          </div>

          {/* Version */}
          <div>
            <label className="text-xs uppercase tracking-widest text-white/30 mb-2 block select-none">Version Number (optional)</label>
            <input
              value={version}
              onChange={e => setVersion(e.target.value)}
              placeholder="1"
              className="w-full bg-[#141417] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/25 transition-colors"
            />
          </div>

          {/* Poem */}
          <div>
            <label className="text-xs uppercase tracking-widest text-white/30 mb-2 block select-none">Paste your poem here</label>
            <textarea
              value={poemText}
              onChange={e => setPoemText(e.target.value)}
              placeholder="Begin here…"
              rows={12}
              className="w-full bg-[#141417] border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 resize-none focus:outline-none focus:border-white/25 transition-colors leading-relaxed font-mono text-sm"
            />
          </div>

          {/* Is Revision Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#141417] border border-white/8">
            <span className="text-sm text-white/60 select-none">Is this a revision of a previously analyzed poem?</span>
            <button
              onClick={() => setIsRevision(!isRevision)}
              className={`relative w-11 h-6 rounded-full transition-colors select-none ${isRevision ? "bg-red-500" : "bg-white/15"}`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${isRevision ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>

          {/* Previous version */}
          {isRevision && (
            <div>
              <label className="text-xs uppercase tracking-widest text-white/30 mb-2 block select-none">Paste the previous version here</label>
              <textarea
                value={previousText}
                onChange={e => setPreviousText(e.target.value)}
                placeholder="Previous version…"
                rows={10}
                className="w-full bg-[#141417] border border-amber-700/30 rounded-xl px-4 py-4 text-white placeholder-white/20 resize-none focus:outline-none focus:border-amber-700/50 transition-colors leading-relaxed font-mono text-sm"
              />
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading || !poemText.trim()}
            className="w-full py-4 rounded-2xl text-sm font-medium tracking-widest uppercase transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed select-none"
            style={{
              background: loading || !poemText.trim() ? "#222" : "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
              color: loading || !poemText.trim() ? "#666" : "#fff",
            }}
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
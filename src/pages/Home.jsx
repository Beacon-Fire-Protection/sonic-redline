import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, BarChart2, PenLine, Music } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0D0D0F] text-white flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <PenLine className="w-6 h-6 text-red-400 opacity-80" />
          <span className="text-xs tracking-[0.3em] uppercase text-red-400/70 font-medium select-none">
            Poetry Editor
          </span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-light text-white tracking-tight mb-4">
          Sonic Redline
        </h1>
        <p className="text-white/40 text-base leading-relaxed mb-12 max-w-sm mx-auto">
          Structural, sonic, and rhythmic critique — without rewriting your work.
        </p>

        <div className="grid grid-cols-1 gap-4">
          <Link
            to={createPageUrl("Submit")}
            className="flex items-center gap-4 p-5 rounded-2xl border border-white/10 bg-[#141417] hover:bg-[#1a1a1e] hover:border-white/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
              <PenLine className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-left">
              <div className="text-white font-medium">Analyze a Poem</div>
              <div className="text-white/35 text-sm mt-0.5">Submit a new poem or revision for critique</div>
            </div>
          </Link>

          <Link
            to={createPageUrl("Collection")}
            className="flex items-center gap-4 p-5 rounded-2xl border border-white/10 bg-[#141417] hover:bg-[#1a1a1e] hover:border-white/20 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-left">
              <div className="text-white font-medium">My Collection</div>
              <div className="text-white/35 text-sm mt-0.5">Browse poems, scores, and version history</div>
            </div>
          </Link>

          <Link
            to={createPageUrl("Dashboard")}
            className="flex items-center gap-4 p-5 rounded-2xl border border-white/10 bg-[#141417] hover:bg-[#1a1a1e] hover:border-white/20 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
              <BarChart2 className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-left">
              <div className="text-white font-medium">Flag Dashboard</div>
              <div className="text-white/35 text-sm mt-0.5">Collection-wide red/yellow/green summary</div>
            </div>
          </Link>

          <Link
            to={createPageUrl("RhythmHelper")}
            className="flex items-center gap-4 p-5 rounded-2xl border border-white/10 bg-[#141417] hover:bg-[#1a1a1e] hover:border-white/20 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center flex-shrink-0">
              <Music className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-left">
              <div className="text-white font-medium">Rhythm Reference</div>
              <div className="text-white/35 text-sm mt-0.5">Metrical foot patterns for quick reference</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a2266141888b3ccda1983d/a97572646_sonic.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-sm w-full text-center">
        <img src={LOGO} alt="Sonic Redline" className="w-40 h-40 mx-auto mb-6 object-contain" />
        <p className="text-white/40 text-sm tracking-[0.2em] uppercase mb-12">Structure. Sound. Truth.</p>

        <Link
          to={createPageUrl("Submit")}
          className="block w-full py-4 text-sm font-bold tracking-[0.15em] uppercase transition-all mb-4 text-white"
          style={{ background: "#FF2D2D" }}
        >
          Analyze a Poem
        </Link>

        <Link
          to={createPageUrl("Collection")}
          className="block w-full py-4 text-sm font-bold tracking-[0.15em] uppercase transition-all text-white/60 hover:text-white border border-white/15 hover:border-white/30"
        >
          Saved Poems
        </Link>
      </div>
    </div>
  );
}
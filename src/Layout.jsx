import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, BookOpen, User, Music } from "lucide-react";

const LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a2266141888b3ccda1983d/a97572646_sonic.png";

const PAGE_NAMES = {
  Home: "Home",
  Submit: "Analyze",
  Collection: "Saved Poems",
  Profile: "Profile",
  RhythmHelper: "Rhythm",
  Analysis: "Analysis",
};

const tabs = [
  { name: "Home", label: "Home", icon: Home },
  { name: "Submit", label: "Analyze", icon: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )},
  { name: "Collection", label: "Saved", icon: BookOpen },
  { name: "RhythmHelper", label: "Rhythm", icon: Music },
  { name: "Profile", label: "Profile", icon: User },
];

const NO_TAB_PAGES = ["Analysis"];
const ACTIVE_COLOR = "#FF2D2D";
const INACTIVE_COLOR = "#555";

export default function Layout({ children, currentPageName }) {
  const showTabs = !NO_TAB_PAGES.includes(currentPageName);

  return (
    <div className="flex flex-col bg-[#0D0D0D] min-h-screen" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        body { overscroll-behavior: none; background: #0D0D0D; }
        .pb-safe { padding-bottom: calc(1rem + env(safe-area-inset-bottom)); }
      `}</style>

      {/* Top header bar */}
      <header className="flex items-center justify-between bg-[#0D0D0D] border-b border-white/8 h-44 px-4 flex-shrink-0">
        <Link to={createPageUrl("Home")}>
          <img src={LOGO} alt="Sonic Redline" className="h-40 w-auto object-contain" />
        </Link>
        <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/40">
          {PAGE_NAMES[currentPageName] || currentPageName}
        </span>
      </header>

      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: showTabs ? "calc(4.5rem + env(safe-area-inset-bottom))" : "env(safe-area-inset-bottom)" }}
      >
        {children}
      </main>

      {showTabs && (
        <nav
          className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-white/8 flex select-none z-50"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {tabs.map(({ name, label, icon: Icon }) => {
            const active = currentPageName === name || (currentPageName === "Submit" && name === "Submit");
            return (
              <Link
                key={name}
                to={createPageUrl(name)}
                className="flex-1 flex flex-col items-center justify-center pt-3 pb-2.5 gap-1 transition-opacity active:opacity-60"
              >
                <Icon style={{ color: active ? ACTIVE_COLOR : INACTIVE_COLOR }} />
                <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: active ? ACTIVE_COLOR : INACTIVE_COLOR }}>
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, BookOpen, User, Music, Clipboard } from "lucide-react";

const LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a2266141888b3ccda1983d/5929851bb_sonic1.png";

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
  { name: "Submit", label: "Analyze", icon: Clipboard },
  { name: "Collection", label: "Saved", icon: BookOpen },
  { name: "RhythmHelper", label: "Rhythm", icon: Music },
  { name: "Profile", label: "Profile", icon: User },
];

const NO_TAB_PAGES = ["Analysis"];
const ACTIVE_COLOR = "#FF3399";      // Hot pink
const INACTIVE_COLOR = "#C084FC";    // Soft purple
const BG_DARK = "#1a0f2e";           // Deep purple
const BG_LIGHT = "#f3e8ff";          // Lavender
const ACCENT_AQUA = "#06b6d4";       // Bright aqua
const MINT_GREEN = "#10b981";        // Mint

export default function Layout({ children, currentPageName }) {
  const showTabs = !NO_TAB_PAGES.includes(currentPageName);

  return (
    <div className="flex flex-col min-h-screen" style={{ 
      background: `linear-gradient(135deg, ${BG_DARK} 0%, #2d1b4e 100%)`,
      paddingTop: "env(safe-area-inset-top)",
      color: "#f3e8ff"
    }}>
      <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        body { 
          overscroll-behavior: none; 
          background: linear-gradient(135deg, #1a0f2e 0%, #2d1b4e 100%);
        }
        .pb-safe { padding-bottom: calc(1rem + env(safe-area-inset-bottom)); }
        
        /* Magical shimmer effect on header */
        .header-shimmer {
          background: linear-gradient(90deg, rgba(255, 51, 153, 0.1) 0%, rgba(6, 182, 212, 0.1) 50%, rgba(255, 51, 153, 0.1) 100%);
          animation: shimmer 3s infinite;
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* Top header bar with magical gradient */}
      <header className="flex items-center justify-between border-b h-44 px-4 flex-shrink-0 header-shimmer" style={{
        borderColor: `${ACCENT_AQUA}40`,
        background: `linear-gradient(90deg, rgba(255, 51, 153, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)`
      }}>
        <Link to={createPageUrl("Home")}>
          <img src={LOGO} alt="Sonic Redline" className="h-40 w-auto object-contain drop-shadow-lg" style={{
            filter: "drop-shadow(0 0 20px rgba(255, 51, 153, 0.3))"
          }} />
        </Link>
        <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{
          color: ACCENT_AQUA,
          textShadow: `0 0 10px ${ACTIVE_COLOR}40`
        }}>
          {PAGE_NAMES[currentPageName] || currentPageName}
        </span>
      </header>

      <main
        className="flex-1 overflow-hidden"
        style={{ paddingBottom: showTabs ? "calc(6rem + env(safe-area-inset-bottom))" : "env(safe-area-inset-bottom)" }}
      >
        {children}
      </main>

      {showTabs && (
        <nav
          className="fixed bottom-0 left-0 right-0 border-t flex select-none z-50"
          style={{ 
            paddingBottom: "env(safe-area-inset-bottom)",
            background: `linear-gradient(180deg, rgba(45, 27, 78, 0.95) 0%, rgba(26, 15, 46, 0.98) 100%)`,
            borderColor: `${ACCENT_AQUA}40`,
            backdropFilter: "blur(10px)"
          }}
        >
          {tabs.map(({ name, label, icon: Icon }) => {
            const active = currentPageName === name || (currentPageName === "Submit" && name === "Submit");
            return (
              <Link
                key={name}
                to={createPageUrl(name)}
                className="flex-1 flex flex-col items-center justify-center pt-3 pb-2.5 gap-1 transition-all active:opacity-60 hover:opacity-80"
                style={{
                  background: active ? `${ACTIVE_COLOR}15` : "transparent",
                  borderRadius: active ? "12px 12px 0 0" : "0"
                }}
              >
                <Icon style={{ 
                  color: active ? ACTIVE_COLOR : INACTIVE_COLOR,
                  filter: active ? `drop-shadow(0 0 8px ${ACTIVE_COLOR}60)` : "none",
                  transition: "all 0.3s ease"
                }} />
                <span className="text-[10px] font-bold tracking-wider uppercase" style={{ 
                  color: active ? ACTIVE_COLOR : INACTIVE_COLOR,
                  textShadow: active ? `0 0 6px ${ACTIVE_COLOR}40` : "none",
                  transition: "all 0.3s ease"
                }}>
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
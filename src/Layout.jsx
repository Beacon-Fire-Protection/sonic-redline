import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { PenLine, BookOpen, BarChart2, Music, Home } from "lucide-react";

const tabs = [
  { name: "Home", label: "Home", icon: Home },
  { name: "Submit", label: "Analyze", icon: PenLine },
  { name: "Collection", label: "Collection", icon: BookOpen },
  { name: "Dashboard", label: "Dashboard", icon: BarChart2 },
  { name: "RhythmHelper", label: "Rhythm", icon: Music },
];

// Pages that should NOT show the tab bar
const NO_TAB_PAGES = ["Analysis"];

export default function Layout({ children, currentPageName }) {
  const showTabs = !NO_TAB_PAGES.includes(currentPageName);

  return (
    <div
      className="flex flex-col bg-[#0D0D0F] min-h-screen"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        body { overscroll-behavior: none; background: #0D0D0F; }
      `}</style>

      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: showTabs ? "calc(4rem + env(safe-area-inset-bottom))" : "env(safe-area-inset-bottom)" }}
      >
        {children}
      </main>

      {showTabs && (
        <nav
          className="fixed bottom-0 left-0 right-0 bg-[#111113] border-t border-white/8 flex select-none z-50"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {tabs.map(({ name, label, icon: Icon }) => {
            const active = currentPageName === name;
            return (
              <Link
                key={name}
                to={createPageUrl(name)}
                className="flex-1 flex flex-col items-center justify-center pt-3 pb-2 gap-1 transition-opacity active:opacity-60"
              >
                <Icon
                  className="w-5 h-5 transition-colors"
                  style={{ color: active ? "#ef4444" : "#555" }}
                />
                <span
                  className="text-[10px] font-medium tracking-wide transition-colors"
                  style={{ color: active ? "#ef4444" : "#555" }}
                >
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
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, Clock, Settings } from "lucide-react";

const tabs = [
  { name: "Home", label: "Analyzer", icon: Search },
  { name: "History", label: "History", icon: Clock },
  { name: "Settings", label: "Settings", icon: Settings },
];

export default function Layout({ children, currentPageName }) {
  return (
    <div
      className="flex flex-col bg-[#0D0D0F] min-h-screen"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        body { overscroll-behavior: none; background: #0D0D0F; }
      `}</style>

      {/* Page content — padded at bottom for tab bar */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: "calc(4rem + env(safe-area-inset-bottom))" }}
      >
        {children}
      </main>

      {/* Bottom Tab Bar */}
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
                style={{ color: active ? "#C9A84C" : "#555" }}
              />
              <span
                className="text-[10px] font-medium tracking-wide transition-colors"
                style={{ color: active ? "#C9A84C" : "#555" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
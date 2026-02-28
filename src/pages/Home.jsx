import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const LOGO =
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a2266141888b3ccda1983d/a97572646_sonic.png";

export default function Home() {
  return (
    <div
      className="h-dvh overflow-hidden text-foreground flex items-center justify-center px-6"
      style={{
        background:
          "linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)",
      }}
    >
      <style>{`
        .home-tagline {
          color: hsl(var(--muted-foreground));
        }
        .home-button-container {
          background-color: hsl(var(--card));
        }
        .home-primary-button {
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          transition: all 0.3s ease;
        }
        .home-primary-button:hover {
          filter: brightness(1.1);
          box-shadow: 0 0 24px hsl(var(--primary) / 0.4);
        }
        .home-secondary-button {
          border-color: hsl(var(--border));
          color: hsl(var(--muted-foreground));
          transition: all 0.3s ease;
        }
        .home-secondary-button:hover {
          color: hsl(var(--foreground));
          border-color: hsl(var(--primary) / 0.5);
          background-color: hsl(var(--primary) / 0.05);
        }
      `}</style>

      <div className="max-w-sm w-full text-center">
        <p className="home-tagline text-sm tracking-[0.2em] uppercase mb-12">
          Structure. Sound. Truth.
        </p>

        <div className="home-button-container p-6 mb-4">
          <Link
            to={createPageUrl("Submit")}
            className="home-primary-button block w-full py-4 text-sm font-bold tracking-[0.15em] uppercase"
          >
            Analyze a Poem
          </Link>
        </div>

        <div className="home-button-container p-6">
          <Link
            to={createPageUrl("Collection")}
            className="home-secondary-button block w-full py-4 text-sm font-bold tracking-[0.15em] uppercase border"
          >
            Saved Poems
          </Link>
        </div>
      </div>
    </div>
  );
}
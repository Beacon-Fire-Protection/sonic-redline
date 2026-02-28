import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Home() {
  return (
    <div
      className="min-h-dvh text-foreground px-6 pt-20 pb-10"
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

      <div className="max-w-sm w-full mx-auto text-center">
        <p className="home-tagline text-sm tracking-[0.2em] uppercase mb-8">
          Structure. Sound. Truth.
        </p>

        <div className="home-button-container p-4 mb-4">
          <Link
            to={createPageUrl("Submit")}
            className="home-primary-button block w-full py-3 text-sm font-bold tracking-[0.15em] uppercase"
          >
            Analyze a Poem
          </Link>
        </div>

        <div className="home-button-container p-4">
          <Link
            to={createPageUrl("Collection")}
            className="home-secondary-button block w-full py-3 text-sm font-bold tracking-[0.15em] uppercase border"
          >
            Saved Poems
          </Link>
        </div>
      </div>
    </div>
  );
}
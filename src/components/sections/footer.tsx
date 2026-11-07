import { site } from "@/content/site";
import { LocalClock } from "@/components/ui/local-clock";

export function Footer() {
  return (
    <footer className="border-t border-line py-8 font-mono text-xs text-muted">
      <div className="container-page flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p>
          <span className="text-accent">guest@praduman:~$</span> exit
          <span className="text-dim"> · © {new Date().getFullYear()} {site.name}</span>
        </p>
        <p className="text-dim">
          local time in India: <span className="text-fg"><LocalClock timeZone={site.timezone} /></span> IST
        </p>
        <p className="flex flex-wrap gap-x-3 gap-y-1">
          {site.sourceIsPublic && (
            <>
              <a href={site.links.source} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-accent">
                source
              </a>
              <span className="text-dim">·</span>
            </>
          )}
          <a href={site.links.coffee} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-accent">
            buy me a coffee
          </a>
          <span className="text-dim">·</span>
          <a href="#top" className="transition-colors hover:text-accent">
            back to top ↑
          </a>
        </p>
      </div>
    </footer>
  );
}

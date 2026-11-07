import { devopsProjects, moreWork, type DevOpsProject } from "@/content/projects";
import { sectionIndex, site } from "@/content/site";
import { cn } from "@/lib/cn";
import { ArrowUpRight, GitHubIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

function ProjectLinks({ links }: { links: DevOpsProject["links"] }) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2">
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link inline-flex items-center gap-1.5 border-b border-accent/35 pb-px font-mono text-[13px] transition-colors hover:border-accent hover:text-accent"
        >
          {l.label}
          <ArrowUpRight className="size-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
        </a>
      ))}
    </div>
  );
}

function Meta({ p }: { p: DevOpsProject }) {
  return (
    <div className="flex justify-between gap-3 font-mono text-xs text-dim">
      <span>{p.label}</span>
      <span className="flex gap-3.5 text-muted">
        {p.stars !== undefined && <span title="GitHub stars">★ {p.stars}</span>}
        {p.forks !== undefined && <span title="GitHub forks">⑂ {p.forks}</span>}
        {p.language && <span>{p.language}</span>}
      </span>
    </div>
  );
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
      {tags.map((t) => (
        <li key={t} className="rounded-full border border-line-2 px-2.5 py-0.5 font-mono text-[11px] text-muted">
          {t}
        </li>
      ))}
    </ul>
  );
}

/** Horizontal chips joined by arrows, for compact cards. */
function FlowChips({ flow }: { flow: string[] }) {
  return (
    <div aria-label="Pipeline" className="flex flex-wrap items-center gap-x-1 gap-y-1.5 rounded-md border border-dashed border-line-2 bg-black/30 p-3.5 font-mono text-[11.5px]">
      {flow.map((step, i) => (
        <span key={step} className="flex items-center gap-1">
          {i > 0 && <span className="text-dim">→</span>}
          <span className="rounded-[3px] border border-accent/15 bg-accent/5 px-2 py-0.5">{step}</span>
        </span>
      ))}
    </div>
  );
}

/** Vertical pipeline graph with a travelling pulse, for the featured project. */
function FlowGraph({ flow }: { flow: string[] }) {
  return (
    <ol aria-label="Pipeline" className="relative space-y-2.5 rounded-lg border border-line-2 bg-black/35 p-5 font-mono text-[12.5px]">
      <span aria-hidden="true" className="absolute top-8 bottom-8 left-[33px] w-px bg-gradient-to-b from-accent/60 via-line-2 to-accent/60" />
      {flow.map((step, i) => (
        <li key={step} className="relative flex items-center gap-3.5">
          <span
            className={cn(
              "relative z-10 grid size-[26px] place-items-center rounded-full border bg-bg text-[10px]",
              i === 0 || i === flow.length - 1 ? "border-accent text-accent" : "border-line-2 text-muted",
            )}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="flex-1 rounded border border-line bg-white/[0.02] px-3 py-1.5">{step}</span>
          <span className="text-[10.5px] text-accent">✓</span>
        </li>
      ))}
    </ol>
  );
}

export function Work() {
  const [featured, ...rest] = devopsProjects;

  return (
    <section id="work" className="pt-[clamp(88px,11vw,150px)]">
      <div className="container-page">
        <SectionHeading
          index={sectionIndex("work")}
          label="selected work"
          title="Production-grade, built in the open"
          description="Real DevOps projects with full source code and step-by-step write-ups. These are the same patterns I'd bring to your stack, already battle-tested and documented."
        />

        {featured && (
          <Reveal>
            <article data-spotlight className="hud-card grid grid-cols-1 gap-8 p-6 sm:p-9 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-12">
              <div className="flex flex-col gap-5">
                <Meta p={featured} />
                <h3 className="font-mono text-[clamp(1.4rem,2.4vw,1.85rem)] leading-tight font-bold tracking-[-0.04em]">
                  {featured.title}
                </h3>
                <p className="leading-relaxed text-muted">{featured.summary}</p>
                <p className="font-mono text-[13px] text-muted">
                  <span className="text-accent">→ for you:</span> {featured.outcome}
                </p>
                <Tags tags={featured.tags} />
                <div className="mt-auto pt-2">
                  <ProjectLinks links={featured.links} />
                </div>
              </div>
              <FlowGraph flow={featured.flow} />
            </article>
          </Reveal>
        )}

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {rest.map((p, i) => (
            <Reveal key={p.id} delay={i} className="h-full">
              <article data-spotlight className="hud-card flex h-full flex-col gap-5 p-6 sm:p-7">
                <Meta p={p} />
                <h3 className="font-mono text-[1.32rem] leading-tight font-bold tracking-[-0.035em]">{p.title}</h3>
                <p className="text-[0.97rem] leading-relaxed text-muted">{p.summary}</p>
                <FlowChips flow={p.flow} />
                <p className="font-mono text-[12.5px] text-muted">
                  <span className="text-accent">→ for you:</span> {p.outcome}
                </p>
                <Tags tags={p.tags} />
                <div className="mt-auto pt-1">
                  <ProjectLinks links={p.links} />
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16">
          <p className="mb-4 font-mono text-sm">
            <span className="text-dim">$</span> ls ./more-work
          </p>
          <ul className="border-t border-line">
            {moreWork.map((w) => (
              <li key={w.href}>
                <a
                  href={w.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group grid grid-cols-[minmax(0,1fr)_18px] items-center gap-x-4 gap-y-1 border-b border-line px-1.5 py-4 transition-[background-color,padding] duration-300 hover:bg-accent/[0.03] hover:pl-3.5 md:grid-cols-[96px_minmax(0,1fr)_auto_18px] md:gap-5"
                >
                  <span className="font-mono text-xs text-accent">{w.kind}</span>
                  <span className="font-medium transition-colors group-hover:text-accent max-md:col-start-1">{w.title}</span>
                  <span className="font-mono text-xs text-dim max-md:col-start-1">{w.meta}</span>
                  <ArrowUpRight className="size-4 text-dim transition-[color,transform] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent max-md:col-start-2 max-md:row-span-3 max-md:row-start-1" />
                </a>
              </li>
            ))}
          </ul>
          <a
            href={`${site.links.github}?tab=repositories`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2.5 font-mono text-[13px] text-muted transition-colors hover:text-accent"
          >
            <GitHubIcon className="size-4" /> all repositories on GitHub <ArrowUpRight className="size-3.5" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

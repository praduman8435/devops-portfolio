import { sectionIndex, site } from "@/content/site";
import { kubernetesSeries, posts } from "@/content/writing";
import { ArrowUpRight, HashnodeIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export function Writing() {
  return (
    <section id="writing" className="pt-[clamp(88px,11vw,150px)]">
      <div className="container-page">
        <SectionHeading
          index={sectionIndex("writing")}
          label="writing"
          title="I explain what I build"
          description={`${site.articles} articles on Hashnode. If I can teach it clearly, I can document it clearly for your team.`}
        />

        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
          <Reveal>
            <ul className="border-t border-line">
              {posts.map((p) => (
                <li key={p.href}>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group grid grid-cols-[minmax(0,1fr)_18px] items-baseline gap-x-4 gap-y-1 border-b border-line px-1.5 py-[18px] transition-[background-color,padding] duration-300 hover:bg-accent/[0.03] hover:pl-3.5 md:grid-cols-[100px_minmax(0,1fr)_18px] md:gap-5"
                  >
                    <time dateTime={p.date} className="font-mono text-xs text-dim">
                      {p.date}
                    </time>
                    <span className="max-md:col-start-1">
                      <span className="block leading-snug font-medium transition-colors group-hover:text-accent">{p.title}</span>
                      <span className="mt-1 block text-sm text-muted">{p.summary}</span>
                    </span>
                    <ArrowUpRight className="size-4 self-center text-dim transition-[color,transform] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent max-md:col-start-2 max-md:row-span-2 max-md:row-start-1" />
                  </a>
                </li>
              ))}
            </ul>
            <a
              href={site.links.blog}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2.5 font-mono text-[13px] text-muted transition-colors hover:text-accent"
            >
              <HashnodeIcon className="size-4" /> read all {site.articles} articles <ArrowUpRight className="size-3.5" />
            </a>
          </Reveal>

          <Reveal delay={2} className="lg:sticky lg:top-24">
            <aside data-spotlight className="hud-card p-7">
              <p className="font-mono text-xs text-accent">series · {kubernetesSeries.parts.length} parts</p>
              <h3 className="mt-2.5 font-mono text-xl font-bold tracking-[-0.035em]">{kubernetesSeries.title}</h3>
              <p className="mt-2 text-[0.95rem] text-muted">{kubernetesSeries.description}</p>
              <ol className="my-6 space-y-1 font-mono text-[13px]">
                {kubernetesSeries.parts.map((part, i) => (
                  <li key={part}>
                    <span className="text-dim">part-{String(i + 1).padStart(2, "0")}  </span>
                    {part}
                  </li>
                ))}
              </ol>
              <a
                href={kubernetesSeries.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 border-b border-accent/35 pb-px font-mono text-[13px] transition-colors hover:border-accent hover:text-accent"
              >
                read the series <ArrowUpRight className="size-3.5" />
              </a>
            </aside>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

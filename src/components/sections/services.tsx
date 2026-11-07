import { engagementModels, services } from "@/content/services";
import { sectionIndex } from "@/content/site";
import { ServiceGlyph } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export function Services() {
  return (
    <section id="services" className="pt-[clamp(88px,11vw,150px)]">
      <div className="container-page">
        <SectionHeading
          index={sectionIndex("services")}
          label="services"
          title="What I can do for you"
          description="Pick one area, or hand me the whole path from commit to production. Every engagement ends with code, docs and dashboards your team owns. You're never locked in to me."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={i % 3} className="h-full">
              <article data-spotlight className="hud-card flex h-full flex-col p-7">
                <div className="mb-7 flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-md border border-accent/25 bg-accent/5 text-accent">
                    <ServiceGlyph name={s.icon} className="size-5" />
                  </span>
                  <span className="font-mono text-xs text-dim">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="font-mono text-lg font-semibold tracking-[-0.03em]">{s.title}</h3>
                <p className="mt-2 text-[0.97rem] text-muted">{s.tagline}</p>
                <ul className="mt-5 space-y-2 text-[0.93rem]">
                  {s.points.map((p) => (
                    <li key={p} className="flex gap-2.5">
                      <span aria-hidden="true" className="font-mono text-accent">+</span>
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  <p className="border-t border-dashed border-line-2 pt-4 font-mono text-[12.5px] text-fg">
                    <span className="text-accent">→ </span>
                    {s.outcome}
                  </p>
                  <p className="mt-2 font-mono text-[11.5px] text-dim">{s.tools.join(" · ")}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 rounded-lg border border-dashed border-line-2 p-6 sm:p-7">
          <p className="mb-5 font-mono text-sm">
            <span className="text-dim">$</span> hire --mode <span className="text-dim">[choose one]</span>
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {engagementModels.map((m) => (
              <div key={m.flag}>
                <p className="font-mono text-sm">
                  <code className="text-accent">{m.flag}</code> <span className="text-dim">· {m.title.toLowerCase()}</span>
                </p>
                <p className="mt-2 text-[0.93rem] text-muted">{m.body}</p>
                <p className="mt-2 font-mono text-[11.5px] text-dim">best for: {m.bestFor}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

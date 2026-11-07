import { sectionIndex } from "@/content/site";
import { stack } from "@/content/stack";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export function Stack() {
  return (
    <section id="stack" className="pt-[clamp(88px,11vw,150px)]">
      <div className="container-page">
        <SectionHeading
          index={sectionIndex("stack")}
          label="stack"
          title="Tools of the trade"
          description="The tools I reach for every day. I pick them for your problem, not for my CV."
        />
        <Reveal>
          <div className="grid gap-px overflow-hidden rounded-lg border border-line-2 bg-line-2 sm:grid-cols-2 lg:grid-cols-4">
            {stack.map((g) => (
              <div key={g.dir} className="bg-bg-2 p-6 transition-colors duration-300 hover:bg-panel">
                <h3 className="mb-3.5 font-mono text-[12.5px] font-medium text-accent">~/{g.dir}</h3>
                <ul className="tree space-y-1.5 font-mono text-sm">
                  {g.items.map((it) => (
                    <li key={it.name}>
                      {it.name}
                      {it.note && <span className="ml-2 text-[11px] text-dim">{it.note}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

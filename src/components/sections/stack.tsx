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
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line-2 bg-line-2 lg:grid-cols-4">
            {stack.map((g) => (
              <div key={g.dir} className="min-w-0 bg-bg-2 p-4 transition-colors duration-300 hover:bg-panel sm:p-6">
                <h3 className="mb-3.5 font-mono text-[12.5px] font-medium text-accent">~/{g.dir}</h3>
                <ul className="tree space-y-1.5 font-mono text-[12.5px] sm:text-sm">
                  {g.items.map((it) => (
                    <li key={it.name}>
                      {it.name}
                      {it.note && <span className="ml-2 hidden text-[11px] text-dim sm:inline">{it.note}</span>}
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

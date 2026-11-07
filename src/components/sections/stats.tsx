import { site } from "@/content/site";
import { marqueeItems } from "@/content/stack";
import { CountUp } from "@/components/ui/count-up";

const STATS = [
  { value: site.yearsExperience, suffix: "+", label: "years of DevOps in production" },
  { value: site.articles, suffix: "", label: "technical articles published" },
  { value: 100, suffix: "+", label: "public GitHub repositories" },
  { value: 35, suffix: "+", label: "forks of my DevOps projects" },
] as const;

export function Stats() {
  return (
    <section aria-label="At a glance" className="relative border-y border-line bg-white/[0.008]">
      <div className="container-page grid grid-cols-2 md:grid-cols-4">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className="border-line py-7 pr-4 max-md:[&:nth-child(n+3)]:border-t md:border-l md:pl-6 md:first:border-l-0 md:first:pl-0 max-md:odd:pr-6 max-md:even:border-l max-md:even:pl-5"
            data-index={i}
          >
            <p className="font-mono text-[clamp(1.9rem,3.4vw,2.7rem)] leading-none font-bold tracking-[-0.04em]">
              <CountUp value={s.value} />
              <span className="text-accent">{s.suffix}</span>
            </p>
            <p className="mt-2 font-mono text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Marquee() {
  const items = [...marqueeItems, ...marqueeItems];
  return (
    <div aria-hidden="true" className="mask-fade-x overflow-hidden border-b border-line py-4">
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        {items.map((t, i) => (
          <span key={`${t}-${i}`} className="px-5 font-mono text-[13px] whitespace-nowrap text-dim">
            <span className="mr-5 align-[2px] text-[8px] text-accent/45">◆</span>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

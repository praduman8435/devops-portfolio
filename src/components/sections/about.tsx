import { sectionIndex } from "@/content/site";
import { Reveal } from "@/components/ui/reveal";
import { ScrambleText } from "@/components/ui/scramble-text";

const yaml: Array<[string, string, ("s" | "n" | "ok")?, string?]> = [
  ["engineer", "praduman-prajapati"],
  ["role", "devops engineer"],
  ["experience", "3+ years", "n"],
  ["location", "india · remote"],
  ["timezone", "IST (UTC+5:30)", "s", "overlaps EU hours"],
];

export function About() {
  return (
    <section id="about" className="pt-[clamp(88px,11vw,150px)]">
      <div className="container-page grid grid-cols-1 items-end gap-[clamp(32px,6vw,84px)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div>
          <Reveal>
            <p className="mb-4 font-mono text-[13px] text-accent">
              <span className="text-dim">{"//"}</span> {sectionIndex("about")} — about
            </p>
          </Reveal>
          <ScrambleText
            text="Infrastructure that stays boring."
            className="font-mono text-[clamp(1.9rem,3.8vw,2.9rem)] leading-[1.1] font-bold tracking-[-0.045em] text-balance"
          />
          <Reveal delay={1} className="mt-8 space-y-5 text-[1.05rem] leading-relaxed text-muted [&_strong]:font-medium [&_strong]:text-fg">
            <p>
              I&apos;m Praduman, a DevOps engineer based in India with <strong>3+ years of hands-on production experience</strong>.
              I take fragile, manual release processes and turn them into automated, observable and secure platforms, the kind
              that let a team ship on a Friday afternoon without holding its breath.
            </p>
            <p>
              My core is <strong>AWS, Kubernetes, Terraform and CI/CD</strong>: EKS clusters provisioned as code, GitOps
              delivery with ArgoCD, and pipelines where SonarQube and Trivy gate every build before it gets near production.
            </p>
            <p>
              I also <strong>ship complete products</strong>, including Klasiq, a commerce platform for a real retail business,
              and InstaPlots, a land marketplace for India. Both are live in production, so I understand the application side
              of the systems I automate. I write it all up too: <strong>22 articles</strong> on Hashnode, including a 10-part
              Kubernetes series.
            </p>
          </Reveal>
        </div>

        <Reveal delay={2}>
          <figure className="overflow-hidden rounded-lg border border-line-2 bg-[#080b0a]/90" aria-label="Working profile">
            <figcaption className="flex justify-between border-b border-line px-4 py-2.5 font-mono text-xs text-muted">
              <span>profile.yaml</span>
              <span className="text-dim">yaml</span>
            </figcaption>
            <pre className="overflow-x-auto px-5 pt-4 pb-5 font-mono text-[13px] leading-[1.85]">
              <code>
                <span className="text-dim"># how I work</span>
                {"\n"}
                {yaml.map(([k, v, tone, comment]) => (
                  <span key={k}>
                    <span className="text-cyan">{k}</span>:{" "}
                    <span className={tone === "n" ? "text-amber" : "text-fg"}>{v}</span>
                    {comment && <span className="text-dim">  # {comment}</span>}
                    {"\n"}
                  </span>
                ))}
                <span className="text-cyan">principles</span>:{"\n"}
                {["everything as code", "security from the first commit", "observable by default", "documented & handed over"].map(
                  (p) => (
                    <span key={p}>
                      {"  - "}
                      {p}
                      {"\n"}
                    </span>
                  ),
                )}
                <span className="text-cyan">currently</span>: <span className="text-fg">klasiq · instaplots · radixo</span>
                {"\n"}
                <span className="text-cyan">availability</span>: <span className="text-accent">open to new projects</span>
              </code>
            </pre>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

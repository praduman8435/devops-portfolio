import { sectionIndex, site } from "@/content/site";
import { ArrowUpRight, GitHubIcon, HashnodeIcon, LinkedInIcon, XIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { ScrambleText } from "@/components/ui/scramble-text";
import { BriefBuilder } from "./brief-builder";

const socials = [
  { label: "LinkedIn", handle: site.handles.linkedin, href: site.links.linkedin, Icon: LinkedInIcon },
  { label: "GitHub", handle: site.handles.github, href: site.links.github, Icon: GitHubIcon },
  { label: "X / Twitter", handle: site.handles.x, href: site.links.x, Icon: XIcon },
  { label: "Hashnode", handle: site.handles.blog, href: site.links.blog, Icon: HashnodeIcon },
];

export function Contact() {
  return (
    <section id="contact" className="py-[clamp(88px,11vw,150px)]">
      <div className="container-page">
        <Reveal>
          <div className="relative overflow-hidden rounded-xl border border-line-2 bg-bg-2 p-[clamp(24px,5vw,60px)]">
            <div
              aria-hidden="true"
              className="bg-grid pointer-events-none absolute inset-0 opacity-60 [background-size:28px_28px] [mask-image:radial-gradient(ellipse_60%_70%_at_100%_0%,#000,transparent_70%)]"
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_100%_0%,rgb(61_255_143/0.08),transparent_60%)]" />

            <div className="relative">
              <p className="mb-4 font-mono text-[13px] text-accent">
                <span className="text-dim">{"//"}</span> {sectionIndex("contact")} — contact
              </p>
              <ScrambleText
                text="Let's ship your infrastructure."
                className="max-w-3xl font-mono text-[clamp(2rem,4.6vw,3.5rem)] leading-[1.05] font-bold tracking-[-0.045em] text-balance"
              />
              <p className="mt-5 max-w-[60ch] text-[1.05rem] leading-relaxed text-muted">
                Tell me what you&apos;re building and where it hurts. I&apos;ll reply with honest next steps, even if that&apos;s
                &ldquo;you don&apos;t need Kubernetes yet&rdquo;. Build a quick brief below and it opens in your email client, ready to send.
              </p>

              <div className="mt-10">
                <BriefBuilder />
              </div>

              <div className="mt-10 grid gap-2.5 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
                {socials.map(({ label, handle, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3.5 rounded-md border border-line-2 bg-bg/60 px-4 py-3.5 transition-colors hover:border-accent/45 hover:bg-accent/[0.04]"
                  >
                    <Icon className="size-5 shrink-0 text-muted transition-colors group-hover:text-accent" />
                    <span className="grid min-w-0 flex-1">
                      <span className="font-mono text-sm font-semibold">{label}</span>
                      <span className="truncate font-mono text-xs text-dim">{handle}</span>
                    </span>
                    <ArrowUpRight className="size-4 text-dim transition-[color,transform] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

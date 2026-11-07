"use client";

import { m } from "motion/react";

import { processStages } from "@/content/services";
import { sectionIndex } from "@/content/site";
import { SectionHeading } from "@/components/ui/section-heading";

const STAGE_DELAY = 0.55;

export function Process() {
  return (
    <section id="process" className="pt-[clamp(88px,11vw,150px)]">
      <div className="container-page">
        <SectionHeading
          index={sectionIndex("process")}
          label="process"
          title="How an engagement runs"
          description="The same discipline as a good pipeline: small stages, clear gates, and no surprises."
        />

        <m.ol
          className="relative grid gap-9 md:grid-cols-4 md:gap-0"
          initial="idle"
          whileInView="run"
          viewport={{ once: true, margin: "0px 0px -120px 0px" }}
        >
          {/* Track and animated progress (horizontal on desktop, vertical on mobile) */}
          <span aria-hidden="true" className="absolute top-0 bottom-0 left-[21px] w-px bg-line-2 md:top-[21px] md:right-0 md:bottom-auto md:left-0 md:h-px md:w-auto" />
          <m.span
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-[21px] w-px origin-top bg-gradient-to-b from-accent to-accent/20 shadow-[0_0_10px_rgb(61_255_143/0.6)] md:hidden"
            variants={{ idle: { scaleY: 0 }, run: { scaleY: 1, transition: { duration: 2.2, ease: [0.16, 1, 0.3, 1] } } }}
          />
          <m.span
            aria-hidden="true"
            className="absolute top-[21px] right-0 left-0 hidden h-px origin-left bg-gradient-to-r from-accent to-accent/20 shadow-[0_0_10px_rgb(61_255_143/0.6)] md:block"
            variants={{ idle: { scaleX: 0 }, run: { scaleX: 1, transition: { duration: 2.2, ease: [0.16, 1, 0.3, 1] } } }}
          />

          {processStages.map((s, i) => (
            <li key={s.key} className="relative pl-16 md:pr-7 md:pl-0">
              <m.div
                className="absolute top-0 left-0 z-10 grid size-[43px] place-items-center rounded-full border bg-bg font-mono text-[13px] md:relative"
                variants={{
                  idle: { borderColor: "rgba(120,255,180,0.15)", color: "#8d9d94", boxShadow: "0 0 0 0 rgba(61,255,143,0)" },
                  run: {
                    borderColor: "#3dff8f",
                    color: "#3dff8f",
                    boxShadow: "0 0 20px -4px rgba(61,255,143,0.5)",
                    transition: { delay: 0.2 + i * STAGE_DELAY, duration: 0.4 },
                  },
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </m.div>
              <p className="mt-2.5 mb-1.5 font-mono text-xs text-dim md:mt-6">stage(&apos;{s.key}&apos;)</p>
              <h3 className="mb-2 font-mono text-lg font-semibold tracking-[-0.03em]">{s.title}</h3>
              <p className="text-[0.95rem] text-muted">{s.body}</p>
              <m.p
                className="mt-3.5 font-mono text-[11.5px] text-accent"
                variants={{ idle: { opacity: 0, y: 4 }, run: { opacity: 1, y: 0, transition: { delay: 0.35 + i * STAGE_DELAY } } }}
              >
                ✓ {s.status}
              </m.p>
            </li>
          ))}
        </m.ol>
      </div>
    </section>
  );
}

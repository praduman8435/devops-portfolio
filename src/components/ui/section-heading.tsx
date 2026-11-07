import { cn } from "@/lib/cn";
import { Reveal } from "./reveal";
import { ScrambleText } from "./scramble-text";

interface SectionHeadingProps {
  index: string;
  label: string;
  title: string;
  description?: React.ReactNode;
  className?: string;
}

export function SectionHeading({ index, label, title, description, className }: SectionHeadingProps) {
  return (
    <header className={cn("mb-10 max-w-3xl sm:mb-14", className)}>
      <Reveal>
        <p className="mb-4 font-mono text-[13px] text-accent">
          <span className="text-dim">{"//"}</span> {index} — {label}
        </p>
      </Reveal>
      <ScrambleText
        text={title}
        className="font-mono text-[clamp(1.9rem,3.8vw,2.9rem)] leading-[1.1] font-bold tracking-[-0.045em] text-balance"
      />
      {description && (
        <Reveal delay={1}>
          <p className="mt-5 max-w-[62ch] text-[1.05rem] leading-relaxed text-muted">{description}</p>
        </Reveal>
      )}
    </header>
  );
}

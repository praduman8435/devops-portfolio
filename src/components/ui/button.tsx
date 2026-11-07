import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost";
type Size = "md" | "sm";

const base =
  "group inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-md border font-mono font-semibold tracking-[-0.01em] transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-out focus-visible:outline-2 disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "border-transparent bg-accent text-accent-ink hover:-translate-y-px hover:shadow-[0_0_0_1px_rgb(61_255_143/0.5),0_8px_36px_-6px_rgb(61_255_143/0.55)]",
  ghost: "border-line-2 bg-white/[0.02] text-fg hover:border-accent/55 hover:text-accent",
};

const sizes: Record<Size, string> = {
  md: "h-12 px-5 text-sm",
  sm: "h-9 px-3.5 text-[13px]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string): string {
  return cn(base, variants[variant], sizes[size], className);
}

/** Animated trailing arrow for CTAs. */
export function CtaArrow() {
  return (
    <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
      →
    </span>
  );
}

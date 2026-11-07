"use client";

import { AnimatePresence, m } from "motion/react";
import { useEffect, useState, useSyncExternalStore } from "react";

import { sections } from "@/content/site";
import { cn } from "@/lib/cn";
import { buttonClass } from "./ui/button";
import { openCommandPalette } from "@/lib/events";
import { SearchIcon } from "./ui/icons";

const navItems = sections.filter((s) => s.inNav);

/* External-store subscriptions: read browser state without setState-in-effect. */
const subscribeScroll = (cb: () => void) => {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
};
const noopSubscribe = () => () => {};

export function Nav() {
  const scrolled = useSyncExternalStore(subscribeScroll, () => window.scrollY > 12, () => false);
  const modKey = useSyncExternalStore(
    noopSubscribe,
    () => (/Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl"),
    () => "⌘",
  );
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  // Scroll-spy: the section crossing the middle of the viewport is "active".
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Mobile menu: lock scroll, close on Escape or when resizing to desktop.
  useEffect(() => {
    if (!open) return;
    document.body.dataset.lock = "true";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth >= 900 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      delete document.body.dataset.lock;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[100] border-b transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled || open
          ? "border-line bg-bg/85 backdrop-blur-md backdrop-saturate-150 md:bg-bg/75 md:backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="container-page flex h-[68px] items-center gap-4">
        <a href="#top" className="mr-auto font-mono text-[15px] font-bold tracking-[-0.02em]" aria-label="Praduman Prajapati, back to top">
          <span className="text-accent">~/</span>praduman
          <span aria-hidden="true" className="caret" />
        </a>

        <nav aria-label="Primary" className="hidden min-[900px]:block">
          <ul className="flex gap-0.5">
            {navItems.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={active === s.id ? "true" : undefined}
                  className={cn(
                    "block rounded px-3 py-2 font-mono text-[13px] transition-colors hover:bg-accent/5 hover:text-fg",
                    active === s.id ? "text-accent" : "text-muted",
                  )}
                >
                  <span className={active === s.id ? "text-accent" : "text-dim"}>./</span>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          onClick={openCommandPalette}
          className="hidden h-9 items-center gap-2 rounded-md border border-line-2 bg-white/[0.02] px-3 font-mono text-xs text-muted transition-colors hover:border-accent/50 hover:text-fg sm:inline-flex"
          aria-label="Open command palette"
        >
          <SearchIcon className="size-3.5" />
          <kbd suppressHydrationWarning className="text-[11px] text-dim">
            {modKey} K
          </kbd>
        </button>

        <a href="#contact" className={buttonClass("primary", "sm", "hidden min-[900px]:inline-flex")}>
          hire_me()
        </a>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="inline-flex size-10 flex-col items-center justify-center gap-1.5 rounded-md border border-line-2 min-[900px]:hidden"
        >
          <span className={cn("block h-[1.5px] w-4 bg-fg transition-transform duration-300", open && "translate-y-[3.75px] rotate-45")} />
          <span className={cn("block h-[1.5px] w-4 bg-fg transition-transform duration-300", open && "-translate-y-[3.75px] -rotate-45")} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "calc(100dvh - 68px)" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-y-auto border-t border-line min-[900px]:hidden"
          >
            <div className="container-page flex flex-col gap-8 py-6">
              <ul>
                {sections.map((s, i) => (
                  <m.li
                    key={s.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i }}
                  >
                    <a
                      href={`#${s.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline gap-4 border-b border-line py-3.5 font-mono text-2xl font-semibold tracking-[-0.02em]"
                    >
                      <span className="text-xs font-normal text-accent">{s.index}</span>
                      {s.label}
                    </a>
                  </m.li>
                ))}
              </ul>
              <a href="#contact" onClick={() => setOpen(false)} className={buttonClass("primary", "md", "self-start")}>
                start a project →
              </a>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}

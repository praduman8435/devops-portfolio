"use client";

import { useEffect } from "react";

/**
 * One passive pointer listener drives two effects:
 *  - the ambient background glow (--gx / --gy on :root)
 *  - the spotlight inside any element marked [data-spotlight] (--mx / --my)
 * Skipped on touch devices and for reduced-motion users.
 */
export function PointerEffects() {
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const root = document.documentElement;
    let frame = 0;
    let last: PointerEvent | null = null;

    const apply = () => {
      frame = 0;
      if (!last) return;
      const { clientX: x, clientY: y, target } = last;
      root.style.setProperty("--gx", `${x}px`);
      root.style.setProperty("--gy", `${y}px`);
      const card = target instanceof Element ? target.closest<HTMLElement>("[data-spotlight]") : null;
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${x - r.left}px`);
        card.style.setProperty("--my", `${y - r.top}px`);
      }
    };

    const onMove = (e: PointerEvent) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}

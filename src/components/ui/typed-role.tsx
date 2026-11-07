"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { useBooted } from "@/hooks/use-boot";

/** Typewriter that cycles through roles: types, holds, deletes, repeats. */
export function TypedRole({ roles }: { roles: readonly string[] }) {
  const booted = useBooted();
  const reduce = useReducedMotion();
  const first = roles[0] ?? "";
  const [text, setText] = useState(first);

  useEffect(() => {
    if (!booted || reduce || roles.length < 2) return;
    let r = 0;
    let c = first.length;
    let deleting = true;
    let timer = 0;

    const tick = () => {
      const word = roles[r] ?? "";
      if (deleting) {
        c -= 1;
        setText(word.slice(0, c));
        if (c <= 0) {
          deleting = false;
          r = (r + 1) % roles.length;
          timer = window.setTimeout(tick, 320);
          return;
        }
        timer = window.setTimeout(tick, 26);
      } else {
        const next = roles[r] ?? "";
        c += 1;
        setText(next.slice(0, c));
        if (c >= next.length) {
          deleting = true;
          timer = window.setTimeout(tick, 2300);
          return;
        }
        timer = window.setTimeout(tick, 58);
      }
    };

    timer = window.setTimeout(tick, 2600);
    return () => window.clearTimeout(timer);
  }, [booted, reduce, roles, first]);

  return (
    <span aria-label={roles.join(", ")}>
      <span aria-hidden="true" className="text-accent">
        {text}
      </span>
      <span aria-hidden="true" className="caret" />
    </span>
  );
}

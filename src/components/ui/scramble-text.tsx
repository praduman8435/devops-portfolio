"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const GLYPHS = "!<>-_\\/[]{}=+*^?#$%&01";

interface ScrambleTextProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "span" | "p";
  className?: string;
  /** Number of animation frames (~60fps). */
  frames?: number;
}

/**
 * Decrypts text from random glyphs left-to-right when it enters the viewport.
 * Screen readers always get the real text through aria-label.
 */
export function ScrambleText({ text, as: Tag = "h2", className, frames = 28 }: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!inView || reduce) return;
    const chars = Array.from(text);
    let frame = 0;
    let raf = 0;
    const tick = () => {
      const progress = frame / frames;
      setDisplay(
        chars
          .map((ch, i) => (ch === " " || i / chars.length < progress ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
          .join(""),
      );
      if (frame++ < frames) raf = requestAnimationFrame(tick);
      else setDisplay(text);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, text, frames]);

  return (
    <Tag className={className} aria-label={text}>
      <span ref={ref} aria-hidden="true">
        {display}
      </span>
    </Tag>
  );
}

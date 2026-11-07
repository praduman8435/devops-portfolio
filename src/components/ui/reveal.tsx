"use client";

import { m, type HTMLMotionProps } from "motion/react";

interface RevealProps extends HTMLMotionProps<"div"> {
  /** Stagger index; each step adds 80ms of delay. */
  delay?: number;
  y?: number;
}

/** Fades and lifts its children into view once, when scrolled into the viewport. */
export function Reveal({ delay = 0, y = 18, children, ...rest }: RevealProps) {
  return (
    <m.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.75, delay: delay * 0.08, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </m.div>
  );
}

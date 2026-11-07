"use client";

import { domAnimation, LazyMotion, MotionConfig } from "motion/react";

/**
 * Global animation setup.
 * - LazyMotion + domAnimation ships only the features we use (animations, variants, exit,
 *   gestures, in-view) instead of the full bundle. `strict` makes any full `motion.*`
 *   import fail loudly in development.
 * - reducedMotion="user" disables transform animations for visitors who opt out.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={{ ease: [0.16, 1, 0.3, 1] }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}

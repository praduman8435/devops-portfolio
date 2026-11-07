"use client";

import { MotionConfig } from "motion/react";

/** Global animation defaults. `reducedMotion="user"` disables transform animations for users who opt out. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </MotionConfig>
  );
}

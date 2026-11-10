"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

import type { RadarApp } from "./radar-app";

/**
 * The radar UI is client-only: its settings and marks live in localStorage, so rendering on the
 * server would only produce a hydration mismatch. It's private, so there's nothing to lose for SEO.
 */
const LazyRadarApp = dynamic(() => import("./radar-app").then((m) => m.RadarApp), {
  ssr: false,
  loading: () => (
    <main className="container-page py-24 font-mono text-sm text-dim" aria-busy="true">
      <span className="text-accent">~/</span>radar · loading…
    </main>
  ),
});

export function RadarAppLoader(props: ComponentProps<typeof RadarApp>) {
  return <LazyRadarApp {...props} />;
}

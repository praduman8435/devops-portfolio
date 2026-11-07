"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { PALETTE_EVENT } from "@/lib/events";

const loadPalette = () => import("./command-palette");
const CommandPalette = dynamic(() => loadPalette().then((mod) => mod.CommandPalette), { ssr: false });

/**
 * Keeps the command palette out of the initial JavaScript. It listens for ⌘K / Ctrl+K or the
 * nav button, then mounts the real palette already open. The chunk is prefetched while the
 * browser is idle, so the first open still feels instant.
 */
export function CommandPaletteLoader() {
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    if (requested) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setRequested(true);
      }
    };
    const onOpen = () => setRequested(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(PALETTE_EVENT, onOpen);

    // Prefetch the chunk when the main thread is idle (Safari lacks requestIdleCallback).
    const prefetch = () => void loadPalette();
    const hasIdle = typeof window.requestIdleCallback === "function";
    const idleId = hasIdle ? window.requestIdleCallback(prefetch, { timeout: 4000 }) : setTimeout(prefetch, 2500);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(PALETTE_EVENT, onOpen);
      if (hasIdle) window.cancelIdleCallback(idleId as number);
      else clearTimeout(idleId);
    };
  }, [requested]);

  return requested ? <CommandPalette defaultOpen /> : null;
}

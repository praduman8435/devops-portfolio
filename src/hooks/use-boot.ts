"use client";

import { useSyncExternalStore } from "react";

/**
 * Boot-sequence state lives on <html data-boot="pending|done">.
 * An inline script in the layout sets it before first paint, so there's no flash.
 */
export const BOOT_EVENT = "pp:booted";

function subscribe(onChange: () => void): () => void {
  window.addEventListener(BOOT_EVENT, onChange);
  return () => window.removeEventListener(BOOT_EVENT, onChange);
}

const getSnapshot = () => document.documentElement.dataset.boot !== "pending";
const getServerSnapshot = () => false;

/** True once the boot screen has finished (or was skipped). */
export function useBooted(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function markBooted(): void {
  document.documentElement.dataset.boot = "done";
  window.dispatchEvent(new Event(BOOT_EVENT));
}

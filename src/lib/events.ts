/**
 * Cross-component events. Kept in a tiny module so importing them never pulls
 * heavier UI (like the command palette) into the initial bundle.
 */
export const PALETTE_EVENT = "pp:palette";
export const TERMINAL_FOCUS_EVENT = "pp:terminal-focus";

/** Opens the ⌘K palette from anywhere (e.g. the nav button). */
export const openCommandPalette = (): void => {
  window.dispatchEvent(new Event(PALETTE_EVENT));
};

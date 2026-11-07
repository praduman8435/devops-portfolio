/**
 * Minimal, dependency-free toast bus. Any client component can call `toast()`;
 * the single <Toaster /> mounted in the layout renders it.
 */
export const TOAST_EVENT = "pp:toast";

export function toast(message: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<string>(TOAST_EVENT, { detail: message }));
}

import type { Budget, Engagement } from "./types";

/** Compact money: $950, $1.5k, $12k, ₹40k. Falls back to the ISO code when Intl doesn't know the currency. */
export function formatMoney(value: number, currency = "USD"): string {
  const compact = value >= 1_000;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: compact ? "compact" : "standard",
      maximumFractionDigits: compact ? 1 : 0,
    }).format(value);
  } catch {
    return `${currency} ${Math.round(value).toLocaleString("en-US")}`;
  }
}

export function formatBudget(b: Budget): string {
  if (b.label) return b.label;
  const range = (suffix: string) => {
    const cur = b.currency ?? "USD";
    if (b.min && b.max && b.max !== b.min) return `${formatMoney(b.min, cur)}–${formatMoney(b.max, cur)}${suffix}`;
    const v = b.min ?? b.max;
    return v ? `${formatMoney(v, cur)}${suffix}` : "";
  };
  switch (b.kind) {
    case "fixed":
      return range(" fixed") || "fixed price";
    case "hourly":
      return range("/hr") || "hourly";
    case "salary":
      return range("/yr") || "salary n/a";
    default:
      return "budget n/a";
  }
}

/** "just now", "14m ago", "3h ago", "2d ago" */
export function formatAgo(iso: string, now: number = Date.now()): string {
  const mins = Math.max(0, Math.round((now - Date.parse(iso)) / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export const ENGAGEMENT_LABEL: Record<Engagement, string> = {
  freelance: "freelance",
  contract: "contract",
  "part-time": "part-time",
  "full-time": "full-time",
  unknown: "type n/a",
};

export function formatBids(bids: number | null): string {
  if (bids === null) return "bids n/a";
  return `${bids} ${bids === 1 ? "proposal" : "proposals"}`;
}

"use client";

import { useEffect, useState } from "react";

/** Live HH:MM in the given IANA time zone. Renders a placeholder on the server to avoid hydration mismatch. */
export function LocalClock({ timeZone }: { timeZone: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hour12: false });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [timeZone]);

  return <time suppressHydrationWarning>{time ?? "--:--"}</time>;
}

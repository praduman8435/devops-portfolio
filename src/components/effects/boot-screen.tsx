"use client";

import { useEffect, useState } from "react";
import { markBooted, useBooted } from "@/hooks/use-boot";

interface BootLine {
  ts: string;
  text: string;
  status?: string;
  tone?: "ok" | "cyan";
}

const LINES: BootLine[] = [
  { ts: "0.0000", text: "pp-kernel 3.0-devops booting on", status: "praduman.cloud", tone: "cyan" },
  { ts: "0.0912", text: "mounting /dev/infrastructure .............", status: "ok" },
  { ts: "0.1804", text: "loading modules: aws k8s terraform argocd ..", status: "ok" },
  { ts: "0.2610", text: "trivy scan: 0 critical, 0 high .............", status: "pass" },
  { ts: "0.3377", text: "rbac: least-privilege policy applied .......", status: "ok" },
  { ts: "0.4021", text: "starting portfolio.service .................", status: "active" },
  { ts: "0.4500", text: "welcome, guest. access granted.", tone: "cyan" },
];

type Phase = "running" | "leaving" | "gone";

/**
 * A short, skippable kernel-style boot log, shown once per session.
 * Whether it runs is decided by the inline script in the layout (html[data-boot]).
 * While running, CSS keeps the overlay visible; while leaving, an inline style holds it for the fade.
 */
export function BootScreen() {
  const booted = useBooted();
  const [phase, setPhase] = useState<Phase>("running");
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (document.documentElement.dataset.boot !== "pending") return;
    try {
      sessionStorage.setItem("pp-booted", "1");
    } catch {
      /* storage unavailable: the boot simply plays again next time */
    }

    const timers: number[] = [];
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout);
      setPhase("leaving");
      markBooted();
      timers.push(window.setTimeout(() => setPhase("gone"), 520));
      window.removeEventListener("keydown", finish);
      window.removeEventListener("pointerdown", finish);
    };

    let elapsed = 120;
    LINES.forEach((_, i) => {
      elapsed += 85 + Math.random() * 85;
      timers.push(window.setTimeout(() => setShown(i + 1), elapsed));
    });
    timers.push(window.setTimeout(finish, elapsed + 420));

    window.addEventListener("keydown", finish);
    window.addEventListener("pointerdown", finish);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", finish);
      window.removeEventListener("pointerdown", finish);
    };
  }, []);

  // Already booted (repeat visit / reduced motion) and not mid-fade: render nothing.
  if (phase === "gone" || (booted && phase === "running")) return null;

  return (
    <div
      aria-hidden="true"
      className="boot-overlay fixed inset-0 z-[300] items-center justify-center bg-bg px-4 font-mono text-[13px] leading-[1.8] text-muted transition-[opacity,visibility] duration-500 data-[phase=leaving]:invisible data-[phase=leaving]:opacity-0"
      data-phase={phase}
      style={phase === "leaving" ? { display: "flex" } : undefined}
    >
      <div className="w-full max-w-[640px]">
        <div className="min-h-[13em]">
          {LINES.slice(0, shown).map((l) => (
            <div key={l.ts} className="whitespace-pre-wrap">
              <span className="text-dim">[{l.ts.padStart(7, " ")}]</span> {l.text}{" "}
              {l.status && <span className={l.tone === "cyan" ? "text-cyan" : "text-accent"}>{l.status}</span>}
            </div>
          ))}
        </div>
        <div className="mt-5 h-0.5 overflow-hidden bg-line-2">
          <div
            className="h-full origin-left bg-accent shadow-[0_0_12px_var(--color-accent)] transition-transform duration-150"
            style={{ transform: `scaleX(${shown / LINES.length})` }}
          />
        </div>
      </div>
      <span className="absolute right-6 bottom-6 text-[11px] text-dim">press any key to skip</span>
    </div>
  );
}

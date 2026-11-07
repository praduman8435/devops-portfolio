"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hub: boolean;
}

interface Packet {
  from: number;
  to: number;
  t: number;
  speed: number;
}

const LINK_DIST = 140;
const MOUSE_DIST = 170;
const ACCENT = "61, 255, 143";
const CYAN = "90, 216, 255";

/**
 * A slow-drifting "cluster topology": nodes, links and data packets travelling between them.
 * Pauses off-screen and in background tabs, and draws one static frame for reduced motion.
 */
export function NetworkCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Phones and tablets: fewer pixels, fewer nodes, 30fps. That saves battery while staying smooth.
    const lowPower = window.matchMedia("(pointer: coarse)").matches || (navigator.hardwareConcurrency ?? 8) <= 4;
    const frameInterval = lowPower ? 1000 / 30 : 0;
    let lastFrame = 0;
    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let packets: Packet[] = [];
    let raf = 0;
    let visible = true;
    const mouse = { x: -9999, y: -9999 };

    const neighbours = (i: number): number[] => {
      const a = nodes[i];
      if (!a) return [];
      const out: number[] = [];
      nodes.forEach((b, j) => {
        if (j !== i && Math.hypot(a.x - b.x, a.y - b.y) < LINK_DIST) out.push(j);
      });
      return out;
    };

    const spawnPacket = (): Packet | null => {
      for (let attempt = 0; attempt < 8; attempt++) {
        const from = (Math.random() * nodes.length) | 0;
        const n = neighbours(from);
        const to = n[(Math.random() * n.length) | 0];
        if (to !== undefined) return { from, to, t: 0, speed: 0.008 + Math.random() * 0.01 };
      }
      return null;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(lowPower ? 1.5 : 2, window.devicePixelRatio || 1);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round(Math.min(lowPower ? 38 : 85, Math.max(24, (width * height) / 15000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 1 + Math.random() * 1.3,
        hub: Math.random() < 0.12,
      }));
      packets = Array.from({ length: 7 }, spawnPacket).filter((p): p is Packet => p !== null);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Links
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]!;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]!;
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK_DIST) {
            ctx.strokeStyle = `rgba(${ACCENT}, ${(1 - d / LINK_DIST) * 0.16})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        // Mouse links
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (dm < MOUSE_DIST) {
          ctx.strokeStyle = `rgba(${ACCENT}, ${(1 - dm / MOUSE_DIST) * 0.4})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      // Packets travelling along links
      for (const p of packets) {
        const a = nodes[p.from];
        const b = nodes[p.to];
        if (!a || !b) continue;
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        // Cheap glow: a soft halo plus a bright core (shadowBlur is very expensive per frame).
        ctx.fillStyle = `rgba(${CYAN}, 0.18)`;
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${CYAN}, 0.95)`;
        ctx.beginPath();
        ctx.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Nodes
      for (const n of nodes) {
        ctx.fillStyle = n.hub ? `rgba(${CYAN}, 0.75)` : `rgba(${ACCENT}, 0.55)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.hub ? n.r + 1.1 : n.r, 0, Math.PI * 2);
        ctx.fill();
        if (n.hub) {
          ctx.strokeStyle = `rgba(${CYAN}, 0.22)`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 5, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    };

    const step = () => {
      for (const n of nodes) {
        // Gentle attraction towards the cursor
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const d = Math.hypot(dx, dy);
        if (d < MOUSE_DIST && d > 1) {
          n.vx += (dx / d) * 0.006;
          n.vy += (dy / d) * 0.006;
        }
        n.vx = Math.max(-0.4, Math.min(0.4, n.vx * 0.995));
        n.vy = Math.max(-0.4, Math.min(0.4, n.vy * 0.995));
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
        n.x = Math.max(0, Math.min(width, n.x));
        n.y = Math.max(0, Math.min(height, n.y));
      }
      packets = packets.map((p) => {
        p.t += p.speed;
        const a = nodes[p.from];
        const b = nodes[p.to];
        const broken = !a || !b || Math.hypot(a.x - b.x, a.y - b.y) > LINK_DIST * 1.15;
        if (p.t >= 1 || broken) {
          const next = neighbours(p.to);
          const to = next[(Math.random() * next.length) | 0];
          return to !== undefined && !broken ? { from: p.to, to, t: 0, speed: p.speed } : (spawnPacket() ?? p);
        }
        return p;
      });
    };

    const loop = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      step(); // physics every frame keeps motion speed constant…
      if (now - lastFrame >= frameInterval) {
        lastFrame = now; // …but low-power devices only repaint at ~30fps
        draw();
      }
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf && !reduce) raf = requestAnimationFrame(loop);
    };

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    resize();
    draw();
    start();

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) start();
    });
    io.observe(canvas);
    const onVisibility = () => {
      if (!document.hidden) start();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={cn("pointer-events-none block size-full", className)} />;
}

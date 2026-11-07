"use client";

import { AnimatePresence, m } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { TOAST_EVENT } from "@/lib/toast";

export function Toaster() {
  const [message, setMessage] = useState<{ id: number; text: string } | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const onToast = (e: Event) => {
      const text = (e as CustomEvent<string>).detail;
      setMessage({ id: Date.now(), text });
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setMessage(null), 2400);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => {
      window.removeEventListener(TOAST_EVENT, onToast);
      window.clearTimeout(timer.current);
    };
  }, []);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[250] flex justify-center px-4">
      <AnimatePresence>
        {message && (
          <m.div
            key={message.id}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
            className="rounded-md border border-accent/40 bg-panel-2 px-4 py-2.5 font-mono text-[13px] text-fg shadow-[0_10px_40px_-10px_rgb(0_0_0/0.8)]"
          >
            {message.text}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

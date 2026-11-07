"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useBooted } from "@/hooks/use-boot";
import { TERMINAL_FOCUS_EVENT } from "@/components/ui/command-palette";
import { cn } from "@/lib/cn";
import {
  autoplayScript,
  commands,
  completions,
  Dim,
  isPre,
  Muted,
  notFound,
  Ok,
  Prompt,
  type Output,
} from "./commands";

interface Line {
  id: number;
  node: React.ReactNode;
  pre: boolean;
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const CHIPS = ["help", "services", "products", "sudo hire-me"] as const;

/**
 * A small, real shell: command registry, history (↑/↓), tab completion, Ctrl+L,
 * and an autoplay demo that stops the moment the visitor interacts.
 */
export function Terminal() {
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const booted = useBooted();

  const nextId = useRef(0);
  const history = useRef<string[]>([]);
  const cursor = useRef(0);
  const takenOver = useRef(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const print = useCallback((out: Output) => {
    setLines((prev) => [
      ...prev,
      ...out.map((l) => ({ id: nextId.current++, node: isPre(l) ? l.pre : l, pre: isPre(l) })),
    ]);
  }, []);

  const exec = useCallback(
    (raw: string) => {
      const cmd = raw.trim();
      print([
        <>
          <Prompt /> {cmd}
        </>,
      ]);
      if (!cmd) return;

      history.current.push(cmd);
      cursor.current = history.current.length;

      const [name = "", ...args] = cmd.split(/\s+/);
      const key = name.toLowerCase();
      if (key === "clear" || key === "cls") {
        setLines([]);
        return;
      }
      const fn = Object.prototype.hasOwnProperty.call(commands, key) ? commands[key] : undefined;
      const out = fn ? fn({ args, history: history.current, print }) : notFound(name);
      if (out?.length) print(out);
    },
    [print],
  );

  const takeOver = useCallback(() => {
    if (takenOver.current) return;
    takenOver.current = true;
    setInput("");
  }, []);

  // Keep the newest output in view (inside the terminal only, never the page).
  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [lines]);

  // Autoplay demo after the boot sequence.
  useEffect(() => {
    if (!booted) return;
    let cancelled = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stopped = () => cancelled || takenOver.current;

    (async () => {
      await wait(reduce ? 0 : 450);
      if (cancelled) return;
      print([<Dim key="login">last login: {new Date().toDateString()} on ttys001</Dim>]);

      for (const cmd of autoplayScript) {
        if (stopped()) return;
        if (!reduce) {
          for (const ch of cmd) {
            if (stopped()) return;
            setInput((v) => v + ch);
            await wait(38 + Math.random() * 48);
          }
          await wait(260);
          if (stopped()) return;
          setInput("");
        }
        exec(cmd);
        await wait(reduce ? 0 : 900);
      }
      if (cancelled) return;
      print([
        <>
          <Muted>↳ your turn. type </Muted>
          <Ok>help</Ok>
          <Muted>, or try </Muted>
          <Ok>sudo hire-me</Ok>
        </>,
      ]);
    })();

    return () => {
      cancelled = true;
    };
  }, [booted, exec, print]);

  // "/" anywhere, or the command palette, focuses the terminal.
  useEffect(() => {
    const focusTerminal = () => {
      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      inputRef.current?.focus({ preventScroll: true });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      e.preventDefault();
      focusTerminal();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(TERMINAL_FOCUS_EVENT, focusTerminal);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(TERMINAL_FOCUS_EVENT, focusTerminal);
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const h = history.current;
    if (e.key === "ArrowUp") {
      if (!h.length) return;
      e.preventDefault();
      cursor.current = Math.max(0, cursor.current - 1);
      setInput(h[cursor.current] ?? "");
    } else if (e.key === "ArrowDown") {
      if (!h.length) return;
      e.preventDefault();
      cursor.current = Math.min(h.length, cursor.current + 1);
      setInput(h[cursor.current] ?? "");
    } else if (e.key === "Tab") {
      const v = input.trimStart().toLowerCase();
      if (!v) return; // empty input: let Tab move focus normally
      const matches = completions.filter((c) => c.startsWith(v));
      if (!matches.length) return;
      e.preventDefault();
      if (matches.length === 1) setInput(matches[0] ?? v);
      else
        print([
          <>
            <Prompt /> {input}
          </>,
          <Muted key="m">{matches.join("   ")}</Muted>,
        ]);
    } else if (e.key.toLowerCase() === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div ref={rootRef}>
      <div className="relative overflow-hidden rounded-xl border border-line-2 bg-[linear-gradient(180deg,rgb(15_20_18/0.94),rgb(8_11_10/0.94))] shadow-[0_40px_90px_-40px_rgb(0_0_0/0.9),0_0_90px_-30px_rgb(61_255_143/0.22)] backdrop-blur-sm">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_60%_at_50%_0%,rgb(61_255_143/0.05),transparent_60%)]" />

        {/* Window chrome */}
        <div className="relative flex h-10 items-center gap-3 border-b border-line bg-white/[0.015] px-3.5 font-mono text-xs text-dim">
          <span aria-hidden="true" className="flex gap-[7px]">
            <i className="size-[11px] rounded-full bg-[#ff5f57]/85" />
            <i className="size-[11px] rounded-full bg-[#febc2e]/85" />
            <i className="size-[11px] rounded-full bg-[#28c840]/85" />
          </span>
          <span className="hidden flex-1 truncate text-center sm:block">guest@praduman: ~ — zsh</span>
          <span className="ml-auto rounded-full border border-accent/30 px-2 py-px text-[10.5px] text-accent sm:ml-0">interactive</span>
        </div>

        {/* Body */}
        <div
          ref={bodyRef}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) return;
            if (window.getSelection()?.toString()) return;
            inputRef.current?.focus({ preventScroll: true });
          }}
          className="scroll-thin relative h-[330px] cursor-text overflow-auto px-4 pt-4 pb-5 font-mono text-[12px] leading-[1.7] sm:h-[400px] sm:px-[18px] sm:text-[13px]"
        >
          <div role="log" aria-live="polite" aria-label="Terminal output">
            {lines.map((l) => (
              <div key={l.id} className={cn("min-h-[1.7em]", l.pre ? "whitespace-pre" : "break-words whitespace-pre-wrap")}>
                {l.node}
              </div>
            ))}
          </div>
          <form
            className="flex items-center gap-2"
            autoComplete="off"
            onSubmit={(e) => {
              e.preventDefault();
              takeOver();
              const v = input;
              setInput("");
              exec(v);
            }}
          >
            <label htmlFor="term-input" className="shrink-0">
              <Prompt />
            </label>
            <input
              id="term-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={takeOver}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              enterKeyHint="send"
              aria-label="Type a terminal command, for example help"
              className="min-w-0 flex-1 bg-transparent p-0 text-fg caret-accent outline-none pointer-coarse:text-base"
            />
          </form>
        </div>
      </div>

      {/* Quick commands for touch users */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2 font-mono text-xs text-dim">
        <span>try:</span>
        {CHIPS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              takeOver();
              exec(c);
            }}
            className={cn(
              "cursor-pointer rounded border px-2.5 py-1 transition-colors",
              c === "sudo hire-me"
                ? "border-accent/35 bg-accent/5 text-accent hover:border-accent/70"
                : "border-line-2 bg-white/[0.02] text-muted hover:border-accent/50 hover:text-accent",
            )}
          >
            {c}
          </button>
        ))}
        <span className="ml-auto hidden pointer-fine:inline">
          press <kbd className="rounded border border-b-2 border-line-2 px-1.5 text-[11px] text-muted">/</kbd> to focus
        </span>
      </div>
    </div>
  );
}

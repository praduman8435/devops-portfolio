"use client";

import { AnimatePresence, m } from "motion/react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { sections, site } from "@/content/site";
import { copyToClipboard } from "@/lib/clipboard";
import { defaultMailto } from "@/lib/mailto";
import { scrollToId } from "@/lib/scroll";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/cn";
import { PALETTE_EVENT, TERMINAL_FOCUS_EVENT } from "@/lib/events";
import {
  CopyIcon,
  GitHubIcon,
  HashIcon,
  HashnodeIcon,
  LinkedInIcon,
  MailIcon,
  SearchIcon,
  TerminalIcon,
  XIcon,
} from "./icons";

interface Command {
  id: string;
  group: "Navigate" | "Actions" | "Elsewhere";
  label: string;
  hint?: string;
  keywords?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  run: () => void;
}

const openExternal = (href: string) => window.open(href, "_blank", "noopener,noreferrer");

function useCommands(): Command[] {
  return useMemo<Command[]>(
    () => [
      ...sections.map<Command>((s) => ({
        id: `go-${s.id}`,
        group: "Navigate",
        label: `Go to ${s.label}`,
        hint: s.index,
        keywords: s.id,
        icon: HashIcon,
        run: () => scrollToId(s.id),
      })),
      {
        id: "email",
        group: "Actions",
        label: "Email me about a project",
        hint: "mailto",
        keywords: "hire contact work freelance",
        icon: MailIcon,
        run: () => {
          window.location.href = defaultMailto;
        },
      },
      {
        id: "copy-email",
        group: "Actions",
        label: "Copy email address",
        hint: site.email,
        keywords: "clipboard contact",
        icon: CopyIcon,
        run: async () => {
          const ok = await copyToClipboard(site.email);
          toast(ok ? `✓ copied ${site.email}` : "Copy failed. Select the address manually.");
        },
      },
      {
        id: "terminal",
        group: "Actions",
        label: "Open the interactive terminal",
        hint: "/",
        keywords: "shell cli console",
        icon: TerminalIcon,
        run: () => window.dispatchEvent(new Event(TERMINAL_FOCUS_EVENT)),
      },
      { id: "github", group: "Elsewhere", label: "GitHub", hint: site.handles.github, icon: GitHubIcon, run: () => openExternal(site.links.github) },
      { id: "linkedin", group: "Elsewhere", label: "LinkedIn", hint: site.handles.linkedin, icon: LinkedInIcon, run: () => openExternal(site.links.linkedin) },
      { id: "x", group: "Elsewhere", label: "X / Twitter", hint: site.handles.x, keywords: "twitter", icon: XIcon, run: () => openExternal(site.links.x) },
      { id: "blog", group: "Elsewhere", label: "Hashnode blog", hint: site.handles.blog, keywords: "articles writing", icon: HashnodeIcon, run: () => openExternal(site.links.blog) },
      ...(site.sourceIsPublic
        ? [{ id: "source", group: "Elsewhere", label: "View this site's source", hint: "github", keywords: "code repo next.js", icon: GitHubIcon, run: () => openExternal(site.links.source) } satisfies Command]
        : []),
    ],
    [],
  );
}

/**
 * ⌘K / Ctrl+K command palette. It's a keyboard-first way around the site, implemented as an
 * accessible combobox + listbox inside a modal dialog.
 */
export function CommandPalette({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  // Lazily mounted already-open: remember what had focus so closing can hand it back.
  const restoreFocus = useRef<HTMLElement | null>(
    defaultOpen && typeof document !== "undefined" ? (document.activeElement as HTMLElement | null) : null,
  );
  const listId = useId();
  const commands = useCommands();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => `${c.label} ${c.keywords ?? ""} ${c.hint ?? ""}`.toLowerCase().includes(q));
  }, [commands, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
    restoreFocus.current?.focus?.();
  }, []);

  const show = useCallback(() => {
    restoreFocus.current = document.activeElement as HTMLElement | null;
    setOpen(true);
  }, []);

  // Global shortcuts and the open event.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) close();
        else show();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(PALETTE_EVENT, show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(PALETTE_EVENT, show);
    };
  }, [open, close, show]);

  // Lock page scroll while open.
  useEffect(() => {
    if (!open) return;
    document.body.dataset.lock = "true";
    const t = window.setTimeout(() => inputRef.current?.focus(), 10);
    return () => {
      delete document.body.dataset.lock;
      window.clearTimeout(t);
    };
  }, [open]);

  // Keep the active option in view.
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const runCommand = (cmd: Command | undefined) => {
    if (!cmd) return;
    close();
    // Let the dialog unmount before scrolling or focusing elsewhere.
    window.setTimeout(cmd.run, 30);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => (results.length ? (i + 1) % results.length : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
        break;
      case "Enter":
        e.preventDefault();
        runCommand(results[active]);
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
      case "Tab":
        e.preventDefault(); // keep focus inside the dialog
        break;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <m.div
          className="fixed inset-0 z-[220] flex items-start justify-center bg-black/60 px-4 pt-[14vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <m.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="w-full max-w-[580px] overflow-hidden rounded-xl border border-line-2 bg-panel/95 shadow-[0_40px_120px_-30px_rgb(0_0_0/0.9),0_0_80px_-30px_rgb(61_255_143/0.25)]"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <SearchIcon className="size-4 shrink-0 text-dim" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={results[active] ? `${listId}-${results[active].id}` : undefined}
                aria-autocomplete="list"
                placeholder="Type a command or search…"
                className="h-14 w-full bg-transparent font-mono text-sm text-fg outline-none placeholder:text-dim"
                spellCheck={false}
              />
              <kbd className="rounded border border-line-2 px-1.5 py-0.5 font-mono text-[10px] text-dim">esc</kbd>
            </div>

            <ul ref={listRef} id={listId} role="listbox" className="scroll-thin max-h-[min(420px,60vh)] overflow-y-auto p-2">
              {results.length === 0 && (
                <li className="px-3 py-8 text-center font-mono text-sm text-dim">no results for &quot;{query}&quot;</li>
              )}
              {results.map((cmd, i) => {
                const header = i === 0 || results[i - 1]?.group !== cmd.group ? cmd.group : null;
                const Icon = cmd.icon;
                return (
                  <li key={cmd.id} role="presentation">
                    {header && (
                      <p className="px-3 pt-3 pb-1.5 font-mono text-[11px] tracking-wide text-dim uppercase">{header}</p>
                    )}
                    <div
                      id={`${listId}-${cmd.id}`}
                      role="option"
                      aria-selected={i === active}
                      data-index={i}
                      onMouseMove={() => setActive(i)}
                      onClick={() => runCommand(cmd)}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                        i === active ? "bg-accent/10 text-fg" : "text-muted",
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0", i === active ? "text-accent" : "text-dim")} />
                      <span className="flex-1 truncate">{cmd.label}</span>
                      {cmd.hint && <span className="truncate font-mono text-[11px] text-dim">{cmd.hint}</span>}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 font-mono text-[11px] text-dim">
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span className="ml-auto">⌘K toggle</span>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

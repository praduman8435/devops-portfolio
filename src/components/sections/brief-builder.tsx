"use client";

import { useId, useMemo, useState } from "react";

import { services } from "@/content/services";
import { site } from "@/content/site";
import { copyToClipboard } from "@/lib/clipboard";
import { buildMailto } from "@/lib/mailto";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/cn";
import { buttonClass, CtaArrow } from "@/components/ui/button";
import { CopyIcon, MailIcon } from "@/components/ui/icons";

const NEEDS = [...services.map((s) => s.title), "Full-stack product", "Something else"];
const TIMELINES = ["ASAP", "Within a month", "1–3 months", "Flexible"];
const BUDGETS = ["< $1k", "$1k – $5k", "$5k – $15k", "$15k+", "Not sure yet"];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-md border px-3 py-1.5 font-mono text-[12.5px] transition-colors",
        active
          ? "border-accent/60 bg-accent/10 text-accent"
          : "border-line-2 bg-white/[0.02] text-muted hover:border-accent/40 hover:text-fg",
      )}
    >
      {active && <span aria-hidden="true">✓ </span>}
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2.5 font-mono text-xs text-dim"># {label}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

const inputClass =
  "w-full rounded-md border border-line-2 bg-bg/70 px-3.5 py-2.5 font-mono text-[13px] text-fg outline-none transition-colors placeholder:text-dim focus:border-accent/60";

/**
 * Lets a client describe their project in about 20 seconds, then hands off to their own mail client.
 * There's no backend and nothing is stored: the brief only leaves the browser when they press send.
 */
export function BriefBuilder() {
  const [needs, setNeeds] = useState<string[]>([]);
  const [timeline, setTimeline] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [details, setDetails] = useState("");
  const ids = { name: useId(), company: useId(), details: useId() };

  const toggleNeed = (n: string) => setNeeds((cur) => (cur.includes(n) ? cur.filter((x) => x !== n) : [...cur, n]));

  const brief = useMemo(() => {
    const from = [name.trim(), company.trim() && `@ ${company.trim()}`].filter(Boolean).join(" ") || "—";
    return [
      "# project brief",
      `from:     ${from}`,
      `need:     ${needs.length ? needs.join(", ") : "—"}`,
      `timeline: ${timeline ?? "—"}`,
      `budget:   ${budget ?? "—"}`,
      "",
      "details:",
      details.trim() || "—",
    ].join("\n");
  }, [name, company, needs, timeline, budget, details]);

  const mailto = useMemo(
    () =>
      buildMailto({
        subject: `Project inquiry: ${needs[0] ?? "DevOps"}${company.trim() ? ` (${company.trim()})` : ""}`,
        body: `Hi Praduman,\n\n${brief}\n\nThanks!`,
      }),
    [brief, needs, company],
  );

  const copyBrief = async () => {
    const ok = await copyToClipboard(`${brief}\n\n→ ${site.email}`);
    toast(ok ? "✓ brief copied to clipboard" : "Copy failed. Select the text manually.");
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10">
      <form className="space-y-7" onSubmit={(e) => e.preventDefault()} aria-label="Project brief">
        <Field label="what do you need? (pick any)">
          {NEEDS.map((n) => (
            <Chip key={n} active={needs.includes(n)} onClick={() => toggleNeed(n)}>
              {n}
            </Chip>
          ))}
        </Field>
        <Field label="timeline">
          {TIMELINES.map((t) => (
            <Chip key={t} active={timeline === t} onClick={() => setTimeline((cur) => (cur === t ? null : t))}>
              {t}
            </Chip>
          ))}
        </Field>
        <Field label="budget (USD)">
          {BUDGETS.map((b) => (
            <Chip key={b} active={budget === b} onClick={() => setBudget((cur) => (cur === b ? null : b))}>
              {b}
            </Chip>
          ))}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={ids.name} className="mb-2 block font-mono text-xs text-dim">
              # your name
            </label>
            <input id={ids.name} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" autoComplete="name" className={inputClass} />
          </div>
          <div>
            <label htmlFor={ids.company} className="mb-2 block font-mono text-xs text-dim">
              # company
            </label>
            <input id={ids.company} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Inc." autoComplete="organization" className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor={ids.details} className="mb-2 block font-mono text-xs text-dim">
            # current stack &amp; what&apos;s hurting
          </label>
          <textarea
            id={ids.details}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            placeholder="e.g. Node.js API on EC2, manual deploys over SSH, want CI/CD + EKS…"
            className={cn(inputClass, "resize-y")}
          />
        </div>
      </form>

      <div className="flex flex-col">
        <div className="flex-1 overflow-hidden rounded-lg border border-line-2 bg-[#070a09]">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5 font-mono text-xs">
            <span className="text-muted">brief.md</span>
            <span className="text-dim">live preview</span>
          </div>
          <pre aria-live="polite" className="min-h-[220px] overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-[1.8] break-words whitespace-pre-wrap text-fg">
            {brief}
          </pre>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href={mailto} className={buttonClass("primary", "md", "flex-1")}>
            <MailIcon className="size-4" /> send via email <CtaArrow />
          </a>
          <button type="button" onClick={copyBrief} className={buttonClass("ghost", "md", "flex-1 cursor-pointer")}>
            <CopyIcon className="size-4" /> copy brief
          </button>
        </div>
        <p className="mt-3 font-mono text-xs text-dim">
          or write directly:{" "}
          <button
            type="button"
            onClick={async () => toast((await copyToClipboard(site.email)) ? `✓ copied ${site.email}` : site.email)}
            className="cursor-pointer text-muted underline decoration-line-2 underline-offset-4 hover:text-accent"
          >
            {site.email}
          </button>
        </p>
      </div>
    </div>
  );
}

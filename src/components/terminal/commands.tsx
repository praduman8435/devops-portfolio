import type { ReactNode } from "react";

import { devopsProjects } from "@/content/projects";
import { products } from "@/content/products";
import { services } from "@/content/services";
import { site } from "@/content/site";
import { stack } from "@/content/stack";
import { kubernetesSeries, posts } from "@/content/writing";
import { defaultMailto } from "@/lib/mailto";
import { scrollToId } from "@/lib/scroll";

/* ---------- output model ---------- */

/** A line is either inline content (wraps) or preformatted content (keeps column alignment). */
export type OutputLine = ReactNode | { pre: ReactNode };
export type Output = OutputLine[];

export interface CommandContext {
  args: string[];
  history: readonly string[];
  print: (out: Output) => void;
}

export type CommandFn = (ctx: CommandContext) => Output | void;

export const isPre = (l: OutputLine): l is { pre: ReactNode } =>
  typeof l === "object" && l !== null && !Array.isArray(l) && "pre" in (l as object);

/* ---------- styling tokens ---------- */

export const Ok = ({ children }: { children: ReactNode }) => <span className="text-accent">{children}</span>;
export const Dim = ({ children }: { children: ReactNode }) => <span className="text-dim">{children}</span>;
export const Muted = ({ children }: { children: ReactNode }) => <span className="text-muted">{children}</span>;
export const Err = ({ children }: { children: ReactNode }) => <span className="text-danger">{children}</span>;
const Warn = ({ children }: { children: ReactNode }) => <span className="text-amber">{children}</span>;
const B = ({ children }: { children: ReactNode }) => <span className="font-semibold text-fg">{children}</span>;

const Ext = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan underline decoration-cyan/35 underline-offset-[3px] hover:decoration-cyan">
    {children}
  </a>
);

const Jump = ({ id, children }: { id: string; children: ReactNode }) => (
  <a
    href={`#${id}`}
    onClick={(e) => {
      e.preventDefault();
      scrollToId(id);
    }}
    className="text-cyan underline decoration-cyan/35 underline-offset-[3px] hover:decoration-cyan"
  >
    {children}
  </a>
);

export const Prompt = () => (
  <>
    <span className="text-accent">guest@praduman</span>
    <span className="text-dim">:</span>
    <span className="text-cyan">~</span>
    <span className="text-dim">$</span>
  </>
);

const pad = (s: string, n: number) => s.padEnd(n, " ");

/* ---------- content commands ---------- */

const whoami: CommandFn = () => [
  <>
    <B>praduman prajapati</B> — devops engineer
  </>,
  <Muted key="m1">3+ years running production infrastructure · india ({site.timezoneLabel})</Muted>,
  <Muted key="m2">aws · kubernetes · terraform · ci/cd · devsecops · full-stack products</Muted>,
  <>
    status: <Ok>● available for freelance &amp; contract work</Ok>
  </>,
];

const servicesCmd: CommandFn = () => [
  <Muted key="h"># what I can build for you</Muted>,
  ...services.map((s, i) => ({
    pre: (
      <>
        <Ok>[{String(i + 1).padStart(2, "0")}]</Ok> {pad(s.title.toLowerCase(), 28)}
        <Dim>{s.tools.join(" · ")}</Dim>
      </>
    ),
  })),
  <>
    → details: <Jump id="services">#services</Jump>
  </>,
];

const projectsCmd: CommandFn = () => [
  <Muted key="h"># devops work</Muted>,
  ...devopsProjects.flatMap((p) => [
    <>
      <Ok>{p.stars !== undefined ? `★${p.stars} ⑂${p.forks ?? 0}` : `  ${(p.language ?? "").toLowerCase()}  `}</Ok>{" "}
      <Ext href={p.links[0]?.href ?? site.links.github}>{p.title.toLowerCase()}</Ext>
    </>,
    <Dim key={`${p.id}-flow`}>{"        "}{p.flow.join(" → ").toLowerCase()}</Dim>,
  ]),
  <>
    → more: <Jump id="work">#work</Jump> · products: <Ok>products</Ok>
  </>,
];

const productsCmd: CommandFn = () => [
  <Muted key="h"># products I&apos;ve shipped</Muted>,
  ...products.map((p) => ({
    pre: (
      <>
        <Ok>{pad(`[${p.status}]`, 11)}</Ok>
        {pad(p.name.toLowerCase(), 15)}
        <Ext href={p.links[0]?.href ?? site.links.github}>{p.links[0]?.label ?? "link"}</Ext>
      </>
    ),
  })),
  <>
    → details: <Jump id="products">#products</Jump>
  </>,
];

const stackCmd: CommandFn = () => [
  <Muted key="h"># ~/stack</Muted>,
  ...stack.map((g) => ({
    pre: (
      <>
        {pad(g.dir, 15)}
        <Dim>{g.items.map((i) => i.name).join(" · ")}</Dim>
      </>
    ),
  })),
];

const blogCmd: CommandFn = () => [
  <Muted key="h"># latest writing ({site.articles} articles on hashnode)</Muted>,
  ...posts.slice(0, 4).map((p) => (
    <>
      <Dim>{p.date.slice(0, 7)}</Dim> <Ext href={p.href}>{p.title.toLowerCase()}</Ext>
    </>
  )),
  <>
    <Dim>series </Dim> <Ext href={kubernetesSeries.href}>kubernetes, from zero (10 parts)</Ext>
  </>,
];

const contactCmd: CommandFn = () => [
  <Muted key="h"># reach me</Muted>,
  { pre: <>email     <a href={defaultMailto} className="text-cyan underline decoration-cyan/35 underline-offset-[3px]">{site.email}</a></> },
  { pre: <>linkedin  <Ext href={site.links.linkedin}>{site.handles.linkedin}</Ext></> },
  { pre: <>github    <Ext href={site.links.github}>{site.handles.github}</Ext></> },
  { pre: <>x         <Ext href={site.links.x}>{site.handles.x}</Ext></> },
  { pre: <>blog      <Ext href={site.links.blog}>{site.handles.blog}</Ext></> },
  <>
    tip: <Ok>sudo hire-me</Ok> skips the queue ;)
  </>,
];

/* ---------- shell-ish commands ---------- */

const FILES: Record<string, CommandFn> = {
  "about.txt": whoami,
  "services.yaml": servicesCmd,
  "products.md": productsCmd,
  "stack.json": stackCmd,
  "blog.md": blogCmd,
  "contact.sh": contactCmd,
};

const sudo: CommandFn = (ctx) => {
  const what = ctx.args.join(" ").toLowerCase();
  if (/^hire([- ]?me)?$/.test(what)) {
    window.setTimeout(() => {
      ctx.print([
        <>
          <Ok>✓ access granted.</Ok> opening a secure channel to praduman…
        </>,
        <>
          →{" "}
          <a href={defaultMailto} className="text-cyan underline decoration-cyan/35 underline-offset-[3px]">
            {site.email}
          </a>
        </>,
        <Muted key="s">scrolling to contact ↓</Muted>,
      ]);
      window.setTimeout(() => scrollToId("contact"), 700);
    }, 650);
    return [<Dim key="pw">[sudo] password for guest: ********</Dim>];
  }
  if (what.startsWith("rm")) return rm(ctx);
  if (!what) return [<Muted key="u">usage: sudo &lt;command&gt; (hint: hire-me)</Muted>];
  return [
    <>
      <Err>guest is not in the sudoers file.</Err> <Muted>this incident will be reported.</Muted>
    </>,
    <>
      hint: <Ok>sudo hire-me</Ok>
    </>,
  ];
};

const rm: CommandFn = () => [
  <>
    <Err>rm: operation not permitted</Err> <Muted>(immutable infrastructure ;)</Muted>
  </>,
];

const kubectl: CommandFn = ({ args }) => {
  const a = args.join(" ");
  if (/^get (deploy|deployments?)\b/.test(a)) {
    return [
      { pre: "NAME     READY   UP-TO-DATE   AVAILABLE   AGE" },
      { pre: <>api      <Ok>3/3</Ok>     3            3           14d</> },
      { pre: <>web      <Ok>2/2</Ok>     2            2           14d</> },
      { pre: <>worker   <Ok>4/4</Ok>     4            4           14d</> },
    ];
  }
  if (/^get (po|pods?)\b/.test(a)) {
    return [
      { pre: "NAME                        READY   STATUS    RESTARTS   AGE" },
      { pre: <>portfolio-7f9c6d8b5-x2kq9   1/1     <Ok>Running</Ok>   0          3y</> },
      { pre: <>terminal-5c8d7f6b4-m8wz1    1/1     <Ok>Running</Ok>   0          3y</> },
      { pre: <>hire-me-6b7c9d5f8-q4jt7     1/1     <Ok>Running</Ok>   0          1s</> },
    ];
  }
  return [
    <>
      <Err>Error from server (Forbidden):</Err> guest can&apos;t do that here.
    </>,
    <>
      <Muted>…but I can set up proper RBAC for your cluster. try </Muted>
      <Ok>sudo hire-me</Ok>
    </>,
  ];
};

const help: CommandFn = () => [
  <Muted key="h">available commands:</Muted>,
  ...(
    [
      ["whoami", "who is behind this terminal"],
      ["services", "what I can build for you"],
      ["projects", "devops work, open-sourced"],
      ["products", "full products I've shipped"],
      ["stack", "tools I use every day"],
      ["blog", "latest technical writing"],
      ["contact", "ways to reach me"],
      ["sudo hire-me", "you know you want to"],
      ["clear", "clear the screen"],
    ] as const
  ).map(([c, d]) => ({
    pre: (
      <>
        {"  "}
        <Ok>{pad(c, 14)}</Ok>
        <Muted>{d}</Muted>
      </>
    ),
  })),
  <Dim key="also">  also: ls, cat, pwd, uptime, kubectl, date, echo, history, ⌘K</Dim>,
];

export const commands: Record<string, CommandFn> = {
  help,
  "?": help,
  whoami,
  about: whoami,
  services: servicesCmd,
  projects: projectsCmd,
  work: projectsCmd,
  products: productsCmd,
  stack: stackCmd,
  skills: stackCmd,
  blog: blogCmd,
  writing: blogCmd,
  contact: contactCmd,
  email: contactCmd,
  sudo,
  rm,
  kubectl,
  ls: ({ args }) =>
    args[0]?.replace(/\/$/, "") === "projects"
      ? [<>{devopsProjects.map((p) => <Ok key={p.id}>{p.id}/  </Ok>)}</>]
      : [
          <>
            about.txt  services.yaml  products.md  <Ok>projects/</Ok>  stack.json  blog.md  <Warn>contact.sh</Warn>
          </>,
        ],
  cat: ({ args, ...ctx }) => {
    const file = args[0];
    if (!file) return [<Muted key="u">usage: cat &lt;file&gt; (try: cat about.txt)</Muted>];
    const fn = FILES[file];
    if (fn) return fn({ args: [], ...ctx });
    if (file.replace(/\/$/, "") === "projects") return [<Err key="d">cat: projects: Is a directory</Err>];
    return [<Err key="nf">cat: {file}: No such file or directory</Err>];
  },
  "./contact.sh": contactCmd,
  cd: () => [
    <>
      <Muted>this is a one-page shell. try </Muted>
      <Ok>ls</Ok>
    </>,
  ],
  pwd: () => ["/home/guest/praduman"],
  date: () => [new Date().toString()],
  echo: ({ args }) => [args.join(" ")],
  history: ({ history }) => history.map((h, i) => ({ pre: <><Dim>{String(i + 1).padStart(4)}</Dim>  {h}</> })),
  uptime: () => [
    <>
      {" "}up 3+ years, 1 engineer, load average: <Ok>shipping, shipping, shipping</Ok>
    </>,
  ],
  "./pipeline": () => [
    { pre: <>[build] <Ok>✓</Ok>  [test] <Ok>✓</Ok>  [sonar] <Ok>✓</Ok>  [trivy] <Ok>✓</Ok>  [deploy] <Ok>✓</Ok></> },
    <>
      → <Ok>all checks passed</Ok> · rolling update complete
    </>,
  ],
  hire: () => [<><Err>permission denied.</Err> try <Ok>sudo hire-me</Ok></>],
  "hire-me": () => [<><Err>permission denied.</Err> try <Ok>sudo hire-me</Ok></>],
  vim: () => [<Muted key="v">you&apos;d never get out. stay here.</Muted>],
  exit: () => [<Muted key="e">logout… just kidding. scroll down, there&apos;s more ↓</Muted>],
};

export const notFound = (name: string): Output => [
  <Err key="nf">zsh: command not found: {name}</Err>,
  <>
    <Muted>type </Muted>
    <Ok>help</Ok>
    <Muted> to see what I can do.</Muted>
  </>,
];

export const completions = [
  "help", "whoami", "services", "projects", "products", "stack", "blog", "contact", "sudo hire-me", "clear",
  "ls", "ls projects", "cat about.txt", "cat services.yaml", "cat products.md", "cat stack.json", "cat blog.md",
  "cat contact.sh", "pwd", "uptime", "kubectl get pods", "kubectl get deploy", "date", "echo", "history", "exit",
];

/** Demo sequence typed automatically after the boot screen. */
export const autoplayScript = ["whoami", "kubectl get deploy -n your-product", "./pipeline --status"];

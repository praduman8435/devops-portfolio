import Image from "next/image";

import { products, type Product, type ProductStatus } from "@/content/products";
import { sectionIndex } from "@/content/site";
import { cn } from "@/lib/cn";
import { ArrowUpRight } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

const statusStyles: Record<ProductStatus, { dot: string; text: string; label: string }> = {
  live: { dot: "bg-accent shadow-[0_0_8px_var(--color-accent)]", text: "text-accent border-accent/30 bg-accent/5", label: "live" },
  beta: { dot: "bg-amber", text: "text-amber border-amber/30 bg-amber/5", label: "beta" },
  building: { dot: "bg-cyan", text: "text-cyan border-cyan/30 bg-cyan/5", label: "building" },
};

function StatusBadge({ status }: { status: ProductStatus }) {
  const s = statusStyles[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10.5px]", s.text)}>
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

/** Browser chrome around a screenshot or a generated preview. */
function BrowserFrame({ product, children }: { product: Product; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line-2 bg-[#0b0e0d] shadow-[0_30px_80px_-40px_rgb(0_0_0/0.9)]">
      <div className="flex h-9 items-center gap-3 border-b border-line bg-white/[0.02] px-3">
        <span aria-hidden="true" className="flex gap-1.5">
          <i className="size-2.5 rounded-full bg-white/15" />
          <i className="size-2.5 rounded-full bg-white/15" />
          <i className="size-2.5 rounded-full bg-white/15" />
        </span>
        <span className="mx-auto flex max-w-[70%] items-center gap-1.5 truncate rounded bg-white/[0.04] px-3 py-0.5 font-mono text-[11px] text-muted">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3 shrink-0 text-accent">
            <path fill="none" stroke="currentColor" strokeWidth="2" d="M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z" />
          </svg>
          {product.displayUrl ?? `github.com/praduman8435/${product.id}`}
        </span>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden">{children}</div>
    </div>
  );
}

/* Generated previews for products without a usable public screenshot. */

function RadixoPreview() {
  return (
    <div className="absolute inset-0 flex flex-col bg-[radial-gradient(ellipse_at_80%_0%,rgb(230_57_70/0.22),transparent_55%),#100b0a] p-[6%] text-white">
      <div className="flex items-center gap-2 text-[clamp(9px,1.1vw,12px)]">
        <span className="font-semibold italic">Radixo</span>
        {["Menus", "Build your own", "Wallet"].map((n) => (
          <span key={n} className="rounded-full bg-white/[0.06] px-2 py-0.5 text-white/60">
            {n}
          </span>
        ))}
        <span className="ml-auto rounded-full bg-[#e63946] px-2.5 py-0.5 font-medium">Build my menu</span>
      </div>
      <p className="mt-[7%] max-w-[70%] text-[clamp(16px,2.6vw,30px)] leading-[1.05] font-bold tracking-tight">
        Chef-cooked meals, <span className="text-[#ff6b6b]">built your way.</span>
      </p>
      <div className="mt-auto grid grid-cols-3 gap-[3%]">
        {["Breakfast", "Lunch", "Dinner"].map((m, i) => (
          <div key={m} className="rounded-lg border border-white/10 bg-white/[0.04] p-[8%]">
            <div className="aspect-[4/3] rounded-md bg-[linear-gradient(135deg,rgb(230_57_70/0.35),rgb(255_180_80/0.15))]" style={{ opacity: 1 - i * 0.15 }} />
            <p className="mt-2 text-[clamp(8px,1vw,11px)] text-white/70">{m}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function KiranaPreview() {
  const items = [
    ["Basmati rice 5kg", "₹520"],
    ["Toor dal 1kg", "₹160"],
    ["Sunflower oil 1L", "₹145"],
    ["Tea 250g", "₹130"],
  ];
  return (
    <div className="absolute inset-0 grid grid-cols-[1.4fr_1fr] gap-[4%] bg-[#0f1012] p-[5%] text-[clamp(8px,1.05vw,12px)] text-white/80">
      <div className="flex flex-col gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] p-[5%]">
        <p className="mb-1 font-semibold text-white">Counter sale</p>
        {items.map(([name, price]) => (
          <div key={name} className="flex justify-between border-b border-white/[0.06] pb-1">
            <span>{name}</span>
            <span className="text-white/60">{price}</span>
          </div>
        ))}
        <div className="mt-auto flex justify-between pt-1 font-semibold text-white">
          <span>Total</span>
          <span>₹955</span>
        </div>
      </div>
      <div className="flex flex-col gap-[6%]">
        {[
          ["Stock alerts", "3 low"],
          ["Suppliers", "12"],
          ["KhataBook", "₹4,280 due"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg border border-white/10 bg-white/[0.03] p-[8%]">
            <p className="text-white/50">{k}</p>
            <p className="mt-0.5 font-semibold text-white">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const previews: Record<string, () => React.ReactNode> = {
  radixo: RadixoPreview,
  "klasiq-kirana": KiranaPreview,
};

function ProductVisual({ product, priority = false }: { product: Product; priority?: boolean }) {
  const Preview = previews[product.id];
  return (
    <BrowserFrame product={product}>
      {product.image ? (
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 680px, 100vw"
          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        />
      ) : Preview ? (
        <Preview />
      ) : null}
    </BrowserFrame>
  );
}

function ProductLinks({ links }: { links: Product["links"] }) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2">
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link inline-flex items-center gap-1.5 border-b border-accent/35 pb-px font-mono text-[13px] transition-colors hover:border-accent hover:text-accent"
        >
          {l.label}
          <ArrowUpRight className="size-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
        </a>
      ))}
    </div>
  );
}

function ProductBody({ product, large = false }: { product: Product; large?: boolean }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-3">
        <h3 className={cn("font-mono font-bold tracking-[-0.04em]", large ? "text-[clamp(1.5rem,2.6vw,2rem)]" : "text-xl")}>
          {product.name}
        </h3>
        <StatusBadge status={product.status} />
      </div>
      <p className="font-mono text-[13px] text-fg">
        <span className="text-accent">→ </span>
        {product.tagline}
      </p>
      <p className="text-[0.97rem] leading-relaxed text-muted">{product.description}</p>
      <ul className="space-y-1.5 text-[0.93rem]">
        {product.highlights.map((h) => (
          <li key={h} className="flex gap-2.5">
            <span aria-hidden="true" className="font-mono text-accent">+</span>
            {h}
          </li>
        ))}
      </ul>
      <p className="font-mono text-[11.5px] leading-relaxed text-dim">{product.stack.join(" · ")}</p>
      <div className="mt-auto pt-2">
        <ProductLinks links={product.links} />
      </div>
    </div>
  );
}

export function Products() {
  const featured = products.filter((p) => p.featured);
  const rest = products.filter((p) => !p.featured);

  return (
    <section id="products" className="pt-[clamp(88px,11vw,150px)]">
      <div className="container-page">
        <SectionHeading
          index={sectionIndex("products")}
          label="products"
          title="I ship whole products, too"
          description="Beyond pipelines: full-stack products I've designed, built and deployed for real users. I know first-hand what developers need from the platform underneath them."
        />

        {/* Featured products: full width, screenshot side alternates for rhythm. */}
        <div className="grid grid-cols-1 gap-4">
          {featured.map((p, i) => {
            const flip = i % 2 === 1;
            return (
              <Reveal key={p.id}>
                <article
                  data-spotlight
                  className={cn(
                    "group hud-card grid grid-cols-1 items-center gap-8 p-5 sm:p-7 lg:gap-10",
                    flip ? "lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]" : "lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]",
                  )}
                >
                  <div className={cn(flip && "lg:order-2")}>
                    <ProductVisual product={p} priority={false} />
                  </div>
                  <div className={cn("px-2 pb-2 sm:px-0 sm:pb-0", flip && "lg:order-1")}>
                    <ProductBody product={p} large />
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {rest.map((p, i) => (
            <Reveal key={p.id} delay={i} className="h-full">
              <article data-spotlight className="group hud-card flex h-full flex-col gap-7 p-5 sm:p-7">
                <ProductVisual product={p} />
                <div className="flex-1 px-2 pb-2 sm:px-0 sm:pb-0">
                  <ProductBody product={p} />
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";

import { products, type Product, type ProductStatus } from "@/content/products";
import { sectionIndex } from "@/content/site";
import { cn } from "@/lib/cn";
import { buttonClass } from "@/components/ui/button";
import { ArrowUpRight } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

const statusStyles: Record<ProductStatus, { dot: string; text: string }> = {
  live: { dot: "bg-accent shadow-[0_0_8px_var(--color-accent)]", text: "text-accent border-accent/30 bg-accent/5" },
  beta: { dot: "bg-amber", text: "text-amber border-amber/30 bg-amber/5" },
  building: { dot: "bg-cyan", text: "text-cyan border-cyan/30 bg-cyan/5" },
};

function StatusBadge({ status }: { status: ProductStatus }) {
  const s = statusStyles[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10.5px]", s.text)}>
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", s.dot)} />
      {status}
    </span>
  );
}

/** Screenshot in browser chrome. The whole frame is a link to the live product. */
function ProductVisual({ product }: { product: Product }) {
  return (
    <a
      href={product.liveUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit ${product.name} live site (opens in a new tab)`}
      className="block overflow-hidden rounded-lg border border-line-2 bg-[#0b0e0d] shadow-[0_30px_80px_-40px_rgb(0_0_0/0.9)] transition-colors hover:border-accent/40"
    >
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
          {product.displayUrl}
        </span>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          sizes="(min-width: 1024px) 680px, 100vw"
          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        />
      </div>
    </a>
  );
}

function ProductBody({ product }: { product: Product }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-3">
        <h3 className="font-mono text-[clamp(1.5rem,2.6vw,2rem)] font-bold tracking-[-0.04em]">{product.name}</h3>
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
        <a
          href={product.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass("ghost", "sm", "w-full sm:w-auto")}
        >
          visit live site
          <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </div>
  );
}

export function Products() {
  return (
    <section id="products" className="pt-[clamp(88px,11vw,150px)]">
      <div className="container-page">
        <SectionHeading
          index={sectionIndex("products")}
          label="products"
          title="I ship whole products, too"
          description="Beyond pipelines: full-stack products I've designed, built and deployed for real users, all live right now. I know first-hand what developers need from the platform underneath them."
        />

        {/* Every product gets a full-width card; the screenshot side alternates for rhythm. */}
        <div className="grid grid-cols-1 gap-4">
          {products.map((p, i) => {
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
                    <ProductVisual product={p} />
                  </div>
                  <div className={cn("px-2 pb-2 sm:px-0 sm:pb-0", flip && "lg:order-1")}>
                    <ProductBody product={p} />
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

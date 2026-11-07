import type { ProjectLink } from "./projects";

export type ProductStatus = "live" | "beta" | "building";

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: ProductStatus;
  highlights: string[];
  stack: string[];
  /** Screenshot in /public. Omit to render the generated preview panel instead. */
  image?: { src: string; alt: string; width: number; height: number };
  /** Address shown in the browser-frame chrome. */
  displayUrl?: string;
  /** Featured products render full width with a screenshot. */
  featured?: boolean;
  accent?: string;
  links: ProjectLink[];
}

export const products: Product[] = [
  {
    id: "klasiq",
    name: "Klasiq",
    tagline: "School-uniform commerce for a real family retail business.",
    description:
      "Klasiq is the online brand behind two family-run clothing stores. Parents pick their child's school and class to see the exact uniform in every size, order online, and choose home delivery or store pickup. The owners run catalogue, offers and orders from the Klasiq Admin dashboard.",
    status: "live",
    highlights: [
      "School → class → size catalogue",
      "Cart, offer codes and cash-on-delivery checkout",
      "Klasiq Admin dashboard for orders and catalogue",
      "WhatsApp Business API and Geoapify location integrations",
    ],
    stack: ["Next.js App Router", "TypeScript", "Tailwind CSS v4", "shadcn/ui", "Prisma", "PostgreSQL", "Vercel"],
    image: {
      src: "/projects/klasiq.jpg",
      alt: "Klasiq storefront showing school-uniform categories, offers and product cards",
      width: 1440,
      height: 900,
    },
    displayUrl: "klasiq-tau.vercel.app",
    accent: "#e5383b",
    featured: true,
    links: [
      { label: "live site", href: "https://klasiq-tau.vercel.app/" },
      { label: "source", href: "https://github.com/praduman8435/klasiq" },
    ],
  },
  {
    id: "instaplots",
    name: "InstaPlots",
    tagline: "A land marketplace for India: real photos, real prices.",
    description:
      "InstaPlots connects people looking for farmland, house plots and commercial land with the sellers who have it. Buyers search by village, town or road, in the units they actually use, then call or WhatsApp the seller directly, with no login, no fee and nobody in between. Every listing is reviewed and every seller's phone is verified before it goes live.",
    status: "live",
    highlights: [
      "Search by place, land type and budget, in bigha, acre, gaj or sq ft",
      "Direct call / WhatsApp to sellers, with no login or fees for buyers",
      "Moderated listings and phone-verified sellers",
      "WhatsApp land alerts matched to a buyer's place and budget",
    ],
    stack: ["Web app", "Vercel", "Custom domain"],
    image: {
      src: "/projects/instaplots.jpg",
      alt: "InstaPlots home page with a land search bar over a farmland photo and popular locations",
      width: 1440,
      height: 900,
    },
    displayUrl: "instaplots.com",
    accent: "#0f7a4a",
    featured: true,
    links: [{ label: "instaplots.com", href: "https://instaplots.com/" }],
  },
  {
    id: "radixo",
    name: "Radixo",
    tagline: "Chef-cooked meals, built your way.",
    description:
      "Radixo is a student-dining startup from India offering flexible meal services. Students browse menus, build their own meal plan and manage a dining wallet, while the Radixo team runs operations behind a separate team login.",
    status: "building",
    highlights: ["Menus and build-your-own meal plans", "In-app dining wallet", "Separate team / operations login"],
    stack: ["Web app", "Vercel"],
    displayUrl: "radixo.vercel.app",
    accent: "#e63946",
    links: [{ label: "live site", href: "https://radixo.vercel.app/" }],
  },
  {
    id: "klasiq-kirana",
    name: "Klasiq Kirana",
    tagline: "The general-store edition of Klasiq.",
    description:
      "A spin-off of Klasiq for kirana and general stores. Customers search by product or brand and choose pickup or local delivery. The owner gets counter sales, stock, suppliers, returns and KhataBook customer credit in one admin.",
    status: "beta",
    highlights: ["Point-of-sale counter billing", "Stock, suppliers and returns", "KhataBook customer credit ledger"],
    stack: ["Next.js", "TypeScript", "Tailwind CSS v4", "Prisma", "PostgreSQL"],
    links: [{ label: "source", href: "https://github.com/praduman8435/klasiq-shop-kirana" }],
  },
  // To add another product, copy an entry above. Set `featured: true` for a full-width card with a screenshot.
];

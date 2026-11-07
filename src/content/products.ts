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
    links: [
      { label: "live site", href: "https://klasiq-tau.vercel.app/" },
      { label: "source", href: "https://github.com/praduman8435/klasiq" },
    ],
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
  // To add another product (for example "Plots"), copy an entry above and fill in its links.
];

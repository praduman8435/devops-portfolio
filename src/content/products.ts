export type ProductStatus = "live" | "beta" | "building";

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: ProductStatus;
  highlights: string[];
  stack: string[];
  /** Screenshot in /public (1440×900). */
  image: { src: string; alt: string; width: number; height: number };
  /** Address shown in the browser-frame chrome. */
  displayUrl: string;
  /** Public URL visitors can open. Products link only to the live site, never to source. */
  liveUrl: string;
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
    liveUrl: "https://klasiq-tau.vercel.app/",
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
    liveUrl: "https://instaplots.com/",
  },
  {
    id: "radixo",
    name: "Radixo",
    tagline: "Chef-cooked meals, built your way.",
    description:
      "Radixo is a student-dining platform from India. Students pick a ready-made menu or build their own, eat 4 or 7 days a week, and book by the week or month. If they're away, they mark the days 24 hours ahead and the value goes back to their Radixo wallet. Login is just a phone number and an OTP.",
    status: "live",
    highlights: [
      "Ready-made or build-your-own meal plans, 4 or 7 days a week",
      "Plans from 1 week to 6 months, with up to 12% off longer bookings",
      "Skip days with 24 hours' notice and get the value back in the wallet",
      "Phone-number OTP login and a separate team / operations portal",
    ],
    stack: ["Web app", "Vercel"],
    image: {
      src: "/projects/radixo.jpg",
      alt: "Radixo wallet page with phone-number login and the three-step plan: pick your menu, book it, skip days",
      width: 1440,
      height: 900,
    },
    displayUrl: "radixo.vercel.app",
    liveUrl: "https://radixo.vercel.app/",
  },
  {
    id: "klasiq-kirana",
    name: "Klasiq Kirana",
    tagline: "The neighbourhood grocery store, online.",
    description:
      "A grocery and general-store edition of Klasiq. Customers shop by category, from atta, rice and dal to snacks, personal care and household, with free delivery within 3 km or ready-to-collect store pickup, and pay on delivery or at the counter. Behind it, the owner runs counter sales, stock, suppliers, returns and KhataBook customer credit from one admin.",
    status: "live",
    highlights: [
      "Category aisles with size variants and offer pricing",
      "Free delivery within 3 km, or pick up at the store",
      "Cash on delivery or pay at the store, with no card needed",
      "Owner admin: counter sales, stock, suppliers, returns and KhataBook credit",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS v4", "Prisma", "PostgreSQL", "Vercel"],
    image: {
      src: "/projects/klasiq-kirana.jpg",
      alt: "Klasiq Kirana storefront with delivery and pickup offers, grocery categories and product cards",
      width: 1440,
      height: 900,
    },
    displayUrl: "klasiq-shop-kirana.vercel.app",
    liveUrl: "https://klasiq-shop-kirana.vercel.app/",
  },
  // To add another product, copy an entry above with its screenshot in /public/projects.
];

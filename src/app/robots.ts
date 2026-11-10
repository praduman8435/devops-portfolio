import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  const url = getSiteUrl();
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/radar", "/api/"] }], sitemap: `${url}/sitemap.xml`, host: url };
}

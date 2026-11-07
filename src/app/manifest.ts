import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} | DevOps Engineer`,
    short_name: site.handle,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#060807",
    theme_color: "#060807",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}

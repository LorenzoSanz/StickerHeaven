
import type { MetadataRoute } from "next";
import { env } from "@/config/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard", "/checkout", "/wishlist", "/_next/"],
    },
    sitemap: `${env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  };
}

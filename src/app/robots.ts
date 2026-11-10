
import type { MetadataRoute } from "next";
import { publicEnv } from "@/config/publicEnv";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard", "/checkout", "/wishlist", "/_next/"],
    },
    sitemap: `${publicEnv.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  };
}

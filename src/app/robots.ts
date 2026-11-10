// POR QUÉ: Configuración de robots.txt para Next.js.
// QUÉ: Controla el acceso de los bots a la web y mejora SEO.

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

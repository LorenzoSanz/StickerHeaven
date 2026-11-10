/**
 * NOTES: Mantener alineadas reglas de CSP/rewrites y allowlist de imágenes remotas (Cloudinary) para `next/image`.
 */
import type { NextConfig } from 'next';
import { getApiUrlForRewrites } from './src/config/nextConfigEnv';

const nextConfig: NextConfig = {
  // Activa el modo estricto de React para detectar problemas potenciales en el ciclo de vida
  // y preparar la aplicación para la concurrencia futura de React.

  productionBrowserSourceMaps: false,
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
    ],
  },

  poweredByHeader: false,

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${getApiUrlForRewrites()}/api/:path*`,
      },
    ];
  },

  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    const isDev = process.env.NODE_ENV === "development";
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "img-src 'self' data: https:",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://js.stripe.com`,
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' https:",
      "frame-src https://js.stripe.com",
    ].join("; ");

    const headers = [
      { key: "Content-Security-Policy", value: csp },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];

    if (isProd) {
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      });
    }

    return [{ source: "/(.*)", headers }];
  },
};

export default nextConfig;

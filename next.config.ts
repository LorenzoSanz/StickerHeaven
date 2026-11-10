/**
 * The Content-Security-Policy is set per request in src/proxy.ts, because it needs a fresh nonce.
 */
import type { NextConfig } from 'next';
import { getApiUrlForRewrites } from './src/config/nextConfigEnv';

const nextConfig: NextConfig = {

  // Self-contained server with only the files it needs; the Docker image ships this, not the repo.
  output: "standalone",
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
    const headers = [
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

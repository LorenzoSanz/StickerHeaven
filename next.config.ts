/**
 * NOTES: Mantener alineadas reglas de CSP/rewrites y allowlist de imágenes remotas (Cloudinary) para `next/image`.
 */
import type { NextConfig } from 'next';
// PORQUE: next.config sólo necesita API_URL; importamos un helper mínimo sin disparar validación completa de env.
import { getApiUrlForRewrites } from './src/config/nextConfigEnv';

/**
 * PORQUE: Configuración de Next.js optimizada para seguridad, rendimiento y desarrollo moderno.
 */
const nextConfig: NextConfig = {
  // Activa el modo estricto de React para detectar problemas potenciales en el ciclo de vida
  // y preparar la aplicación para la concurrencia futura de React.

  // PORQUE: Deshabilitar source maps en producción reduce el tamaño del bundle y mejora la seguridad.
  productionBrowserSourceMaps: false,
  reactStrictMode: true,

  images: {
    // PORQUE: Permite cargar imágenes de Cloudinary y placehold.co.
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

  // PORQUE: Por seguridad: Deshabilita el header 'X-Powered-By' para no revelar que el servidor corre Next.js,
  // reduciendo la superficie de información disponible para atacantes.
  poweredByHeader: false,

  // PORQUE: Reescritura de rutas para la API:
  // Redirige las peticiones de /api/* al servidor backend.
  // Usa una variable de entorno para producción, con fallback a localhost para desarrollo local.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${getApiUrlForRewrites()}/api/:path*`,
      },
    ];
  },

  /**
   * PORQUE: Configuración de encabezados de seguridad para proteger la aplicación contra ataques comunes.
   */
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
      // PORQUE: Protege contra ataques de inyección de código.
      { key: "Content-Security-Policy", value: csp },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];

    if (isProd) {
      // PORQUE: Protege contra ataques de man-in-the-middle.
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      });
    }

    return [{ source: "/(.*)", headers }];
  },
};

/**
 * PORQUE: Exporta la configuración de Next.js para ser utilizada por el servidor.
 */
export default nextConfig;

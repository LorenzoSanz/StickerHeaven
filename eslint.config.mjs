// PORQUE: Next.js v16 usa la configuración de ESLint plana, la configuración antigua no está disponible.

import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [
      "**/.next/**",
      "**/node_modules/**",
      "**/public/**",
    ],
  },
  {
    // APLICAR A: Código de la app.
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}", "src/lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          // EVITAR: Importar infraestructura directo desde la app.
          // EN VEZ: Usar servicios o factories.
          patterns: ["@/infrastructure/*", "@/infrastructure/**"],
        },
      ],
    },
  },
  ...nextCoreWebVitals,
];

export default config;

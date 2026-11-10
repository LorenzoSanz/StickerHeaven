import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  future: {
    // Evita que los estilos :hover se queden pegados en dispositivos táctiles (móviles/tablets)
    // aplicando hover solo en dispositivos que soportan puntero real.
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
};

export default config;

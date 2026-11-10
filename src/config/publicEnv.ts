import { publicEnvSchema } from "@/config/envSchemas";
/**
 * POR QUÉ: Next.js requiere accesos explícitos a variables `NEXT_PUBLIC_` para inyectarlas estáticamente en el cliente.
 * QUÉ: Actúa como un Adaptador de Entorno que mapea y valida las variables públicas.
 * LÍMITES: Solo maneja variables prefijadas con NEXT_PUBLIC_ para evitar fugas de secretos al navegador.
 */
const parsedEnv = publicEnvSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
});
/**
 * Si la validación falla, se lanza un error con detalles sobre los campos inválidos.
 */
if (!parsedEnv.success) {
  const details = JSON.stringify(parsedEnv.error.flatten().fieldErrors);
  throw new Error(`Invalid public environment configuration: ${details}`);
}

/**
 * Si la validación es exitosa, se exporta el objeto con las variables de entorno públicas parseadas.
 */
export const publicEnv = parsedEnv.data;


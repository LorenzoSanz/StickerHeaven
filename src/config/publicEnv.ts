import { publicEnvSchema } from "@/config/envSchemas";
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


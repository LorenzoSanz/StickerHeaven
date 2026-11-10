import { loadStripe } from "@stripe/stripe-js";
// POR QUÉ: stripePromise se usa desde código cliente; importar env del servidor rompería el bundling y acoplaría el cliente a secretos.
// OBSERVABILIDAD: Las páginas de checkout en cliente pueden inicializar Stripe sin requerir variables env solo-servidor.
import { publicEnv } from "@/config/publicEnv";

// Sirve para inicializar Stripe en el cliente con la clave pública.
export const stripePromise = publicEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(publicEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

import { loadStripe } from "@stripe/stripe-js";
import { publicEnv } from "@/config/publicEnv";

// Sirve para inicializar Stripe en el cliente con la clave pública.
export const stripePromise = publicEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(publicEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

"use client";

import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { CheckoutForm } from "./_components/CheckoutForm";
import { Alert } from "@/components/ui/Alert";

// Componente cliente para el formulario de pago con Stripe.
export function CheckoutClient({ clientSecret }: { clientSecret: string }) {
  if (!stripePromise) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <Alert variant="danger">Stripe no está configurado para este entorno.</Alert>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <Elements options={{ clientSecret, appearance: { theme: "stripe" } }} stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}

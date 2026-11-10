"use client";

import { useEffect, useRef, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useNotifications } from "@/components/notifications/NotificationsProvider";
import { Spinner } from "@/components/ui/Spinner";

// Formulario de pago con Stripe.
export function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const notifications = useNotifications();
  const lastToastRef = useRef<string | null>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!message) return;
    const key = `checkout_error:${message}`;
    if (lastToastRef.current === key) return;
    lastToastRef.current = key;
    notifications.notify({ variant: "danger", title: "Pago no completado", message });
  }, [message, notifications]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message ?? "Ocurrió un error inesperado.");
      } else {
        setMessage("Ocurrió un error inesperado.");
      }
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
      <Button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full rounded-full transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.25)] hover:scale-[1.01] active:scale-[0.98] motion-reduce:transform-none"
      >
        {isLoading && <Spinner size="sm" className="text-white drop-shadow-none" />}
        {isLoading ? "Procesando…" : "Pagar ahora"}
      </Button>
      {message && <Alert variant="danger">{message}</Alert>}
    </form>
  );
}

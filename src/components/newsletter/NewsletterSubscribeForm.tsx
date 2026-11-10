"use client";

import { useState } from "react";
import { useNotifications } from "@/components/notifications/NotificationsProvider";
import { readErrorMessage } from "@/lib/readErrorMessage";

// Tipo para las propiedades del formulario de suscripción al newsletter.
type Props = {
  formClassName?: string;
  inputClassName: string;
  buttonClassName: string;
  placeholder?: string;
  buttonLabel?: string;
};

// Función para validar si una cadena es un email válido.
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Componente funcional para el formulario de suscripción al newsletter.
export function NewsletterSubscribeForm({
  formClassName,
  inputClassName,
  buttonClassName,
  placeholder = "Tu email",
  buttonLabel = "Suscribirme",
}: Props) {
  const { notify } = useNotifications();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Maneja la presentación del formulario.
  return (
    <form
      className={formClassName}
      onSubmit={async (e) => {
        e.preventDefault();
        if (submitting) return;

        const trimmed = email.trim();
        if (!isValidEmail(trimmed)) {
          notify({ variant: "danger", title: "Email inválido", message: "Revisa el formato e inténtalo de nuevo." });
          return;
        }

        setSubmitting(true);
        try {
          const res = await fetch("/api/marketing/newsletter/subscribe", {
            method: "POST",
            headers: { "content-type": "application/json", accept: "application/json" },
            body: JSON.stringify({ email: trimmed }),
          });

          if (!res.ok) {
            notify({ variant: "danger", title: "No se pudo suscribir", message: await readErrorMessage(res) });
            return;
          }

          setEmail("");
          notify({
            variant: "success",
            title: "Suscripción confirmada",
            message: "Te enviamos un email de prueba con un descuento ficticio.",
          });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        className={inputClassName}
        disabled={submitting}
        aria-label="Email"
      />
      <button
        type="submit"
        className={buttonClassName}
        disabled={submitting}
        aria-busy={submitting}
      >
        {submitting ? "Enviando…" : buttonLabel}
      </button>
    </form>
  );
}

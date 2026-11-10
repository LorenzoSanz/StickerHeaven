import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutClient } from "./CheckoutClient";
import { HttpError, serverApiFetch } from "@/lib/serverApi";
import type { CartDTO } from "@/modules/Cart/public";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

// Es la pagina de pago con Stripe.
type CheckoutResponse = { message: string; id: string; clientSecret: string };

function errorMessage(err: unknown): string {
  if (err instanceof HttpError) return err.message;
  if (err instanceof Error) return err.message;
  return "No se pudo iniciar el pago";
}

export default async function CheckoutPage() {
  let cart: CartDTO | null = null;
  try {
    cart = await serverApiFetch<CartDTO | null>("/api/cart");
  } catch (err) {
    if (err instanceof HttpError && err.status === 401) {
      redirect(`/login?returnTo=${encodeURIComponent("/checkout")}`);
    }
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Card className="p-8 text-center">
          <div className="text-red-400 font-semibold mb-4">Error: {errorMessage(err)}</div>
          <Link href="/cart">
            <Button variant="outline">Volver al carrito</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Card className="p-8 text-center">
          <div className="text-white/70 font-medium mb-4">Tu carrito está vacío.</div>
          <Link href="/cart">
            <Button variant="outline">Volver al carrito</Button>
          </Link>
        </Card>
      </div>
    );
  }

  let checkout: CheckoutResponse;
  try {
    checkout = await serverApiFetch<CheckoutResponse>("/api/orders/checkout", { method: "POST" });
  } catch (err) {
    if (err instanceof HttpError && err.status === 401) {
      redirect(`/login?returnTo=${encodeURIComponent("/checkout")}`);
    }
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Card className="p-8 text-center">
          <div className="text-red-400 font-semibold mb-4">Error: {errorMessage(err)}</div>
          <Link href="/cart">
            <Button variant="outline">Volver al carrito</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Pago</h1>
        <p className="mt-2 text-white/60">Completa tu compra de forma segura</p>
      </div>

      <CheckoutClient clientSecret={checkout.clientSecret} />
    </div>
  );
}

import { ShoppingCart } from "lucide-react";
import { getCartAction } from "./actions";
import { CartClient } from "./_components/CartClient";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cart = await getCartAction();

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[520px] h-[520px] bg-primary/20 rounded-full blur-[140px] opacity-35" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[520px] h-[520px] bg-accent/20 rounded-full blur-[140px] opacity-30" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-12 md:py-16">
        <div className="mb-10 flex items-center gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 shadow-[0_0_30px_rgba(139,92,246,0.12)]">
            <ShoppingCart className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              Tu carrito
            </h1>
            <p className="mt-1 text-white/60">Revisa tus productos y finaliza la compra.</p>
          </div>
        </div>

        <CartClient initialCart={cart} />
      </div>
    </div>
  );
}

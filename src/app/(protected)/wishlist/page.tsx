/**
 * POR QUÉ: Wishlist debe ser privada y accesible solo para usuarios autenticados.
 * QUÉ: Página protegida que renderiza la wishlist del usuario (UI cliente).
 */
import { WishlistClient } from "../../(public)/wishlist/WishlistClient";
import { serverApiFetch } from "@/lib/serverApi";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  // POR QUÉ: La wishlist se guarda aislada por usuario en localStorage; necesitamos su id para calcular el storageKey.
  // QUÉ: Lee el usuario autenticado desde el backend y lo pasa al cliente.
  const me = await serverApiFetch<{ user: { id: string } }>("/api/auth/me", { method: "GET" });
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-30" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] opacity-30" />
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto pt-24 pb-20">
        <div className="mb-12 border-b border-white/10 pb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4">
            Favoritos
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg">Guarda stickers para verlos más tarde.</p>
        </div>

        <WishlistClient userId={me.user.id} />
      </div>
    </div>
  );
}

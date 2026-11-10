import Link from "next/link";
import { Suspense } from "react";
import { serverApiFetch } from "@/lib/serverApi";
import type { CartDTO } from "@/modules/Cart/public";
import { SearchBar } from "../SearchBar";
import { UserMenu } from "./UserMenu";

export async function Header() {
  const [me, cart] = await Promise.all([
    serverApiFetch<{ user: { id: string; name: string; email: string } }>("/api/auth/me", { method: "GET" }).catch(() => null),
    serverApiFetch<CartDTO | null>("/api/cart").catch(() => null),
  ]);
  const user = me?.user ?? null;
  const isAuthenticated = Boolean(user);
  const cartItemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 font-bold text-xl tracking-tight">
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            StickerHeaven
          </span>
        </Link>

        {/* Search - Hidden on mobile, visible on larger screens */}
        <div className="hidden md:block flex-1 max-w-md mx-4">
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-6 flex-shrink-0 text-sm font-medium">
          <Link href="/stickers" className="text-gray-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.5)] transition-all">
            Catálogo
          </Link>
          {isAuthenticated ? (
            <Link
              href="/wishlist"
              className="text-gray-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.45)] transition-all"
            >
              Favoritos
            </Link>
          ) : null}
          <Link href="/cart" className="text-gray-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.5)] transition-all relative">
            Carrito
            {cartItemCount > 0 ? (
              <span className="absolute -top-2 -right-3 min-w-5 h-5 px-1 inline-flex items-center justify-center rounded-full bg-primary text-white text-[11px] font-bold shadow-[0_0_12px_rgba(139,92,246,0.5)]">
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            ) : null}
          </Link>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-4 border-l border-white/10 pl-6">
              <Link
                href="/dashboard/stickers/new"
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-full transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]"
              >
                Subir
              </Link>
              <UserMenu name={user!.name} email={user!.email} />
            </div>
          ) : (
            <div className="flex items-center gap-3 border-l border-white/10 pl-6">
              <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                Iniciar Sesión
              </Link>
              <Link 
                href="/register" 
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-full transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]"
              >
                Crear Cuenta
              </Link>
            </div>
          )}
        </nav>
      </div>
      
      {/* Mobile Search Bar (visible only on small screens) */}
      <div className="md:hidden px-4 pb-4">
        <Suspense fallback={null}>
          <SearchBar />
        </Suspense>
      </div>
    </header>
  );
}

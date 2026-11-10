import Link from "next/link";
import Image from "next/image";
import type { StickerDTO } from "@/modules/Catalog/public";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { FavoriteButton } from "@/components/wishlist/FavoriteButton";
import { formatCurrency } from "@/lib/utils";

// Interfaz para las propiedades de la tarjeta de sticker.
interface StickerCardProps {
  sticker: StickerDTO;
  viewerUserId?: string | null;
}

export function StickerCard({ sticker, viewerUserId }: StickerCardProps) {
  return (
    <div className="group relative flex flex-col gap-3 rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:-translate-y-1">
      {/* Hacer el card completo clicable mejora la navegación sin obligar a apuntar al link 'Details'. */}
      {/* Se añade un Link overlay detrás del contenido; botones de carrito/favoritos quedan por encima. */}
      <Link
        href={`/stickers/${sticker.id}`}
        aria-label={`Ver detalles de ${sticker.name}`}
        className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      />

      <div className="relative z-10 flex flex-col gap-3">
        {/* Contenedor de la imagen del sticker. */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-white/5 to-white/0 flex items-center justify-center p-4">
          {sticker.imageUrl ? (
            <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2">
              <Image
                src={sticker.imageUrl}
                alt={sticker.name}
                fill
                className="object-contain drop-shadow-xl"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ) : (
            <span className="text-gray-500">Sin imagen</span>
          )}

          <div className="absolute z-20 top-3 right-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <FavoriteButton stickerId={sticker.id} userId={viewerUserId ?? null} />
          </div>

          {/* Quick Add Button (Visible en Hover) */}
          <div className="absolute z-20 bottom-3 right-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <AddToCartButton
              stickerId={sticker.id}
              disabled={sticker.stock <= 0}
              title="Añadir al carrito"
              className="p-3 rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              iconOnly
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-lg font-bold text-white leading-tight group-hover:text-primary transition-colors">
              {sticker.name}
            </h3>
            <span className="font-bold text-white bg-white/10 px-2 py-1 rounded-md text-sm whitespace-nowrap">
              {formatCurrency(sticker.price.amount, sticker.price.currency)}
            </span>
          </div>

          <p className="text-gray-400 text-sm line-clamp-2 h-10">{sticker.description}</p>

          <div className="flex justify-between items-center mt-2 pt-3 border-t border-white/10">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                sticker.stock > 0 ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
              }`}
            >
              {sticker.stock > 0 ? `${sticker.stock} en stock` : "Agotado"}
            </span>

            <Link
              href={`/stickers/${sticker.id}`}
              className="text-sm font-medium text-primary hover:text-primary-light transition-colors flex items-center gap-1 group/link"
            >
              Ver detalles
              <span className="group-hover/link:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

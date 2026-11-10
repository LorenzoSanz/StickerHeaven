import type { StickerDTO } from "@/modules/Catalog/public";
import { StickerCard } from "./StickerCard";

// Propiedades para el catálogo de stickers.
interface CatalogGridProps {
  stickers: StickerDTO[];
  viewerUserId?: string | null;
}

// Catálogo de stickers.
export function CatalogGrid({ stickers, viewerUserId }: CatalogGridProps) {
  if (stickers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
        <p className="text-gray-400 text-lg">No se encontraron stickers.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
      {stickers.map((sticker) => (
        <StickerCard key={sticker.id} sticker={sticker} viewerUserId={viewerUserId ?? null} />
      ))}
    </div>
  );
}

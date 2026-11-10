import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { env } from "@/config/env";
import { getStickerByIdAction } from "../_actions/get-sticker-by-id";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { FavoriteButton } from "@/components/wishlist/FavoriteButton";
import { LocalReviews } from "@/components/reviews/LocalReviews";
import { serverApiFetch } from "@/lib/serverApi";

export const dynamic = "force-dynamic";

interface StickerDetailPageProps {
  params: Promise<{ id: string }>;
}

function truncateForMeta(text: string, max = 160): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1)}…`;
}

export async function generateMetadata({ params }: StickerDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const sticker = await getStickerByIdAction(id);

  if (!sticker) {
    return {
      title: "Sticker no encontrado",
      robots: { index: false, follow: false },
    };
  }

  const title = sticker.name;
  const description = truncateForMeta(sticker.description || `Sticker ${sticker.name} en StickerHeaven.`);

  return {
    title,
    description,
    alternates: { canonical: `/stickers/${encodeURIComponent(sticker.id)}` },
    openGraph: {
      title,
      description,
      url: `/stickers/${encodeURIComponent(sticker.id)}`,
      type: "website",
      images: sticker.imageUrl ? [{ url: sticker.imageUrl, alt: sticker.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: sticker.imageUrl ? [sticker.imageUrl] : undefined,
    },
  };
}

export default async function StickerDetailPage({ params }: StickerDetailPageProps) {
  const { id } = await params;
  const sticker = await getStickerByIdAction(id);
  const viewerUserId = await serverApiFetch<{ user: { id: string } }>("/api/auth/me", { method: "GET" })
    .then((r) => r.user.id)
    .catch(() => null);

  if (!sticker) {
    notFound();
  }

  const baseUrl = env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
  const stickerUrl = `${baseUrl}/stickers/${encodeURIComponent(sticker.id)}`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: sticker.name,
    description: sticker.description,
    image: sticker.imageUrl ? [sticker.imageUrl] : undefined,
    sku: sticker.id,
    offers: {
      "@type": "Offer",
      priceCurrency: sticker.price.currency,
      price: sticker.price.amount,
      availability: sticker.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: stickerUrl,
    },
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-30" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] opacity-30" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl pt-24 pb-20 relative z-10">
      <Link 
        href="/stickers" 
        className="inline-flex items-center text-primary hover:text-primary-light mb-6 font-medium transition-colors"
      >
        ← Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-surface rounded-2xl border border-white/10 p-6 md:p-8 shadow-[0_0_60px_rgba(0,0,0,0.45)]">
        {/* Left Column: Image */}
        <div className="relative w-full aspect-square bg-white/5 rounded-xl flex items-center justify-center overflow-hidden border border-white/10">
          {sticker.imageUrl ? (
            <Image
              src={sticker.imageUrl}
              alt={sticker.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="text-white/50 text-lg">Imagen no disponible</span>
          )}
          <div className="absolute top-4 right-4">
            <FavoriteButton stickerId={sticker.id} userId={viewerUserId} />
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {sticker.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="px-3 py-1 bg-white/10 text-white/70 text-xs font-semibold rounded-full uppercase tracking-wide"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {sticker.name}
            </h1>
          </div>

          <div className="max-w-none">
            <p className="text-white/70 text-lg leading-relaxed">
              {sticker.description}
            </p>
          </div>

          <div className="border-t border-white/10 pt-6">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-sm text-white/60 mb-1">Precio</p>
                <p className="text-4xl font-bold text-foreground">
                  {sticker.price.amount} <span className="text-xl text-white/60 font-normal">{sticker.price.currency}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/60 mb-1">Disponibilidad</p>
                <p className={`text-lg font-medium ${sticker.stock > 0 ? "text-green-300" : "text-red-300"}`}>
                  {sticker.stock > 0 ? `${sticker.stock} unidades` : "Agotado"}
                </p>
              </div>
            </div>

            <AddToCartButton
              stickerId={sticker.id}
              disabled={sticker.stock <= 0}
              className={`w-full py-4 px-6 rounded-xl text-lg font-semibold shadow-sm transition-all transform active:scale-[0.98] ${
                sticker.stock > 0
                  ? "bg-primary text-white hover:bg-primary-dark hover:shadow-[0_0_25px_rgba(139,92,246,0.35)]"
                  : "bg-white/10 text-white/40 cursor-not-allowed"
              }`}
              title={sticker.stock > 0 ? "Añadir al carrito" : "Agotado"}
            />
            
            {sticker.stock > 0 && (
              <p className="text-center text-xs text-white/40 mt-3">
                Pago seguro con Stripe
              </p>
            )}
          </div>

          <LocalReviews stickerId={sticker.id} />
        </div>
      </div>
      </div>
    </div>
  );
}

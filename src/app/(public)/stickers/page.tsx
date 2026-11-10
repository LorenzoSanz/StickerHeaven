/**
 * PROPÓSITO: Página de Next.js para un segmento de navegación del usuario.
 * RESPONSABILIDAD: Código de soporte del proyecto.
 * DEPENDENCIAS: Ver imports del archivo para dependencias explícitas.
 * SEGURIDAD/INTEGRIDAD: Mantiene invariantes explícitas cuando aplica.
 * NOTAS: Documentar aquí decisiones no obvias y tradeoffs relevantes.
 */
import { getStickersAction } from "./_actions/get-stickers";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { Pagination } from "@/components/catalog/Pagination";
import type { Metadata } from "next";
import type { StickerDTO, SearchStickersQuery } from "@/modules/Catalog/public";
import { StickerFiltersBar } from "./_components/StickerFiltersBar";
import { serverApiFetch } from "@/lib/serverApi";

export const dynamic = "force-dynamic";

/**
 * =========================================================================================
 *                           CONFIGURACIÓN DE MODO DESARROLLO
 * =========================================================================================
 * 
 * Flag USE_MOCK_DATA:
 * -------------------
 * Ponlo en `true` para usar 20 stickers de ejemplo y facilitar el desarrollo de UI.
 * Ponlo en `false` para leer datos reales desde la base de datos vía `getStickersAction`.
 * 
 * VOLVER A PRODUCCIÓN:
 * ---------------------
 * 1. Cambia `const USE_MOCK_DATA = true;` a `false`.
 * 2. O elimina el bloque de mocks si ya no se necesita.
 * 
 * La implementación de datos mock está aislada en `getMockStickers` y la constante `MOCK_STICKERS`.
 * =========================================================================================
 */
const USE_MOCK_DATA = process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

const validateSortBy = (sortBy?: string): SearchStickersQuery["sortBy"] | undefined => {
  const validSortOptions: Array<NonNullable<SearchStickersQuery["sortBy"]>> = [
    "price_asc",
    "price_desc",
    "newest",
    "oldest",
    "newest_price_asc",
    "newest_price_desc",
    "oldest_price_asc",
    "oldest_price_desc",
  ];
  if (sortBy && validSortOptions.includes(sortBy as NonNullable<SearchStickersQuery["sortBy"]>)) {
    return sortBy as NonNullable<SearchStickersQuery["sortBy"]>;
  }
  return undefined;
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; minPrice?: string; maxPrice?: string; tags?: string; sort?: string; page?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;

  const baseTitle = "Catálogo de stickers";
  const title = params.search ? `Resultados para "${params.search}"` : baseTitle;

  const isFiltered = Boolean(params.search || params.tags || params.minPrice || params.maxPrice || params.sort || params.page);

  return {
    title,
    description: "Explora y compra stickers de alta calidad. Filtra por tags, precio y ordena por fecha o precio.",
    alternates: {
      canonical: "/stickers",
    },
    robots: {
      index: !isFiltered,
      follow: true,
    },
    openGraph: {
      title,
      description: "Explora y compra stickers de alta calidad.",
      url: "/stickers",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: "Explora y compra stickers de alta calidad.",
    },
  };
}

const MOCK_STICKERS: StickerDTO[] = [
  { id: '1', name: 'Calavera ciber', price: { amount: 4.99, currency: 'EUR' }, imageUrl: '/assets/test-images/Stickers/sticker1.jpg', stock: 10, description: 'Sticker de calavera ciber con neón.', tags: ['ciber', 'calavera'], ownerId: 'sys', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: '2', name: 'Atardecer retro', price: { amount: 3.99, currency: 'EUR' }, imageUrl: '/assets/test-images/Stickers/sticker2.jpg', stock: 5, description: 'Vibra retro de los 80.', tags: ['retro', 'atardecer'], ownerId: 'sys', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: '3', name: 'Gato guay', price: { amount: 5.99, currency: 'EUR' }, imageUrl: '/assets/test-images/Stickers/sticker3.jpg', stock: 15, description: 'Gato con gafas de sol.', tags: ['gato', 'animal'], ownerId: 'sys', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: '4', name: 'Corazón pixel', price: { amount: 2.99, currency: 'EUR' }, imageUrl: '/assets/test-images/Stickers/sticker4.png', stock: 20, description: 'Corazón estilo pixel art.', tags: ['pixel', 'corazón'], ownerId: 'sys', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: '5', name: 'Explorador espacial', price: { amount: 6.99, currency: 'EUR' }, imageUrl: '/assets/test-images/Stickers/sticker5.jpg', stock: 8, description: 'Astronauta en el espacio.', tags: ['espacio', 'astronauta'], ownerId: 'sys', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: '6', name: 'Consola gamer', price: { amount: 4.50, currency: 'EUR' }, imageUrl: '/assets/test-images/Stickers/sticker6.png', stock: 12, description: 'Consola retro.', tags: ['juegos', 'retro'], ownerId: 'sys', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: '7', name: 'Amante del café', price: { amount: 3.50, currency: 'EUR' }, imageUrl: '/assets/test-images/Stickers/sticker7.png', stock: 25, description: 'Taza de café caliente.', tags: ['café', 'bebida'], ownerId: 'sys', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: '8', name: 'Nota musical', price: { amount: 2.50, currency: 'EUR' }, imageUrl: '/assets/test-images/Stickers/sticker8.png', stock: 30, description: 'Nota musical de colores.', tags: ['música', 'arte'], ownerId: 'sys', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: '9', name: 'Nube arcoíris', price: { amount: 4.00, currency: 'EUR' }, imageUrl: '/assets/test-images/Stickers/sticker9.png', stock: 10, description: 'Nube feliz con arcoíris.', tags: ['arcoíris', 'mono'], ownerId: 'sys', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: '10', name: 'Rugido dino', price: { amount: 5.50, currency: 'EUR' }, imageUrl: '/assets/test-images/Stickers/sticker10.png', stock: 7, description: 'Dinosaurio adorable rugiendo.', tags: ['dino', 'animal'], ownerId: 'sys', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: '11', name: 'Porción de pizza', price: { amount: 3.00, currency: 'EUR' }, imageUrl: '/assets/test-images/Stickers/sticker11.png', stock: 18, description: 'Porción de pizza con queso.', tags: ['comida', 'pizza'], ownerId: 'sys', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: '12', name: 'Cohete', price: { amount: 6.50, currency: 'EUR' }, imageUrl: '/assets/test-images/Stickers/sticker12.png', stock: 4, description: 'Cohete despegando.', tags: ['espacio', 'cohete'], ownerId: 'sys', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: '13', name: 'Cabeza alien', price: { amount: 4.25, currency: 'EUR' }, imageUrl: '/assets/test-images/Stickers/sticker13.png', stock: 9, description: 'Cabeza de alien verde.', tags: ['alien', 'espacio'], ownerId: 'sys', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: '14', name: 'Robot colega', price: { amount: 5.75, currency: 'EUR' }, imageUrl: '/assets/test-images/Stickers/sticker14.png', stock: 6, description: 'Robot ayudante simpático.', tags: ['robot', 'tecnología'], ownerId: 'sys', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: '15', name: 'Poción mágica', price: { amount: 4.75, currency: 'EUR' }, imageUrl: '/assets/test-images/Stickers/sticker15.png', stock: 11, description: 'Poción mágica morada.', tags: ['magia', 'fantasía'], ownerId: 'sys', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: '16', name: 'Huevo de dragón', price: { amount: 7.99, currency: 'EUR' }, imageUrl: '/assets/test-images/Stickers/sticker16.png', stock: 3, description: 'Huevo de dragón misterioso.', tags: ['dragón', 'fantasía'], ownerId: 'sys', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: '17', name: 'Cuerno unicornio', price: { amount: 6.25, currency: 'EUR' }, imageUrl: '/assets/test-images/Stickers/sticker17.png', stock: 8, description: 'Cuerno de unicornio brillante.', tags: ['unicornio', 'fantasía'], ownerId: 'sys', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: '18', name: 'Sombrero de mago', price: { amount: 5.25, currency: 'EUR' }, imageUrl: '/assets/test-images/Stickers/sticker18.png', stock: 10, description: 'Sombrero puntiagudo de mago.', tags: ['mago', 'magia'], ownerId: 'sys', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: '19', name: 'Gema de cristal', price: { amount: 3.75, currency: 'EUR' }, imageUrl: '/assets/test-images/Stickers/sticker19.png', stock: 14, description: 'Gema de cristal azul.', tags: ['cristal', 'gema'], ownerId: 'sys', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: '20', name: 'Fantasma boo', price: { amount: 3.25, currency: 'EUR' }, imageUrl: '/assets/test-images/Stickers/sticker20.png', stock: 22, description: 'Fantasma simpático diciendo boo.', tags: ['fantasma', 'terror'], ownerId: 'sys', createdAt: '2025-01-01T00:00:00.000Z' },
];

function getMockStickers(page: number, limit: number) {
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    data: MOCK_STICKERS.slice(start, end),
    total: MOCK_STICKERS.length,
    page,
    limit,
    totalPages: Math.ceil(MOCK_STICKERS.length / limit)
  };
}

export default async function StickersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; minPrice?: string; maxPrice?: string; tags?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const limit = 6;
  
  let stickers: StickerDTO[] = [];
  let totalPages = 1;

  if (USE_MOCK_DATA) {
    // =========================================================================
    //                         MOCK DATA EXECUTION
    // =========================================================================
    // Usa el array hardcodeado en vez de la base de datos
    const result = getMockStickers(currentPage, limit);
    stickers = result.data;
    totalPages = result.totalPages;
  } else {
    // =========================================================================
    //                         PRODUCTION EXECUTION
    // =========================================================================
    // Real database fetch
    const query = {
      page: currentPage,
      limit,
      search: params.search,
      minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
      tags: params.tags ? params.tags.split(",") : undefined,
      sortBy: validateSortBy(params.sort),
    };
    
    const result = await getStickersAction(query);
    stickers = result.data;
    totalPages = result.meta.totalPages;
  }

  // POR QUÉ: Favoritos y wishlist deben ser privados; necesitamos identificar al usuario para aislar el storage.
  // QUÉ: Obtiene userId si hay sesión y lo pasa a los cards para habilitar favoritos solo autenticado.
  const viewerUserId = await serverApiFetch<{ user: { id: string } }>("/api/auth/me", { method: "GET" })
    .then((r) => r.user.id)
    .catch(() => null);

  const baseParams = new URLSearchParams();
  if (params.search) baseParams.set("search", params.search);
  if (params.minPrice) baseParams.set("minPrice", params.minPrice);
  if (params.maxPrice) baseParams.set("maxPrice", params.maxPrice);
  if (params.tags) baseParams.set("tags", params.tags);
  if (params.sort) baseParams.set("sort", params.sort);
  const baseUrl = `/stickers${baseParams.size ? `?${baseParams.toString()}` : ""}`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-30" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] opacity-30" />
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto pt-24 pb-20">
        <header className="mb-10 border-b border-white/10 pb-8">
          <h1 className="text-4xl md:text-5xl font-bold leading-[1.12] pb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4">
            {params.search ? `Resultados para "${params.search}"` : "Catálogo de stickers"}
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg">
            Explora nuestra colección exclusiva de stickers de alta calidad.
            {USE_MOCK_DATA && (
              <span className="text-yellow-500 ml-2 text-sm font-mono border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 rounded">
                MODO DEV: DATOS MOCK
              </span>
            )}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="lg:sticky lg:top-24">
              <StickerFiltersBar
                initialMinPrice={params.minPrice}
                initialMaxPrice={params.maxPrice}
                initialTags={params.tags}
                initialSort={params.sort}
              />
            </div>
          </aside>

          <section className="lg:col-span-8 xl:col-span-9">
            <CatalogGrid stickers={stickers} viewerUserId={viewerUserId} />

            <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl={baseUrl} />
          </section>
        </div>
      </div>
    </div>
  );
}

/**
 * POR QUÉ: Define los criterios para buscar stickers.
 * INTEGRIDAD: Pure data structure.
 * ESTRUCTURA: Capa Application (Query Side).
 */
export interface SearchStickersQuery {
  page?: number;
  limit?: number;
  search?: string;     // Text search (name, description)
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  ownerId?: string;
  // POR QUÉ: La UI permite ordenar por fecha y por precio de forma combinable, sin perder compatibilidad con el param existente.
  // QUÉ: Extiende el contrato de sortBy con combinaciones compuestas de (fecha + precio).
  sortBy?:
    | "price_asc"
    | "price_desc"
    | "newest"
    | "oldest"
    | "newest_price_asc"
    | "newest_price_desc"
    | "oldest_price_asc"
    | "oldest_price_desc";
}

/**
 * POR QUÉ: Representa un concepto del dominio.
 * INTEGRIDAD: Includes metadata for frontend pagination.
 * ESTRUCTURA: Capa Application (Query Side).
 */
export interface PaginatedStickersDTO {
  data: Array<{
    id: string;
    name: string;
    description: string;
    price: {
      amount: number;
      currency: string;
    };
    imageUrl: string;
    tags: string[];
    stock: number;
    ownerId: string;
    createdAt: string;
  }>;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

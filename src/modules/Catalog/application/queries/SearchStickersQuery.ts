export interface SearchStickersQuery {
  page?: number;
  limit?: number;
  search?: string;     // Text search (name, description)
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  ownerId?: string;
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

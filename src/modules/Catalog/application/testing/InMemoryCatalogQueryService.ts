import { CatalogQueryService } from "@/modules/Catalog/application/queries/CatalogQueryService";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { ListStickersDTO } from "@/modules/Catalog/application/list/ListStickersDTO";
import { GetStickerByIdDTO } from "@/modules/Catalog/application/get-by-id/GetStickerByIdDTO";
import { PaginatedStickersDTO, SearchStickersQuery } from "@/modules/Catalog/application/queries/SearchStickersQuery";
import { FakeStickerRepository } from "@/modules/Catalog/application/testing/FakeStickerRepository";
import { Sticker } from "@/modules/Catalog/domain/Sticker";

// Implementación de CatalogQueryService que usa memoria para almacenar stickers.
export class InMemoryCatalogQueryService implements CatalogQueryService {
  private stickers: GetStickerByIdDTO[] = [];
  private repository?: FakeStickerRepository;

  constructor(repository?: FakeStickerRepository) {
    this.repository = repository;
  }

  addSticker(dto: GetStickerByIdDTO) {
    if (this.repository) {
      return;
    }
    this.stickers.push(dto);
  }

  private async getAllStickers(): Promise<GetStickerByIdDTO[]> {
    if (this.repository) {
      const result = await this.repository.findAll();
      if (result.isFailure) return [];

      const entities = result.getValue();
      return entities.map(this.mapEntityToDTO);
    }
    return this.stickers;
  }

  private mapEntityToDTO(sticker: Sticker): GetStickerByIdDTO {
    return {
      id: sticker.id.value,
      ownerId: sticker.ownerId.value,
      name: sticker.name.value,
      description: sticker.description.value,
      price: {
        amount: sticker.price.amount,
        currency: sticker.price.currency,
      },
      imageUrl: sticker.imageUrl.value,
      tags: sticker.tags.map((t) => t.value),
      stock: sticker.stock.value,
      createdAt: sticker.createdAt.toISOString(),
    };
  }

  async listStickers(page = 1, limit = 10): Promise<Result<ListStickersDTO, DomainError>> {
    const all = await this.getAllStickers();

    const start = (page - 1) * limit;
    const end = start + limit;
    const pageItems = all.slice(start, end);

    return Result.ok({
      stickers: pageItems,
    });
  }

  async getStickerById(id: string): Promise<Result<GetStickerByIdDTO | null, DomainError>> {
    const all = await this.getAllStickers();
    const found = all.find((s) => s.id === id) || null;
    return Result.ok(found);
  }

  async search(query: SearchStickersQuery): Promise<Result<PaginatedStickersDTO, DomainError>> {
    let filtered = await this.getAllStickers();

    if (query.ownerId) {
      filtered = filtered.filter((s) => s.ownerId === query.ownerId);
    }

    if (typeof query.minPrice === "number") {
      filtered = filtered.filter((s) => s.price.amount >= query.minPrice!);
    }

    if (typeof query.maxPrice === "number") {
      filtered = filtered.filter((s) => s.price.amount <= query.maxPrice!);
    }

    if (Array.isArray(query.tags) && query.tags.length > 0) {
      filtered = filtered.filter((s) => s.tags.some((t) => query.tags!.includes(t)));
    }

    if (query.search) {
      const lowerSearch = query.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(lowerSearch) ||
          s.description.toLowerCase().includes(lowerSearch) ||
          s.tags.some((t) => t.toLowerCase().includes(lowerSearch))
      );
    }

    const sortBy = query.sortBy;
    const chain = <T>(...comparators: Array<(a: T, b: T) => number>) => {
      return (a: T, b: T) => {
        for (const cmp of comparators) {
          const r = cmp(a, b);
          if (r !== 0) return r;
        }
        return 0;
      };
    };

    const byIdAsc = (a: any, b: any) => String(a.id).localeCompare(String(b.id));
    const byCreatedAtAsc = (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    const byCreatedAtDesc = (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    const byPriceAsc = (a: any, b: any) => a.price.amount - b.price.amount;
    const byPriceDesc = (a: any, b: any) => b.price.amount - a.price.amount;

    if (sortBy === "price_asc") {
      filtered = filtered.toSorted(chain(byPriceAsc, byCreatedAtDesc, byIdAsc));
    } else if (sortBy === "price_desc") {
      filtered = filtered.toSorted(chain(byPriceDesc, byCreatedAtDesc, byIdAsc));
    } else if (sortBy === "oldest") {
      filtered = filtered.toSorted(chain(byCreatedAtAsc, byIdAsc));
    } else if (sortBy === "newest") {
      filtered = filtered.toSorted(chain(byCreatedAtDesc, byIdAsc));
    } else if (sortBy === "newest_price_asc") {
      filtered = filtered.toSorted(chain(byCreatedAtDesc, byPriceAsc, byIdAsc));
    } else if (sortBy === "newest_price_desc") {
      filtered = filtered.toSorted(chain(byCreatedAtDesc, byPriceDesc, byIdAsc));
    } else if (sortBy === "oldest_price_asc") {
      filtered = filtered.toSorted(chain(byCreatedAtAsc, byPriceAsc, byIdAsc));
    } else if (sortBy === "oldest_price_desc") {
      filtered = filtered.toSorted(chain(byCreatedAtAsc, byPriceDesc, byIdAsc));
    } else {
      filtered = filtered.toSorted(chain(byCreatedAtDesc, byIdAsc));
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = filtered.slice(start, end);

    return Result.ok({
      data: data.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        price: s.price,
        imageUrl: s.imageUrl,
        tags: s.tags,
        stock: s.stock,
        ownerId: s.ownerId,
        createdAt: s.createdAt,
      })),
      meta: {
        total: filtered.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(filtered.length / limit),
      },
    });
  }
}


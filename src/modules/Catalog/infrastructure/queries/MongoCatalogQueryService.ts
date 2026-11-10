import { CatalogQueryService } from "@/modules/Catalog/application/queries/CatalogQueryService";
import { ListStickersDTO, StickerDTO } from "@/modules/Catalog/application/list/ListStickersDTO";
import { GetStickerByIdDTO } from "@/modules/Catalog/application/get-by-id/GetStickerByIdDTO";
import { SearchStickersQuery, PaginatedStickersDTO } from "@/modules/Catalog/application/queries/SearchStickersQuery";
import { StickerModel, IStickerDocument } from "../persistence/mongoose/StickerModel";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { UnexpectedError } from "@/shared/domain/UnexpectedError";
import { escapeRegex } from "./escapeRegex";

// Implementación con Mongoose para CatalogQueryService.
export class MongoCatalogQueryService implements CatalogQueryService {
  async listStickers(page: number = 1, limit: number = 20): Promise<Result<ListStickersDTO, DomainError>> {
    try {
      const skip = (page - 1) * limit;
      const docs = await StickerModel.find().skip(skip).limit(limit).lean<IStickerDocument[]>();
      
      const stickers: StickerDTO[] = docs.map(doc => this.toDTO(doc));
      
      return Result.ok({ stickers });
    } catch (error) {
      return Result.fail(new UnexpectedError("Failed to list stickers"));
    }
  }

  async getStickerById(id: string): Promise<Result<GetStickerByIdDTO | null, DomainError>> {
    try {
      const doc = await StickerModel.findById(id).lean<IStickerDocument>();
      if (!doc) return Result.ok(null);
      return Result.ok(this.toDTO(doc));
    } catch (error) {
      return Result.fail(new UnexpectedError("Failed to get sticker"));
    }
  }

  async search(query: SearchStickersQuery): Promise<Result<PaginatedStickersDTO, DomainError>> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;

      type StickerSearchFilters = {
        $or?: Array<
          { name: { $regex: string; $options: string } } | { description: { $regex: string; $options: string } }
        >;
        "price.amount"?: { $gte?: number; $lte?: number };
        tags?: { $in: string[] };
        ownerId?: string;
      };

      const filters: StickerSearchFilters = {};

      if (query.search) {
        const pattern = escapeRegex(query.search);
        filters.$or = [
          { name: { $regex: pattern, $options: "i" } },
          { description: { $regex: pattern, $options: "i" } }
        ];
      }

      if (query.minPrice !== undefined || query.maxPrice !== undefined) {
        filters["price.amount"] = {};
        if (query.minPrice !== undefined) filters["price.amount"].$gte = query.minPrice;
        if (query.maxPrice !== undefined) filters["price.amount"].$lte = query.maxPrice;
      }

      if (query.tags && query.tags.length > 0) {
        filters.tags = { $in: query.tags };
      }

      if (query.ownerId) {
        filters.ownerId = query.ownerId;
      }

      const sort: Record<string, 1 | -1> = {};
      if (query.sortBy === "price_asc") {
        sort["price.amount"] = 1;
        sort.createdAt = -1;
      } else if (query.sortBy === "price_desc") {
        sort["price.amount"] = -1;
        sort.createdAt = -1;
      } else if (query.sortBy === "oldest") {
        sort.createdAt = 1;
      } else if (query.sortBy === "newest") {
        sort.createdAt = -1;
      } else if (query.sortBy === "newest_price_asc") {
        sort.createdAt = -1;
        sort["price.amount"] = 1;
      } else if (query.sortBy === "newest_price_desc") {
        sort.createdAt = -1;
        sort["price.amount"] = -1;
      } else if (query.sortBy === "oldest_price_asc") {
        sort.createdAt = 1;
        sort["price.amount"] = 1;
      } else if (query.sortBy === "oldest_price_desc") {
        sort.createdAt = 1;
        sort["price.amount"] = -1;
      } else {
        sort.createdAt = -1;
      }
      sort._id = 1;

      const [docs, total] = await Promise.all([
        StickerModel.find(filters).sort(sort).skip(skip).limit(limit).lean<IStickerDocument[]>(),
        StickerModel.countDocuments(filters)
      ]);

      const data = docs.map(doc => this.toDTO(doc));

      return Result.ok({
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      return Result.fail(new UnexpectedError("Search failed"));
    }
  }

  private toDTO(doc: IStickerDocument): GetStickerByIdDTO {
    return {
      id: doc._id,
      ownerId: doc.ownerId,
      name: doc.name,
      description: doc.description,
      price: doc.price,
      imageUrl: doc.imageUrl,
      tags: doc.tags,
      stock: doc.stock,
      createdAt: doc.createdAt.toISOString()
    };
  }
}

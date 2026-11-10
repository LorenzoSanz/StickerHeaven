import { CatalogQueryService } from "@/modules/Catalog/application/queries/CatalogQueryService";
import { DomainError } from "@/shared/domain/DomainError";
import { Result } from "@/shared/domain/Result";
import { ListStickersDTO, StickerDTO } from "@/modules/Catalog/application/list/ListStickersDTO";
import { GetStickerByIdDTO } from "@/modules/Catalog/application/get-by-id/GetStickerByIdDTO";
import { PaginatedStickersDTO, SearchStickersQuery } from "@/modules/Catalog/application/queries/SearchStickersQuery";

export class FakeCatalogQueryService implements CatalogQueryService {
  private stickers: GetStickerByIdDTO[] = [];

  addSticker(dto: GetStickerByIdDTO): void {
    this.stickers.push(dto);
  }

  async listStickers(): Promise<Result<ListStickersDTO, DomainError>> {
    const stickers: StickerDTO[] = this.stickers;
    return Result.ok({ stickers });
  }

  async getStickerById(id: string): Promise<Result<GetStickerByIdDTO | null, DomainError>> {
    const dto = this.stickers.find((s) => s.id === id) ?? null;
    return Result.ok(dto);
  }

  async search(_query: SearchStickersQuery): Promise<Result<PaginatedStickersDTO, DomainError>> {
    return Result.ok({
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    });
  }
}


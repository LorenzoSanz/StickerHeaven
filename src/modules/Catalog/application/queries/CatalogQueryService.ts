import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { ListStickersDTO } from "../list/ListStickersDTO";
import { GetStickerByIdDTO } from "../get-by-id/GetStickerByIdDTO";
import { SearchStickersQuery, PaginatedStickersDTO } from "./SearchStickersQuery";

export interface CatalogQueryService {
  listStickers(page?: number, limit?: number): Promise<Result<ListStickersDTO, DomainError>>;
  getStickerById(id: string): Promise<Result<GetStickerByIdDTO | null, DomainError>>;
  search(query: SearchStickersQuery): Promise<Result<PaginatedStickersDTO, DomainError>>;
}

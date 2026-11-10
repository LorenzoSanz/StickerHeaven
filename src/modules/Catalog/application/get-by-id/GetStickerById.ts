import { CatalogQueryService } from "../queries/CatalogQueryService";
import { GetStickerByIdDTO } from "./GetStickerByIdDTO";
import { Result } from "../../../../shared/domain/Result";
import { DomainError } from "../../../../shared/domain/DomainError";
import { StickerNotFoundError } from "../../domain/Errors";

export class GetStickerById {
  constructor(private queryService: CatalogQueryService) {}

  async execute(id: string): Promise<Result<GetStickerByIdDTO, DomainError>> {
    if (!id) {
      return Result.fail(new DomainError("Sticker id is required"));
    }

    const result = await this.queryService.getStickerById(id);
    
    if (result.isFailure) {
        return Result.fail(result.error!);
    }

    const dto = result.getValue();

    if (!dto) {
      return Result.fail(new StickerNotFoundError(id));
    }

    return Result.ok(dto);
  }
}

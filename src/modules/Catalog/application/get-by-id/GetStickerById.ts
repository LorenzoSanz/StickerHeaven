/**
 * POR QUÉ: Query para obtener un sticker individual por id (read-model).
 * INTEGRIDAD: Verifica existencia y retorna un DTO (no entidad) para consumo de UI/API.
 * ESTRUCTURA: Capa Application - Caso de uso.
 */
import { CatalogQueryService } from "../queries/CatalogQueryService";
import { GetStickerByIdDTO } from "./GetStickerByIdDTO";
import { Result } from "../../../../shared/domain/Result";
import { DomainError } from "../../../../shared/domain/DomainError";
import { StickerNotFoundError } from "../../domain/Errors";

/**
 * POR QUÉ: Mantiene la lectura encapsulada sobre CatalogQueryService para evitar que la UI acceda a persistencia directamente.
 */
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

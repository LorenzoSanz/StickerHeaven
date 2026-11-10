import { CatalogQueryService } from "../queries/CatalogQueryService";
import { ListStickersDTO } from "./ListStickersDTO";
import { Result } from "../../../../shared/domain/Result";
import { DomainError } from "../../../../shared/domain/DomainError";

export interface ListStickersRequestDTO {
  ownerId?: string; // Se mantiene por compatibilidad, aunque no se usa en el listado simple
}

export class ListStickers {
  constructor(private queryService: CatalogQueryService) {}

  /**
   * Obtiene una lista de todos los stickers.
   *
   * @param request - Parámetros opcionales de filtrado (actualmente no se usan).
   * @returns Resultado que contiene la lista de stickers.
   */
  async execute(request?: ListStickersRequestDTO): Promise<Result<ListStickersDTO, DomainError>> {
    // Nota: El query service actual lista todos los stickers con paginación.
    // Filtrar por ownerId requeriría actualizar la interfaz de QueryService.
    // Por ahora delegamos en el método de listado simple.
    return this.queryService.listStickers();
  }
}

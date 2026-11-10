import { Sticker } from "./Sticker";
import { StickerId } from "@/shared/domain/StickerId";
import { Result } from "../../../shared/domain/Result";
import { DomainError } from "../../../shared/domain/DomainError";

export interface StickerRepository {
  /**
   * Persiste una entidad Sticker.
   * @param sticker - Sticker a guardar.
   */
  save(sticker: Sticker): Promise<Result<void, DomainError>>;

  /**
   * Busca un sticker por su ID.
   * @param id - StickerId.
   */
  findById(id: StickerId): Promise<Result<Sticker | null, DomainError>>;

  /**
   * Obtiene todos los stickers.
   */
  findAll(): Promise<Result<Sticker[], DomainError>>;

  /**
   * Busca múltiples stickers por sus IDs.
   * @param ids - Array de StickerIds.
   */
  findByIds(ids: StickerId[]): Promise<Result<Sticker[], DomainError>>;

  /**
   * Elimina un sticker.
   * @param id - ID del sticker a eliminar.
   */
  delete(id: StickerId): Promise<Result<void, DomainError>>;
}

import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";

// Interfaz para servicios de almacenamiento de imágenes.
export interface IImageStorageService {
  /**
   * Sube una imagen y devuelve la URL pública.
   * @param imageBuffer - raw image data.
   * @param filename - original filename (optional, for metadata).
   */
  upload(imageBuffer: Buffer, filename?: string): Promise<Result<string, DomainError>>;

  /**
   * Elimina an image by its URL or ID.
   * @param imageUrl - URL pública de la imagen.
   */
  delete(imageUrl: string): Promise<Result<void, DomainError>>;
}

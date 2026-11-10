
import { v2 as cloudinary } from "cloudinary";
import { IImageStorageService } from "../../domain/gateways/IImageStorageService";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { env } from "@/config/env";
import { ILogger } from "@/shared/domain/ILogger";

export class CloudinaryImageStorageService implements IImageStorageService {
  constructor(private logger: ILogger) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME!,
      api_key: env.CLOUDINARY_API_KEY!,
      api_secret: env.CLOUDINARY_API_SECRET!,
      secure: true,
    });
  }

  async upload(imageBuffer: Buffer, filename?: string): Promise<Result<string, DomainError>> {
    return new Promise((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "sticker-heaven/stickers",
          resource_type: "image",
          public_id: filename ? filename.split(".")[0] : undefined, // Optional: use filename as ID
        },
        (error, result) => {
          if (error) {
            this.logger.error("Cloudinary upload failed:", error);
            resolve(Result.fail(new DomainError("Failed to upload image to Cloudinary")));
            return;
          }

          if (!result || !result.secure_url) {
            this.logger.error("Cloudinary upload returned no URL");
            resolve(Result.fail(new DomainError("Cloudinary upload returned invalid response")));
            return;
          }

          this.logger.info(`Image uploaded successfully: ${result.secure_url}`);
          resolve(Result.ok(result.secure_url));
        }
      );

      // Escribimos el buffer de imagen en el stream de carga.
      uploadStream.end(imageBuffer);
    });
  }

  async delete(imageUrl: string): Promise<Result<void, DomainError>> {
    try {
      // Extraemos el public_id de la URL
      // Ejemplo: https://res.cloudinary.com/demo/image/upload/v1570979139/sticker-heaven/stickers/my-sticker.jpg
      const regex = /\/sticker-heaven\/stickers\/([^/.]+)/;
      const match = imageUrl.match(regex);
      
      if (!match) {
        this.logger.warn(`Could not extract public_id from URL: ${imageUrl}`);
        // Consideramos esto un éxito (idempotente) o falla dependiendo de la estrictenza.
        // Devolvemos OK para evitar bloquear eliminaciones si el formato de URL cambia.
        return Result.ok();
      }

      const publicId = `sticker-heaven/stickers/${match[1]}`;

      await cloudinary.uploader.destroy(publicId);
      this.logger.info(`Image deleted from Cloudinary: ${publicId}`);
      return Result.ok();
    } catch (error) {
      this.logger.error("Cloudinary delete failed:", error);
      return Result.fail(new DomainError("Failed to delete image from Cloudinary"));
    }
  }
}

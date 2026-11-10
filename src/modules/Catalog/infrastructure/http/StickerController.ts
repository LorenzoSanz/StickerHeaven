import { Context } from "hono";
import { CreateStickerWithImage } from "@/modules/Catalog/application/create-with-image/CreateStickerWithImage";
import { ListStickers } from "@/modules/Catalog/application/list/ListStickers";
import { GetStickerById } from "@/modules/Catalog/application/get-by-id/GetStickerById";
import { DeleteSticker } from "@/modules/Catalog/application/delete/DeleteSticker";
import { StickerNotFoundError, StickerOwnershipError } from "@/modules/Catalog/domain/Errors";
import { ILogger } from "@/shared/domain/ILogger";
import { CatalogQueryService } from "@/modules/Catalog/application/queries/CatalogQueryService";
import { UpdateSticker } from "@/modules/Catalog/application/update/UpdateSticker";
import { UpdateStickerDTO, UpdateStickerSchema } from "@/modules/Catalog/application/update/UpdateStickerDTO";
import { UpdateStickerWithImage } from "@/modules/Catalog/application/update-with-image/UpdateStickerWithImage";
import { HttpStatus } from "@/shared/infrastructure/http/HttpStatus";

const MAX_PAGE_SIZE = 50;
const MAX_PAGE = 1000;
const MAX_SEARCH_LENGTH = 100;

// Query strings are untrusted: a missing, non-numeric or huge value falls back to a safe range
// instead of reaching the database as NaN or as a request for the whole collection.
function parseBoundedInt(raw: string | undefined, fallback: number, min: number, max: number): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

export class StickerController {
  constructor(
    private createStickerWithImage: CreateStickerWithImage,
    private updateSticker: UpdateSticker,
    private updateStickerWithImage: UpdateStickerWithImage,
    private listStickers: ListStickers,
    private getStickerById: GetStickerById,
    private deleteSticker: DeleteSticker,
    private catalogQueryService: CatalogQueryService,
    private logger: ILogger
  ) {}

  private readonly maxImageBytes = 5 * 1024 * 1024;
  private readonly allowedImageMimeTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

  private validateImageUpload(file: File): string | null {
    if (!this.allowedImageMimeTypes.has(file.type)) {
      return "Tipo de imagen no soportado (usa PNG, JPEG o WEBP)";
    }

    if (typeof file.size === "number" && file.size > this.maxImageBytes) {
      return "La imagen excede el tamaño máximo permitido (5MB)";
    }

    return null;
  }

  private validateSortBy(
    sortBy?: string
  ):
    | "price_asc"
    | "price_desc"
    | "newest"
    | "oldest"
    | "newest_price_asc"
    | "newest_price_desc"
    | "oldest_price_asc"
    | "oldest_price_desc"
    | undefined {
    const validSortOptions = [
      "price_asc",
      "price_desc",
      "newest",
      "oldest",
      "newest_price_asc",
      "newest_price_desc",
      "oldest_price_asc",
      "oldest_price_desc",
    ];
    if (sortBy && validSortOptions.includes(sortBy)) {
      return sortBy as
        | "price_asc"
        | "price_desc"
        | "newest"
        | "oldest"
        | "newest_price_asc"
        | "newest_price_desc"
        | "oldest_price_asc"
        | "oldest_price_desc";
    }
    return undefined;
  }

  async search(c: Context): Promise<Response> {
    try {
      const query = c.req.query();

      const parseOptionalFiniteNumber = (raw?: string): number | undefined => {
        if (typeof raw !== "string" || !raw.trim()) return undefined;
        const n = Number.parseFloat(raw);
        return Number.isFinite(n) ? n : undefined;
      };

      const parseTags = (raw?: string): string[] | undefined => {
        if (typeof raw !== "string" || !raw.trim()) return undefined;
        const normalized = raw
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean);
        if (normalized.length === 0) return undefined;
        return Array.from(new Set(normalized));
      };
      
      const searchParams = {
        page: parseBoundedInt(query.page, 1, 1, MAX_PAGE),
        limit: parseBoundedInt(query.limit, 20, 1, MAX_PAGE_SIZE),
        search: query.search?.trim().slice(0, MAX_SEARCH_LENGTH) || undefined,
        minPrice: parseOptionalFiniteNumber(query.minPrice),
        maxPrice: parseOptionalFiniteNumber(query.maxPrice),
        tags: parseTags(query.tags),
        ownerId: query.ownerId,
        sortBy: this.validateSortBy(query.sortBy)
      };

      const result = await this.catalogQueryService.search(searchParams);

      if (result.isFailure) {
        return c.json({ error: result.error!.message }, HttpStatus.BAD_REQUEST);
      }

      return c.json(result.getValue(), HttpStatus.OK);
    } catch (error) {
      this.logger.error("Search Stickers Error:", error);
      return c.json({ error: "Error interno del servidor" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Crea un nuevo sticker.
   * POST /stickers
   * Soporta multipart/form-data para subir la imagen.
   */
  async create(c: Context): Promise<Response> {
    try {
      const ownerId = c.get("userId") as string;
      if (!ownerId) {
        return c.json({ error: "No autorizado: falta identidad de usuario" }, HttpStatus.UNAUTHORIZED);
      }

      const contentType = c.req.header("content-type") || "";
      if (contentType.includes("multipart/form-data")) {
        const formData = await c.req.parseBody();
        const file = formData["image"];
        if (!(file instanceof File)) {
          return c.json({ error: "La imagen es obligatoria" }, HttpStatus.BAD_REQUEST);
        }

        const imageError = this.validateImageUpload(file);
        if (imageError) {
          return c.json({ error: imageError }, HttpStatus.BAD_REQUEST);
        }

        const tags =
          typeof formData["tags"] === "string"
            ? formData["tags"].split(",").map((t) => t.trim()).filter(Boolean)
            : [];

        const result = await this.createStickerWithImage.execute({
          ownerId,
          name: String(formData["name"] ?? ""),
          description: String(formData["description"] ?? ""),
          priceAmount: parseFloat(String(formData["priceAmount"] ?? "")),
          priceCurrency: String(formData["priceCurrency"] ?? ""),
          stock: parseInt(String(formData["stock"] ?? ""), 10),
          tags,
          image: { buffer: Buffer.from(await file.arrayBuffer()), filename: file.name },
        });

      if (result.isFailure) {
        this.logger.warn("Create sticker failed", { ownerId, error: result.error!.message });
        return c.json({ error: result.error!.message }, HttpStatus.BAD_REQUEST);
      }

      const { id } = result.getValue();
      this.logger.info("Sticker created successfully", { stickerId: id, ownerId });
      return c.json({ message: "Sticker creado correctamente", id }, HttpStatus.CREATED);
      }

      return c.json({ error: "Tipo de contenido no soportado" }, HttpStatus.UNSUPPORTED_MEDIA_TYPE);
    } catch (error) {
      this.logger.error("Create Sticker Error:", error);
      return c.json({ error: "Error interno del servidor" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(c: Context): Promise<Response> {
    try {
      const id = c.req.param("id");
      if (!id) {
        return c.json({ error: "Falta el id" }, HttpStatus.BAD_REQUEST);
      }
      const ownerId = c.get("userId") as string;

      if (!ownerId) {
        return c.json({ error: "No autorizado: falta identidad de usuario" }, HttpStatus.UNAUTHORIZED);
      }

      const contentType = c.req.header("content-type") || "";
      const isMultipart = contentType.includes("multipart/form-data");

      let dto: UpdateStickerDTO;
      let file: File | null = null;

      if (isMultipart) {
        const formData = await c.req.parseBody();
        const tags =
          typeof formData["tags"] === "string"
            ? formData["tags"].split(",").map((t) => t.trim()).filter(Boolean)
            : undefined;

        const parsed = UpdateStickerSchema.safeParse({
          name: typeof formData["name"] === "string" ? formData["name"] : undefined,
          description: typeof formData["description"] === "string" ? formData["description"] : undefined,
          price:
            typeof formData["priceAmount"] === "string" && typeof formData["priceCurrency"] === "string"
              ? { amount: parseFloat(formData["priceAmount"]), currency: formData["priceCurrency"] }
              : undefined,
          stock: typeof formData["stock"] === "string" ? parseInt(formData["stock"], 10) : undefined,
          tags,
        });

        if (!parsed.success) {
          return c.json({ error: parsed.error.issues[0]?.message ?? "Entrada inválida" }, HttpStatus.BAD_REQUEST);
        }

        dto = { ...parsed.data, stickerId: id, ownerId };
        file = formData["image"] instanceof File ? formData["image"] : null;
      } else {
        const json = (await c.req.json()) as Partial<UpdateStickerDTO>;
        const parsed = UpdateStickerSchema.safeParse(json);
        if (!parsed.success) {
          return c.json({ error: parsed.error.issues[0]?.message ?? "Entrada inválida" }, HttpStatus.BAD_REQUEST);
        }
        dto = { ...parsed.data, stickerId: id, ownerId };
      }

      if (file) {
        const imageError = this.validateImageUpload(file);
        if (imageError) {
          return c.json({ error: imageError }, HttpStatus.BAD_REQUEST);
        }
      }

      const result = file
        ? await this.updateStickerWithImage.execute({
            ...dto,
            image: { buffer: Buffer.from(await file.arrayBuffer()), filename: file.name },
          })
        : await this.updateSticker.execute(dto);

      if (result.isFailure) {
        if (result.error instanceof StickerNotFoundError) {
            return c.json({ error: result.error.message }, HttpStatus.NOT_FOUND);
        }
        if (result.error instanceof StickerOwnershipError) {
            return c.json({ error: result.error.message }, HttpStatus.FORBIDDEN);
        }
        return c.json({ error: result.error!.message }, HttpStatus.BAD_REQUEST);
      }

      this.logger.info("Sticker updated successfully", { stickerId: id, ownerId });
      return c.json({ message: "Sticker actualizado correctamente" }, HttpStatus.OK);
    } catch (error) {
      this.logger.error("Update Sticker Error:", error);
      return c.json({ error: "Error interno del servidor" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async list(c: Context): Promise<Response> {
    try {
      const result = await this.listStickers.execute();

      if (result.isFailure) {
        return c.json({ error: result.error!.message }, HttpStatus.BAD_REQUEST);
      }

      return c.json(result.getValue(), HttpStatus.OK);
    } catch (error) {
      this.logger.error("List Stickers Error:", error);
      return c.json({ error: "Error interno del servidor" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getById(c: Context): Promise<Response> {
    try {
      const id = c.req.param("id");
      if (!id) {
        return c.json({ error: "Falta el id" }, HttpStatus.BAD_REQUEST);
      }
      const result = await this.getStickerById.execute(id);

      if (result.isFailure) {
        if (result.error instanceof StickerNotFoundError) {
          return c.json({ error: result.error.message }, HttpStatus.NOT_FOUND);
        }
        return c.json({ error: result.error!.message }, HttpStatus.BAD_REQUEST);
      }

      return c.json(result.getValue(), HttpStatus.OK);
    } catch (error) {
      this.logger.error("Get Sticker By Id Error:", error);
      return c.json({ error: "Error interno del servidor" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(c: Context): Promise<Response> {
    try {
      const id = c.req.param("id");
      if (!id) {
        return c.json({ error: "Falta el id" }, HttpStatus.BAD_REQUEST);
      }
      const requesterId = c.get("userId") as string;

      if (!requesterId) {
        return c.json({ error: "No autorizado: falta identidad de usuario" }, HttpStatus.UNAUTHORIZED);
      }

      const result = await this.deleteSticker.execute({
        stickerId: id,
        requesterId
      });

      if (result.isFailure) {
        if (result.error instanceof StickerNotFoundError) {
           return c.json({ error: result.error.message }, HttpStatus.NOT_FOUND);
        }
        if (result.error instanceof StickerOwnershipError) {
           this.logger.warn("Unauthorized delete attempt", { stickerId: id, requesterId });
           return c.json({ error: result.error.message }, HttpStatus.FORBIDDEN);
        }
        return c.json({ error: result.error!.message }, HttpStatus.BAD_REQUEST);
      }

      this.logger.info("Sticker deleted successfully", { stickerId: id, requesterId });
      return c.json({ message: "Sticker eliminado correctamente" }, HttpStatus.OK);
    } catch (error) {
      this.logger.error("Delete Sticker Error:", error);
      return c.json({ error: "Error interno del servidor" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

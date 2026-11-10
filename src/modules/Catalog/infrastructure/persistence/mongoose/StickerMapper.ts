import { Sticker } from "../../../domain/Sticker";
import { StickerName } from "../../../domain/StickerName";
import { StickerDescription } from "../../../domain/StickerDescription";
import { Money } from "@/shared/domain/Money";
import { StickerUrl } from "../../../domain/StickerUrl";
import { StickerStock } from "../../../domain/StickerStock";
import { IStickerDocument } from "./StickerModel";

import { StickerTag } from "../../../domain/StickerTag";
import { OwnerId } from "../../../domain/OwnerId";
import { StickerId } from "../../../domain/StickerId";

export class StickerMapper {
  public static toDomain(raw: IStickerDocument): Sticker {
    const ownerIdOrError = OwnerId.create(raw.ownerId);
    const nameOrError = StickerName.create(raw.name);
    const descriptionOrError = StickerDescription.create(raw.description);
    const priceOrError = Money.create(raw.price.amount, raw.price.currency);
    const stockOrError = StickerStock.create(raw.stock ?? 0);
    const imageUrlOrError = StickerUrl.create(raw.imageUrl);
    const stickerIdResult = StickerId.create(raw._id.toString());

    // Mapear tags (strings) a Value Objects.
    const tags: StickerTag[] = [];
    for (const rawTag of raw.tags) {
      const tagOrError = StickerTag.create(rawTag);
      if (tagOrError.isFailure) {
        // En producción podríamos registrar esto y omitir el tag inválido, o corregirlo.
        // Por ahora, fallamos rápido para detectar corrupción de datos o reglas de validación más estrictas.
        throw new Error(`Invalid sticker tag in DB: ${tagOrError.error}`);
      }
      tags.push(tagOrError.getValue());
    }

    // Si falla la creación de algún Value Object, puede indicar datos corruptos en BD o reglas más estrictas que antes.
    // Por ahora lanzamos error para visibilizar el problema; en un entorno productivo se puede degradar con manejo más tolerante.
    if (ownerIdOrError.isFailure) throw new Error(`Invalid owner id in DB: ${ownerIdOrError.error}`);
    if (nameOrError.isFailure) throw new Error(`Invalid sticker name in DB: ${nameOrError.error}`);
    if (descriptionOrError.isFailure) throw new Error(`Invalid sticker description in DB: ${descriptionOrError.error}`);
    if (priceOrError.isFailure) throw new Error(`Invalid sticker price in DB: ${priceOrError.error}`);
    if (stockOrError.isFailure) throw new Error(`Invalid sticker stock in DB: ${stockOrError.error}`);
    if (imageUrlOrError.isFailure) throw new Error(`Invalid sticker image url in DB: ${imageUrlOrError.error}`);
    if (stickerIdResult.isFailure) throw new Error(`Invalid sticker id in DB: ${raw._id}`);

    // Usa reconstitute para restaurar la entidad desde datos de persistencia
    return Sticker.reconstitute(stickerIdResult.getValue(), {
      ownerId: ownerIdOrError.getValue(),
      name: nameOrError.getValue(),
      description: descriptionOrError.getValue(),
      price: priceOrError.getValue(),
      stock: stockOrError.getValue(),
      imageUrl: imageUrlOrError.getValue(),
      tags: tags,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      version: raw.__v,
    });
  }

  public static toPersistence(sticker: Sticker): Partial<IStickerDocument> {
    return {
      _id: sticker.id.value,
      ownerId: sticker.ownerId.value,
      name: sticker.name.value,
      description: sticker.description.value,
      price: {
        amount: sticker.price.amount,
        currency: sticker.price.currency,
      },
      stock: sticker.stock.value,
      imageUrl: sticker.imageUrl.value,
      tags: sticker.tags.map(t => t.value),
      createdAt: sticker.createdAt,
      updatedAt: sticker.updatedAt,
    };
  }
}

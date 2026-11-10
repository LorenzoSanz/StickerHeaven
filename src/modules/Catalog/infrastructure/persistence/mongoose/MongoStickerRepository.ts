import { StickerRepository } from "../../../domain/StickerRepository";
import { Sticker } from "../../../domain/Sticker";
import { StickerModel, IStickerDocument } from "./StickerModel";
import { StickerMapper } from "./StickerMapper";
import { StickerId } from "@/shared/domain/StickerId";
import { OwnerId } from "@/modules/Catalog/domain/OwnerId";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { ConcurrencyError } from "@/shared/domain/ConcurrencyError";

// Implementación con Mongoose para StickerRepository.
export class MongoStickerRepository implements StickerRepository {
  async save(sticker: Sticker): Promise<Result<void, DomainError>> {
    try {
      const raw = StickerMapper.toPersistence(sticker);
      
      if (sticker.version === 0) {
        await StickerModel.findByIdAndUpdate(raw._id, raw, { upsert: true, new: true });
      } else {
        const result = await StickerModel.findOneAndUpdate(
          { _id: raw._id, __v: sticker.version },
          { ...raw, $inc: { __v: 1 } },
          { new: true }
        );

        if (!result) {
          return Result.fail(new ConcurrencyError("Sticker", sticker.id.value));
        }
      }
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new DomainError(`Failed to save sticker: ${error}`));
    }
  }

  async findById(id: StickerId): Promise<Result<Sticker | null, DomainError>> {
    try {
      const raw = await StickerModel.findById(id.value).lean<IStickerDocument>();
      if (!raw) return Result.ok(null);
      return Result.ok(StickerMapper.toDomain(raw));
    } catch (error) {
      return Result.fail(new DomainError(`Failed to find sticker: ${error}`));
    }
  }

  async findAll(ownerId?: OwnerId): Promise<Result<Sticker[], DomainError>> {
    try {
      const filter = ownerId ? { ownerId: ownerId.value } : {};
      const raws = await StickerModel.find(filter).sort({ createdAt: -1 }).lean<IStickerDocument[]>();
      return Result.ok(raws.map(StickerMapper.toDomain));
    } catch (error) {
      return Result.fail(new DomainError(`Failed to find all stickers: ${error}`));
    }
  }

  async findByIds(ids: StickerId[]): Promise<Result<Sticker[], DomainError>> {
    try {
      const rawIds = ids.map(id => id.value);
      const raws = await StickerModel.find({ _id: { $in: rawIds } }).lean<IStickerDocument[]>();
      return Result.ok(raws.map(StickerMapper.toDomain));
    } catch (error) {
      return Result.fail(new DomainError(`Failed to find stickers by ids: ${error}`));
    }
  }

  async delete(id: StickerId): Promise<Result<void, DomainError>> {
    try {
      await StickerModel.findByIdAndDelete(id.value);
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new DomainError(`Failed to delete sticker: ${error}`));
    }
  }
}

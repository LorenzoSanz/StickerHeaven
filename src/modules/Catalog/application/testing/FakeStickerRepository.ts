import { StickerRepository } from "@/modules/Catalog/domain/StickerRepository";
import { Sticker } from "@/modules/Catalog/domain/Sticker";
import { StickerId } from "@/modules/Catalog/domain/StickerId";
import { DomainError } from "@/shared/domain/DomainError";
import { Result } from "@/shared/domain/Result";

export class FakeStickerRepository implements StickerRepository {
  private store = new Map<string, Sticker>();

  async save(sticker: Sticker): Promise<Result<void, DomainError>> {
    this.store.set(sticker.id.value, sticker);
    return Result.ok(undefined);
  }

  async findById(id: StickerId): Promise<Result<Sticker | null, DomainError>> {
    return Result.ok(this.store.get(id.value) ?? null);
  }

  async findAll(): Promise<Result<Sticker[], DomainError>> {
    return Result.ok(Array.from(this.store.values()));
  }

  async findByIds(ids: StickerId[]): Promise<Result<Sticker[], DomainError>> {
    const found: Sticker[] = [];
    for (const id of ids) {
      const s = this.store.get(id.value);
      if (s) found.push(s);
    }
    return Result.ok(found);
  }

  async delete(id: StickerId): Promise<Result<void, DomainError>> {
    this.store.delete(id.value);
    return Result.ok(undefined);
  }
}


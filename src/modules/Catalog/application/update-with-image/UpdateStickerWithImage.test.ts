import { describe, it, expect, mock } from "bun:test";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import type { StickerRepository } from "@/modules/Catalog/domain/StickerRepository";
import type { IImageStorageService } from "@/modules/Catalog/domain/gateways/IImageStorageService";
import { Sticker } from "@/modules/Catalog/domain/Sticker";
import { OwnerId } from "@/modules/Catalog/domain/OwnerId";
import { StickerName } from "@/modules/Catalog/domain/StickerName";
import { StickerDescription } from "@/modules/Catalog/domain/StickerDescription";
import { StickerStock } from "@/modules/Catalog/domain/StickerStock";
import { StickerUrl } from "@/modules/Catalog/domain/StickerUrl";
import { Money } from "@/shared/domain/Money";
import type { StickerId } from "@/modules/Catalog/domain/StickerId";
import { UpdateStickerWithImage } from "./UpdateStickerWithImage";
import { StickerOwnershipPolicy } from "../policies/StickerOwnershipPolicy";

// Tests que demuestren la lógica de negocio de la actualización de stickers con imágenes.
describe("UpdateStickerWithImage", () => {
  it("uploads and replaces image, then deletes previous image", async () => {
    const owner = OwnerId.create(crypto.randomUUID()).getValue();
    const sticker = Sticker.create(
      owner,
      StickerName.create("Old").getValue(),
      StickerDescription.create("Desc").getValue(),
      Money.create(10, "USD").getValue(),
      StickerStock.create(3).getValue(),
      StickerUrl.create("https://example.com/old.png").getValue(),
      ["aa"]
    ).getValue();

    const repo: StickerRepository = {
      save: mock(async () => Result.ok<void, DomainError>()),
      findById: mock(async (_id: StickerId) => Result.ok<Sticker | null, DomainError>(sticker)),
      findAll: mock(async () => Result.ok<Sticker[], DomainError>([])),
      findByIds: mock(async () => Result.ok<Sticker[], DomainError>([])),
      delete: mock(async () => Result.ok<void, DomainError>()),
    };

    const upload = mock(async () => Result.ok<string, DomainError>("https://example.com/new.png"));
    const del = mock(async () => Result.ok<void, DomainError>());
    const imageStorage: IImageStorageService = { upload, delete: del };

    const useCase = new UpdateStickerWithImage(repo, imageStorage, new StickerOwnershipPolicy());

    const res = await useCase.execute({
      stickerId: sticker.id.value,
      ownerId: owner.value,
      name: "New",
      description: "New desc",
      price: { amount: 11, currency: "USD" },
      stock: 2,
      tags: ["bb"],
      image: { buffer: Buffer.from([1, 2, 3]), filename: "new.png" },
    });

    expect(res.isSuccess).toBe(true);
    expect(upload).toHaveBeenCalledTimes(1);
    expect((repo.save as unknown as ReturnType<typeof mock>)).toHaveBeenCalledTimes(1);
    expect(sticker.imageUrl.value).toBe("https://example.com/new.png");
    expect(del).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledWith("https://example.com/old.png");
  });

  it("does not upload if requester is not the owner", async () => {
    const owner = OwnerId.create(crypto.randomUUID()).getValue();
    const sticker = Sticker.create(
      owner,
      StickerName.create("Old").getValue(),
      StickerDescription.create("Desc").getValue(),
      Money.create(10, "USD").getValue(),
      StickerStock.create(3).getValue(),
      StickerUrl.create("https://example.com/old.png").getValue(),
      []
    ).getValue();

    const repo: StickerRepository = {
      save: mock(async () => Result.ok<void, DomainError>()),
      findById: mock(async (_id: StickerId) => Result.ok<Sticker | null, DomainError>(sticker)),
      findAll: mock(async () => Result.ok<Sticker[], DomainError>([])),
      findByIds: mock(async () => Result.ok<Sticker[], DomainError>([])),
      delete: mock(async () => Result.ok<void, DomainError>()),
    };

    const upload = mock(async () => Result.ok<string, DomainError>("https://example.com/new.png"));
    const imageStorage: IImageStorageService = {
      upload,
      delete: mock(async () => Result.ok<void, DomainError>()),
    };

    const useCase = new UpdateStickerWithImage(repo, imageStorage, new StickerOwnershipPolicy());

    const res = await useCase.execute({
      stickerId: sticker.id.value,
      ownerId: crypto.randomUUID(),
      image: { buffer: Buffer.from([1]), filename: "new.png" },
    });

    expect(res.isFailure).toBe(true);
    expect(upload).toHaveBeenCalledTimes(0);
  });

  it("deletes uploaded image if persistence fails", async () => {
    const owner = OwnerId.create(crypto.randomUUID()).getValue();
    const sticker = Sticker.create(
      owner,
      StickerName.create("Old").getValue(),
      StickerDescription.create("Desc").getValue(),
      Money.create(10, "USD").getValue(),
      StickerStock.create(3).getValue(),
      StickerUrl.create("https://example.com/old.png").getValue(),
      []
    ).getValue();

    const repo: StickerRepository = {
      save: mock(async () => Result.fail<void, DomainError>(new DomainError("save failed"))),
      findById: mock(async (_id: StickerId) => Result.ok<Sticker | null, DomainError>(sticker)),
      findAll: mock(async () => Result.ok<Sticker[], DomainError>([])),
      findByIds: mock(async () => Result.ok<Sticker[], DomainError>([])),
      delete: mock(async () => Result.ok<void, DomainError>()),
    };

    const upload = mock(async () => Result.ok<string, DomainError>("https://example.com/new.png"));
    const del = mock(async () => Result.ok<void, DomainError>());
    const imageStorage: IImageStorageService = { upload, delete: del };

    const useCase = new UpdateStickerWithImage(repo, imageStorage, new StickerOwnershipPolicy());

    const res = await useCase.execute({
      stickerId: sticker.id.value,
      ownerId: owner.value,
      image: { buffer: Buffer.from([1]), filename: "new.png" },
    });

    expect(res.isFailure).toBe(true);
    expect(upload).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledWith("https://example.com/new.png");
  });
});

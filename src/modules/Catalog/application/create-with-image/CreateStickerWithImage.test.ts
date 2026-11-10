import { describe, it, expect, mock } from "bun:test";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import type { StickerRepository } from "@/modules/Catalog/domain/StickerRepository";
import type { IImageStorageService } from "@/modules/Catalog/domain/gateways/IImageStorageService";
import { CreateStickerWithImage } from "./CreateStickerWithImage";
import type { Sticker } from "@/modules/Catalog/domain/Sticker";
import type { StickerId } from "@/modules/Catalog/domain/StickerId";
import { StickerOwnerAssignmentPolicy } from "@/modules/Catalog/application/policies/StickerOwnerAssignmentPolicy";

describe("CreateStickerWithImage", () => {
  it("creates sticker after successful upload", async () => {
    const userId = crypto.randomUUID();
    const saved: Sticker[] = [];
    const repo: StickerRepository = {
      save: mock(async (s: Sticker) => {
        saved.push(s);
        return Result.ok<void, DomainError>();
      }),
      findById: mock(async (_id: StickerId) => Result.ok<Sticker | null, DomainError>(null)),
      findAll: mock(async () => Result.ok<Sticker[], DomainError>([])),
      findByIds: mock(async () => Result.ok<Sticker[], DomainError>([])),
      delete: mock(async () => Result.ok<void, DomainError>()),
    };

    const upload = mock(async () => Result.ok<string, DomainError>("https://example.com/a.png"));
    const imageStorage: IImageStorageService = {
      upload,
      delete: mock(async () => Result.ok<void, DomainError>()),
    };

    const useCase = new CreateStickerWithImage(repo, imageStorage, new StickerOwnerAssignmentPolicy());

    const result = await useCase.execute({
      ownerId: userId,
      requesterId: userId,
      name: "Sticker A",
      description: "",
      priceAmount: 1,
      priceCurrency: "EUR",
      stock: 1,
      tags: ["tag-a"],
      image: { buffer: Buffer.from([1, 2, 3]), filename: "a.png" },
    });

    expect(result.isSuccess).toBe(true);
    expect(upload).toHaveBeenCalledTimes(1);
    expect(saved.length).toBe(1);
  });

  it("fails fast on domain validation without uploading", async () => {
    const repo: StickerRepository = {
      save: mock(async () => Result.ok<void, DomainError>()),
      findById: mock(async (_id: StickerId) => Result.ok<Sticker | null, DomainError>(null)),
      findAll: mock(async () => Result.ok<Sticker[], DomainError>([])),
      findByIds: mock(async () => Result.ok<Sticker[], DomainError>([])),
      delete: mock(async () => Result.ok<void, DomainError>()),
    };

    const upload = mock(async () => Result.ok<string, DomainError>("https://example.com/a.png"));
    const imageStorage: IImageStorageService = {
      upload,
      delete: mock(async () => Result.ok<void, DomainError>()),
    };

    const useCase = new CreateStickerWithImage(repo, imageStorage, new StickerOwnerAssignmentPolicy());

    const result = await useCase.execute({
      ownerId: "x",
      requesterId: "y",
      name: "",
      description: "",
      priceAmount: 1,
      priceCurrency: "EUR",
      stock: 1,
      tags: [],
      image: { buffer: Buffer.from([1, 2, 3]), filename: "a.png" },
    });

    expect(result.isFailure).toBe(true);
    expect(upload).toHaveBeenCalledTimes(0);
  });

  it("fails when upload fails and does not persist", async () => {
    const userId = crypto.randomUUID();
    const repo: StickerRepository = {
      save: mock(async () => Result.ok<void, DomainError>()),
      findById: mock(async (_id: StickerId) => Result.ok<Sticker | null, DomainError>(null)),
      findAll: mock(async () => Result.ok<Sticker[], DomainError>([])),
      findByIds: mock(async () => Result.ok<Sticker[], DomainError>([])),
      delete: mock(async () => Result.ok<void, DomainError>()),
    };

    const upload = mock(async () => Result.fail<string, DomainError>(new DomainError("upload failed")));
    const imageStorage: IImageStorageService = {
      upload,
      delete: mock(async () => Result.ok<void, DomainError>()),
    };

    const useCase = new CreateStickerWithImage(repo, imageStorage, new StickerOwnerAssignmentPolicy());

    const result = await useCase.execute({
      ownerId: userId,
      requesterId: userId,
      name: "Sticker A",
      description: "",
      priceAmount: 1,
      priceCurrency: "EUR",
      stock: 1,
      tags: [],
      image: { buffer: Buffer.from([1, 2, 3]), filename: "a.png" },
    });

    expect(result.isFailure).toBe(true);
    expect(upload).toHaveBeenCalledTimes(1);
    expect((repo.save as unknown as ReturnType<typeof mock>)).toHaveBeenCalledTimes(0);
  });
});

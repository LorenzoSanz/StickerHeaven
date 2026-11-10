/**
 * PROPÓSITO: Test suite que valida contratos críticos y previene regresiones.
 * RESPONSABILIDAD: Código de soporte del proyecto.
 * DEPENDENCIAS: Ver imports del archivo para dependencias explícitas.
 * SEGURIDAD/INTEGRIDAD: Mantiene invariantes explícitas cuando aplica.
 * NOTAS: Documentar aquí decisiones no obvias y tradeoffs relevantes.
 */
/// <reference types="bun-types" />
/**
 * POR QUÉ: Prueba el CreateSticker caso de uso.
 * INTEGRIDAD: Verifica sticker creation logic and validation.
 * ESTRUCTURA: Suite de tests - Unit Pruebas.
 */
import { describe, it, expect, beforeEach } from "bun:test";
import { CreateSticker } from "./CreateSticker";
import { FakeStickerRepository } from "../testing/FakeStickerRepository";
import { CreateStickerDTO } from "./CreateStickerDTO";
import { StickerId } from "../../domain/StickerId";

describe("CreateSticker", () => {
  let createSticker: CreateSticker;
  let stickerRepository: FakeStickerRepository;

  beforeEach(() => {
    stickerRepository = new FakeStickerRepository();
    createSticker = new CreateSticker(stickerRepository);
  });

  it("should create a sticker successfully", async () => {
    const ownerId = crypto.randomUUID();
    const dto: CreateStickerDTO = {
      ownerId,
      requesterId: ownerId,
      name: "Cool Sticker",
      description: "A very cool sticker",
      priceAmount: 10,
      priceCurrency: "USD",
      stock: 10,
      imageUrl: "http://example.com/sticker.png",
      tags: ["cool", "sticker"]
    };

    const result = await createSticker.execute(dto);

    expect(result.isSuccess).toBe(true);
    const stickerIdStr = result.getValue().id; // CreateSticker returns DTO not entity
    const stickerId = StickerId.create(stickerIdStr).getValue();
    const savedStickerResult = await stickerRepository.findById(stickerId);
    expect(savedStickerResult.isSuccess).toBe(true);
    expect(savedStickerResult.getValue()).not.toBeNull();
    expect(savedStickerResult.getValue()?.name.value).toBe("Cool Sticker");
  });

  it("should fail with invalid price", async () => {
    const ownerId = crypto.randomUUID();
    const dto: CreateStickerDTO = {
      ownerId,
      requesterId: ownerId,
      name: "Cool Sticker",
      description: "A very cool sticker",
      priceAmount: -10,
      priceCurrency: "USD",
      stock: 10,
      imageUrl: "http://example.com/sticker.png",
      tags: ["cool", "sticker"]
    };

    const result = await createSticker.execute(dto);

    expect(result.isFailure).toBe(true);
  });

  it("should fail with invalid tags", async () => {
    const ownerId = crypto.randomUUID();
    const dto: CreateStickerDTO = {
      ownerId,
      requesterId: ownerId,
      name: "Cool Sticker",
      description: "A very cool sticker",
      priceAmount: 10,
      priceCurrency: "USD",
      stock: 10,
      imageUrl: "http://example.com/sticker.png",
      tags: ["invalid tag!", "too long tag name which exceeds the limit"]
    };

    const result = await createSticker.execute(dto);

    expect(result.isFailure).toBe(true);
    // Optional: Verify exact error message
    // expect(result.error?.message).toContain("invalid characters");
  });

  it("should fail if requester does not match ownerId", async () => {
    const ownerId = crypto.randomUUID();
    const dto: CreateStickerDTO = {
      ownerId,
      requesterId: crypto.randomUUID(),
      name: "Cool Sticker",
      description: "A very cool sticker",
      priceAmount: 10,
      priceCurrency: "USD",
      stock: 10,
      imageUrl: "http://example.com/sticker.png",
      tags: ["cool", "sticker"]
    };

    const result = await createSticker.execute(dto);

    expect(result.isFailure).toBe(true);
  });
});

import { DomainError } from "@/shared/domain/DomainError";

export class StickerNotFoundError extends DomainError {
  constructor(id: string) {
    super(`No se encontró el sticker con id ${id}`);
  }
}

export class StickerOwnershipError extends DomainError {
  constructor() {
    super("No estás autorizado para realizar esta acción sobre este sticker");
  }
}

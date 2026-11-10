/**
 * POR QUÉ: Interface for reading cart data.
 * INTEGRIDAD: Decouples application from read-side infrastructure (CQRS).
 * ESTRUCTURA: Capa Application - Port (Interface).
 */
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { CartDTO } from "../get/CartDTO";

export interface CartQueryService {
  getCart(userId: string | null, guestId: string | null): Promise<Result<CartDTO, DomainError>>;
}

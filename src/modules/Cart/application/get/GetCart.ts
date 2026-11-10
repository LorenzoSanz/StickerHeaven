/**
 * POR QUÉ: Obtiene el carrito y lo enriquece con precios en tiempo real.
 * INTEGRIDAD: No almacena precios; siempre los obtiene frescos.
 * ESTRUCTURA: Capa Application - Caso de uso.
 */
import { CartQueryService } from "../queries/CartQueryService";
import { Result } from "../../../../shared/domain/Result";
import { DomainError } from "../../../../shared/domain/DomainError";
import { CartDTO } from "./CartDTO";

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class GetCart {
  constructor(private queryService: CartQueryService) {}

  /**
   * Obtiene el estado actual de un carrito.
   * 
   * @param userId - ID del usuario autenticado (opcional).
   * @param anonymousId - ID de sesión de invitado (opcional).
   * @returns Resultado que contiene el CartDTO.
   */
  async execute(userId: string | null, anonymousId: string | null): Promise<Result<CartDTO, DomainError>> {
    return this.queryService.getCart(userId, anonymousId);
  }
}

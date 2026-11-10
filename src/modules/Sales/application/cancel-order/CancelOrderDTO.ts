/**
 * POR QUÉ: DTO para cancelling un pedido.
 * INTEGRIDAD: Requires order ID and user ID for validation.
 * ESTRUCTURA: Capa Application - DTO.
 */
export interface CancelOrderDTO {
  orderId: string;
  userId: string;
  reason?: string;
}

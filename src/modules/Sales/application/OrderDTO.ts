import type { OrderStatusType } from "../domain/OrderStatus";

export interface OrderItemDTO {
  stickerId: string;
  stickerName: string; // Snapshot
  stickerImageUrl: string; // Snapshot
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
}

export interface OrderDTO {
  id: string;
  customerId: string;
  items: OrderItemDTO[];
  totalAmount: number;
  currency: string;
  status: OrderStatusType;
  paymentIntentId?: string;
  createdAt: string;
}

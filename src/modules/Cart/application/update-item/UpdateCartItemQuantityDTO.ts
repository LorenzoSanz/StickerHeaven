export interface UpdateCartItemQuantityDTO {
  userId: string | null;
  anonymousId: string | null;
  stickerId: string;
  quantity: number;
}

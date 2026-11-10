import { UserId } from "@/modules/Identity/domain/UserId";

export interface OnLoginSuccess {
  execute(userId: UserId, guestCartId?: string): Promise<void>;
}

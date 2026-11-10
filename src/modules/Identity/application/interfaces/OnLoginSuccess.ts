import { UserId } from "../../domain/UserId";

export interface OnLoginSuccess {
  execute(userId: UserId, guestCartId?: string): Promise<void>;
}

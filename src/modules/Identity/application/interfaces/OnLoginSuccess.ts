// Interfaz para manejar el éxito de un login.
import { UserId } from "../../domain/UserId";

export interface OnLoginSuccess {
  execute(userId: UserId, guestCartId?: string): Promise<void>;
}

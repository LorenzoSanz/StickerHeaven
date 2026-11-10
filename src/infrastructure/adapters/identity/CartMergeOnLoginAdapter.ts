
import { OnLoginSuccess } from "@/modules/Identity/application/interfaces/OnLoginSuccess";
import { MergeCarts } from "@/modules/Cart/application/merge/MergeCarts";
import { UserId } from "@/modules/Identity/domain/UserId";
import { ILogger } from "@/shared/domain/ILogger";

export class CartMergeOnLoginAdapter implements OnLoginSuccess {
  constructor(
    private mergeCarts: MergeCarts,
    private logger: ILogger
  ) {}
  async execute(userId: UserId, guestCartId?: string): Promise<void> {
    if (!guestCartId) {
      return;
    }

    const result = await this.mergeCarts.execute({
      userId: userId.value,
      guestCartId: guestCartId,
    });

    if (result.isFailure) {
        this.logger.error(`Failed to merge carts for user ${userId.value}:`, result.error);
        // Elegimos no lanzar aquí para evitar bloquear el proceso de login,
        // pero en un sistema más estricto quizá queramos alertar al usuario.
    }
  }
}

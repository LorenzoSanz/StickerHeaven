import { SalesQueryService } from "@/modules/Sales/application/queries/SalesQueryService";
import { OrderDTO } from "@/modules/Sales/application/OrderDTO";
import { OrderModel, IOrderDocument } from "../persistence/mongoose/OrderModel";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { OrderStatus } from "@/modules/Sales/domain/OrderStatus";

export class MongoSalesQueryService implements SalesQueryService {
  async getOrderById(orderId: string): Promise<Result<OrderDTO | null, DomainError>> {
    try {
      const doc = await OrderModel.findOne({ _id: orderId }).lean<IOrderDocument>();
      if (!doc) return Result.ok(null);
      return Result.ok(this.toDTO(doc));
    } catch (error) {
      return Result.fail(new DomainError(`Failed to fetch order: ${error}`));
    }
  }

  async listOrdersByCustomer(customerId: string): Promise<Result<OrderDTO[], DomainError>> {
    try {
      const docs = await OrderModel.find({ userId: customerId }).sort({ createdAt: -1 }).lean<IOrderDocument[]>();
      return Result.ok(docs.map(doc => this.toDTO(doc)));
    } catch (error) {
      return Result.fail(new DomainError(`Failed to list orders: ${error}`));
    }
  }

  private toDTO(doc: IOrderDocument): OrderDTO {
    const statusResult = OrderStatus.create(doc.status);
    if (statusResult.isFailure) {
      throw new DomainError(statusResult.error!.message);
    }

    return {
      id: doc._id,
      customerId: doc.userId,
      items: doc.items.map(item => ({
        stickerId: item.stickerId,
        stickerName: item.stickerName || "Unknown Product",
        stickerImageUrl: item.stickerImageUrl || "",
        quantity: item.quantity,
        unitPrice: item.unitPrice.amount,
        currency: item.unitPrice.currency,
        totalPrice: item.unitPrice.amount * item.quantity
      })),
      totalAmount: doc.totalAmount.amount,
      currency: doc.totalAmount.currency,
      status: statusResult.getValue().value,
      paymentIntentId: doc.paymentIntentId,
      createdAt: doc.createdAt.toISOString()
    };
  }
}

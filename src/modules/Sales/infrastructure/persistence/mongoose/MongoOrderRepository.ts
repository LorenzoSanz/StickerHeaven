import { OrderRepository } from "@/modules/Sales/domain/OrderRepository";
import { Order } from "@/modules/Sales/domain/Order";
import { CustomerId } from "@/modules/Sales/domain/CustomerId";
import { OrderModel, IOrderDocument } from "./OrderModel";
import { OrderMapper } from "./OrderMapper";
import { OrderId } from "@/modules/Sales/domain/OrderId";
import { PaymentIntentId } from "@/modules/Sales/domain/PaymentIntentId";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { DomainEventPublisher } from "@/shared/infrastructure/events/DomainEventPublisher";

export class MongoOrderRepository implements OrderRepository {
  constructor(private eventPublisher: DomainEventPublisher) {}

  async save(order: Order): Promise<Result<void, DomainError>> {
    try {
      const persistenceData = OrderMapper.toPersistence(order);

      if (order.version === 0) {
          await OrderModel.findByIdAndUpdate(
              order.id.value,
              persistenceData,
              { upsert: true, new: true }
          );
      } else {
          const result = await OrderModel.findOneAndUpdate(
              { _id: order.id.value, __v: order.version },
              { ...persistenceData, $inc: { __v: 1 } },
              { new: true }
          );

          if (!result) {
              return Result.fail(new DomainError(`Concurrency Error: Order ${order.id.value} was modified by another transaction.`));
          }
      }

      // Publish Domain Events
      const events = order.pullDomainEvents();
      await this.eventPublisher.publish(events);

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new DomainError(`Failed to save order: ${error}`));
    }
  }

  async findById(id: OrderId): Promise<Result<Order | null, DomainError>> {
    try {
      const doc = await OrderModel.findById(id.value).lean<IOrderDocument>();
      if (!doc) return Result.ok(null);
      return Result.ok(OrderMapper.toDomain(doc));
    } catch (error) {
      return Result.fail(new DomainError(`Failed to find order: ${error}`));
    }
  }

  async findByCustomerId(customerId: CustomerId): Promise<Result<Order[], DomainError>> {
    try {
      const docs = await OrderModel.find({ userId: customerId.value }).lean<IOrderDocument[]>();
      return Result.ok(docs.map(doc => OrderMapper.toDomain(doc)));
    } catch (error) {
      return Result.fail(new DomainError(`Failed to find orders by customer: ${error}`));
    }
  }

  async findByPaymentIntentId(paymentIntentId: PaymentIntentId): Promise<Result<Order | null, DomainError>> {
    try {
      const doc = await OrderModel.findOne({ paymentIntentId: paymentIntentId.value }).lean<IOrderDocument>();
      if (!doc) return Result.ok(null);
      return Result.ok(OrderMapper.toDomain(doc));
    } catch (error) {
      return Result.fail(new DomainError(`Failed to find order by payment intent: ${error}`));
    }
  }

  async delete(id: OrderId): Promise<Result<void, DomainError>> {
    try {
      await OrderModel.findByIdAndDelete(id.value);
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new DomainError(`Failed to delete order: ${error}`));
    }
  }
}

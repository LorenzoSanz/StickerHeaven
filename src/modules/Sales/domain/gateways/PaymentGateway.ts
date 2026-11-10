import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { Money } from "@/shared/domain/Money";

export interface CreatePaymentIntentResult {
  id: string;
  clientSecret: string;
}

export interface PaymentGateway {
  createPaymentIntent(amount: Money, metadata: Record<string, string>): Promise<Result<CreatePaymentIntentResult, DomainError>>;
  cancelPaymentIntent(id: string): Promise<Result<void, DomainError>>;
  getClientSecret(paymentIntentId: string): Promise<Result<string, DomainError>>;
  refundPayment(paymentIntentId: string): Promise<Result<void, DomainError>>;
}

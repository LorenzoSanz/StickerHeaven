import type { IEmailService } from "@/shared/domain/IEmailService";
import { Result } from "@/shared/domain/Result";
import type { DomainError } from "@/shared/domain/DomainError";
import { SubscriberEmail } from "@/modules/Marketing/domain/SubscriberEmail";
import type { SubscribeToNewsletterDTO } from "./SubscribeToNewsletterDTO";

export class SubscribeToNewsletter {
  constructor(private readonly emailService: IEmailService) {}

  async execute(dto: SubscribeToNewsletterDTO): Promise<Result<void, DomainError>> {
    const email = SubscriberEmail.create(dto.email);
    if (email.isFailure) return Result.fail(email.error!);

    const sendResult = await this.emailService.sendNewsletterDiscountTest(email.getValue().value);
    if (sendResult.isFailure) return Result.fail(sendResult.error!);

    return Result.ok();
  }
}


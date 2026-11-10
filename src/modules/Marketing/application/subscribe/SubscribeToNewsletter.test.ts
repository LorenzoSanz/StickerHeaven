import { describe, it, expect, mock, beforeEach } from "bun:test";
import { Result } from "@/shared/domain/Result";
import type { IEmailService } from "@/shared/domain/IEmailService";
import { SubscribeToNewsletter } from "./SubscribeToNewsletter";

class MockEmailService implements IEmailService {
  sendOrderConfirmation = mock(async () => Result.ok<void, Error>());
  sendNewsletterDiscountTest = mock(async () => Result.ok<void, Error>());
}

describe("SubscribeToNewsletter Use Case", () => {
  let emailService: MockEmailService;
  let useCase: SubscribeToNewsletter;

  beforeEach(() => {
    emailService = new MockEmailService();
    useCase = new SubscribeToNewsletter(emailService);
  });

  it("should send the test discount email for a valid email", async () => {
    const result = await useCase.execute({ email: "test@example.com" });

    expect(result.isSuccess).toBe(true);
    expect(emailService.sendNewsletterDiscountTest).toHaveBeenCalledWith("test@example.com");
  });

  it("should fail for an invalid email", async () => {
    const result = await useCase.execute({ email: "not-an-email" });

    expect(result.isFailure).toBe(true);
    expect(emailService.sendNewsletterDiscountTest).not.toHaveBeenCalled();
  });
});


import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";

export interface UserContactQueryService {
  getEmailByUserId(userId: string): Promise<Result<string | null, DomainError>>;
}

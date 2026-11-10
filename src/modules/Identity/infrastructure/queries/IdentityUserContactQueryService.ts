/**
 * PROPÓSITO: Unidad del proyecto con responsabilidad acotada por su ubicación y nombre.
 * RESPONSABILIDAD: Código de soporte del proyecto.
 * DEPENDENCIAS: Ver imports del archivo para dependencias explícitas.
 * SEGURIDAD/INTEGRIDAD: Mantiene invariantes explícitas cuando aplica.
 * NOTAS: Documentar aquí decisiones no obvias y tradeoffs relevantes.
 */
import { UserContactQueryService } from "@/shared/contracts/UserContactQueryService";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { UserRepository } from "../../domain/UserRepository";
import { UserId } from "../../domain/UserId";

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class IdentityUserContactQueryService implements UserContactQueryService {
  constructor(private readonly userRepository: UserRepository) {}

  async getEmailByUserId(userId: string): Promise<Result<string | null, DomainError>> {
    const userIdOrError = UserId.create(userId);
    if (userIdOrError.isFailure) {
      return Result.fail(userIdOrError.error!);
    }

    const userResult = await this.userRepository.findById(userIdOrError.getValue());
    if (userResult.isFailure) {
      return Result.fail(userResult.error!);
    }

    const user = userResult.getValue();
    if (!user) {
      return Result.ok<string | null, DomainError>(null);
    }

    return Result.ok<string | null, DomainError>(user.email.value);
  }
}

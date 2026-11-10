
/**
 * POR QUÉ: Orquesta el proceso de logout de usuario.
 * INTEGRIDAD: Invalida la sesión del usuario.
 * ESTRUCTURA: Capa Application - Caso de uso.
 */
import { SessionRepository } from "../../domain/SessionRepository";
import { Result } from "../../../../shared/domain/Result";
import { DomainError } from "../../../../shared/domain/DomainError";
import { SessionId } from "../../domain/SessionId";

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class LogoutUser {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(sessionId: SessionId): Promise<Result<void, DomainError>> {
    const result = await this.sessionRepository.delete(sessionId.value);
    if (result.isFailure) {
        return Result.fail(result.error!);
    }
    return Result.ok();
  }
}


/**
 * POR QUÉ: Orquesta el proceso de login de usuario.
 * INTEGRIDAD: Verifica credenciales sin filtrar detalles (respuesta uniforme ante fallo) y crea una nueva sesión.
 * ESTRUCTURA: Capa Application - Caso de uso.
 */

import { UserRepository } from "../../domain/UserRepository";
import { IPasswordHasher } from "../../domain/IPasswordHasher";
import { SessionRepository } from "../../domain/SessionRepository";
import { Session } from "../../domain/Session";
import { LoginUserDTO } from "./LoginUserDTO";
import { LoginOutputDTO } from "./LoginOutputDTO";
import { Result } from "../../../../shared/domain/Result";
import { DomainError } from "../../../../shared/domain/DomainError";
import { Email } from "../../domain/Email";
import { Password } from "../../domain/Password";
import { OnLoginSuccess } from "../interfaces/OnLoginSuccess";

/**
 * POR QUÉ: Evitamos distinguir “email inválido”, “usuario inexistente” y “password incorrecta” para no filtrar señales a un atacante.
 * QUÉ: Error de dominio usado como resultado uniforme cuando la autenticación falla.
 */
export class InvalidCredentialsError extends DomainError {
  constructor() {
    super("Email o contraseña incorrectos.");
  }
}

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class LoginUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly sessionRepository: SessionRepository
  ) {}

  /**
   * POR QUÉ: El login en este sistema se modela como “crear una sesión” (no como retornar un JWT) y persistirla.
   * QUÉ: Valida formato de credenciales, busca usuario por email, compara el hash de contraseña y crea/guarda una Session.
   * @returns Resultado con el `sessionId` (para setear cookie) y un snapshot mínimo del usuario para la UI.
   */
  async execute(dto: LoginUserDTO): Promise<Result<LoginOutputDTO, DomainError>> {
    // 1) Validar formato de inputs
    const emailResult = Email.create(dto.email);
    if (emailResult.isFailure) {
      return Result.fail(new InvalidCredentialsError());
    }

    const passwordResult = Password.create(dto.password);
    if (passwordResult.isFailure) {
      return Result.fail(new InvalidCredentialsError());
    }

    const email = emailResult.value;
    const password = passwordResult.value;

    // 2) Buscar usuario (sin filtrar si falla por repo/ausencia)
    const userResult = await this.userRepository.findByEmail(email);
    if (userResult.isFailure) {
      return Result.fail(new InvalidCredentialsError());
    }
    const user = userResult.getValue();
    if (!user) {
      return Result.fail(new InvalidCredentialsError());
    }

    // 3) Verificar contraseña
    const match = await this.passwordHasher.compare(password, user.passwordHash);
    if (!match) {
      return Result.fail(new InvalidCredentialsError());
    }

    // 4) Crear y persistir sesión
    const sessionResult = Session.create(user.id);
    if (sessionResult.isFailure) {
        return Result.fail(sessionResult.error!);
    }
    const session = sessionResult.getValue();
    const saveSessionResult = await this.sessionRepository.save(session);
    if (saveSessionResult.isFailure) {
        return Result.fail(saveSessionResult.error!);
    }

    // 5) Respuesta de éxito (DTO)
    return Result.ok({
      sessionId: session.id.value,
      user: {
        id: user.id.value,
        email: user.email.value
      }
    });
  }
}

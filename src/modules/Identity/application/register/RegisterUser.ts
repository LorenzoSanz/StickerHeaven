/**
 * POR QUÉ: Orquesta el proceso de registro de usuario.
 * INTEGRIDAD: Aplica reglas de unicidad (email) y crea el agregado User en estado válido (hash de password incluido).
 * ESTRUCTURA: Capa Application - depende de Domain y puertos (repos/hasher), nunca de infraestructura.
 */

import { UserRepository } from "../../domain/UserRepository";
import { RegisterUserDTO } from "./RegisterUserDTO";
import { Result } from "../../../../shared/domain/Result";
import { DomainError } from "../../../../shared/domain/DomainError";
import { Email } from "../../domain/Email";
import { User } from "../../domain/User";
import { IPasswordHasher } from "../../domain/IPasswordHasher";
import { Password } from "../../domain/Password";
import { UserName } from "../../domain/UserName";
import { HashedPassword } from "../../domain/HashedPassword";
import { UserRole } from "../../domain/UserRole";

// Error de dominio cuando el email ya está registrado.
export class UserAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(`Ya existe un usuario con el email <${email}>.`);
  }
}

// DTO para la entrada del registro de usuario.
export class RegisterUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  /**
   * Registra un nuevo usuario en el sistema.
   * @param dto Email, nombre y password en crudo (se valida/transforma a Value Objects).
   * @returns Result<void> en éxito.
   * @returns Error de dominio si el email ya está tomado o si la entrada es inválida.
   */
  async execute(dto: RegisterUserDTO): Promise<Result<void, DomainError>> {
    // 1) Validar entrada (Value Objects)
    const emailResult = Email.create(dto.email);
    if (emailResult.isFailure) {
      return Result.fail(emailResult.error);
    }
    const email = emailResult.value;

    const nameResult = UserName.create(dto.name);
    if (nameResult.isFailure) {
      return Result.fail(nameResult.error);
    }
    const name = nameResult.value;

    const passwordResult = Password.create(dto.password);
    if (passwordResult.isFailure) {
      return Result.fail(passwordResult.error);
    }
    const password = passwordResult.value;

    // 2) Regla de negocio: unicidad de email
    const existingUserResult = await this.userRepository.findByEmail(email);
    if (existingUserResult.isFailure) {
        return Result.fail(existingUserResult.error!);
    }
    const existingUser = existingUserResult.getValue();
    
    if (existingUser) {
      return Result.fail(new UserAlreadyExistsError(dto.email));
    }

    // 3) Hashear password (infra via port)
    const passwordHash = await this.passwordHasher.hash(password);

    // 4) Crear agregado en estado válido
    const userResult = User.create({
      email: email,
      name: name,
      passwordHash: passwordHash,
      role: UserRole.Customer(),
      createdAt: new Date(),
    });

    if (userResult.isFailure) {
      return Result.fail(userResult.error);
    }

    // 5) Persistir
    const saveResult = await this.userRepository.save(userResult.value);
    if (saveResult.isFailure) {
        return Result.fail(saveResult.error!);
    }

    return Result.ok(undefined);
  }
}

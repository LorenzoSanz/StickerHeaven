
import { UserRepository } from "@/modules/Identity/domain/UserRepository";
import { RegisterUserDTO } from "./RegisterUserDTO";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { Email } from "@/modules/Identity/domain/Email";
import { User } from "@/modules/Identity/domain/User";
import { IPasswordHasher } from "@/modules/Identity/domain/IPasswordHasher";
import { Password } from "@/modules/Identity/domain/Password";
import { UserName } from "@/modules/Identity/domain/UserName";
import { HashedPassword } from "@/modules/Identity/domain/HashedPassword";
import { UserRole } from "@/modules/Identity/domain/UserRole";

// Deliberately vague and without echoing the email back: the response should not confirm
// which addresses have an account more than strictly necessary.
export class UserAlreadyExistsError extends DomainError {
  constructor() {
    super("No se ha podido completar el registro con ese email.");
  }
}

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

    const existingUserResult = await this.userRepository.findByEmail(email);
    if (existingUserResult.isFailure) {
        return Result.fail(existingUserResult.error!);
    }
    const existingUser = existingUserResult.getValue();
    
    if (existingUser) {
      return Result.fail(new UserAlreadyExistsError());
    }

    const passwordHash = await this.passwordHasher.hash(password);

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

    const saveResult = await this.userRepository.save(userResult.value);
    if (saveResult.isFailure) {
        return Result.fail(saveResult.error!);
    }

    return Result.ok(undefined);
  }
}


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
import { HashedPassword } from "../../domain/HashedPassword";
import { OnLoginSuccess } from "../interfaces/OnLoginSuccess";

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super("Email o contraseña incorrectos.");
  }
}

export class LoginUser {
  private dummyHashPromise: Promise<HashedPassword> | null = null;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly sessionRepository: SessionRepository
  ) {}

  private dummyHash(): Promise<HashedPassword> {
    this.dummyHashPromise ??= this.passwordHasher.hash(Password.create("timing-equalizer").getValue());
    return this.dummyHashPromise;
  }

  async execute(dto: LoginUserDTO): Promise<Result<LoginOutputDTO, DomainError>> {
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

    const userResult = await this.userRepository.findByEmail(email);
    if (userResult.isFailure) {
      return Result.fail(new InvalidCredentialsError());
    }
    const user = userResult.getValue();
    if (!user) {
      // Spend the same Argon2 work as a real check: answering instantly for unknown emails
      // would let anyone tell registered addresses apart by response time.
      await this.passwordHasher.compare(password, await this.dummyHash());
      return Result.fail(new InvalidCredentialsError());
    }

    const match = await this.passwordHasher.compare(password, user.passwordHash);
    if (!match) {
      return Result.fail(new InvalidCredentialsError());
    }

    const sessionResult = Session.create(user.id);
    if (sessionResult.isFailure) {
        return Result.fail(sessionResult.error!);
    }
    const session = sessionResult.getValue();
    const saveSessionResult = await this.sessionRepository.save(session);
    if (saveSessionResult.isFailure) {
        return Result.fail(saveSessionResult.error!);
    }

    return Result.ok({
      sessionId: session.id.value,
      user: {
        id: user.id.value,
        email: user.email.value
      }
    });
  }
}

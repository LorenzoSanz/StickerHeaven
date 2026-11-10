import { UserRepository } from "../../domain/UserRepository";
import { IPasswordHasher } from "../../domain/IPasswordHasher";
import { ChangePasswordDTO } from "./ChangePasswordDTO";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { UserId } from "../../domain/UserId";
import { Password } from "../../domain/Password";

export class ChangePassword {
  constructor(
    private userRepository: UserRepository,
    private passwordHasher: IPasswordHasher
  ) {}

  async execute(dto: ChangePasswordDTO): Promise<Result<void, DomainError>> {
    const userIdOrError = UserId.create(dto.userId);
    if (userIdOrError.isFailure) {
      return Result.fail(userIdOrError.error!);
    }
    const userId = userIdOrError.getValue();

    const userResult = await this.userRepository.findById(userId);
    if (userResult.isFailure) {
        return Result.fail(userResult.error!);
    }
    const user = userResult.getValue();

    if (!user) {
      return Result.fail(new DomainError("User not found"));
    }

    // 1. Verify Current Password
    const currentPasswordOrError = Password.create(dto.currentPassword);
    if (currentPasswordOrError.isFailure) {
      return Result.fail(currentPasswordOrError.error!);
    }
    const currentPassword = currentPasswordOrError.getValue();

    const isMatch = await this.passwordHasher.compare(
      currentPassword,
      user.passwordHash
    );

    if (!isMatch) {
      return Result.fail(new DomainError("Contraseña Actual Incorrecta"));
    }

    // 2. Hash New Password
    const newPasswordOrError = Password.create(dto.newPassword);
    if (newPasswordOrError.isFailure) {
      return Result.fail(newPasswordOrError.error!);
    }
    const newPassword = newPasswordOrError.getValue();

    const newHashedPassword = await this.passwordHasher.hash(newPassword);

    // 3. Update User
    user.changePassword(newHashedPassword);

    const saveResult = await this.userRepository.save(user);
    if (saveResult.isFailure) {
        return Result.fail(saveResult.error!);
    }

    return Result.ok();
  }
}

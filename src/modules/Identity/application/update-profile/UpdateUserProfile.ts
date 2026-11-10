import { UserRepository } from "../../domain/UserRepository";
import { UpdateUserProfileDTO } from "./UpdateUserProfileDTO";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { UserId } from "../../domain/UserId";
import { Email } from "../../domain/Email";
import { UserName } from "../../domain/UserName";
import { UserProfileAccessPolicy } from "../policies/UserProfileAccessPolicy";

export class UpdateUserProfile {
  constructor(
    private userRepository: UserRepository,
    private userProfileAccessPolicy: UserProfileAccessPolicy = new UserProfileAccessPolicy()
  ) {}

  async execute(dto: UpdateUserProfileDTO): Promise<Result<void, DomainError>> {
    const userIdOrError = UserId.create(dto.userId);
    if (userIdOrError.isFailure) {
      return Result.fail(userIdOrError.error!);
    }
    const userId = userIdOrError.getValue();

    const requesterIdOrError = UserId.create(dto.requesterId);
    if (requesterIdOrError.isFailure) {
      return Result.fail(requesterIdOrError.error!);
    }
    const requesterId = requesterIdOrError.getValue();

    const policyResult = this.userProfileAccessPolicy.assertSelf(userId, requesterId);
    if (policyResult.isFailure) {
      return Result.fail(policyResult.error!);
    }

    const userResult = await this.userRepository.findById(userId);
    if (userResult.isFailure) {
        return Result.fail(userResult.error!);
    }
    const user = userResult.getValue();
    
    if (!user) {
      return Result.fail(new DomainError("User not found"));
    }

    // 1. Update Email
    if (dto.email && dto.email !== user.email.value) {
      const emailOrError = Email.create(dto.email);
      if (emailOrError.isFailure) {
        return Result.fail(emailOrError.error!);
      }
      const email = emailOrError.getValue();

      // Check Uniqueness
      const existingUserResult = await this.userRepository.findByEmail(email);
      if (existingUserResult.isFailure) {
          return Result.fail(existingUserResult.error!);
      }
      const existingUser = existingUserResult.getValue();

      if (existingUser && !existingUser.id.equals(userId)) {
        return Result.fail(new DomainError("Email already in use"));
      }

      user.changeEmail(email);
    }

    // 2. Update Username
    if (dto.username && dto.username !== user.name.value) {
      const nameOrError = UserName.create(dto.username);
      if (nameOrError.isFailure) {
        return Result.fail(nameOrError.error!);
      }
      const name = nameOrError.getValue();

      // Check Uniqueness
      const existingUserResult = await this.userRepository.findByUserName(name);
      if (existingUserResult.isFailure) {
          return Result.fail(existingUserResult.error!);
      }
      const existingUser = existingUserResult.getValue();

      if (existingUser && !existingUser.id.equals(userId)) {
        return Result.fail(new DomainError("Username already in use"));
      }
      
      user.changeName(name);
    }

    const saveResult = await this.userRepository.save(user);
    if (saveResult.isFailure) {
        return Result.fail(saveResult.error!);
    }

    return Result.ok();
  }
}

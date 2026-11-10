
import { UserRepository } from "@/modules/Identity/domain/UserRepository";
import { User } from "@/modules/Identity/domain/User";
import { UserId } from "@/modules/Identity/domain/UserId";
import { Email } from "@/modules/Identity/domain/Email";
import { UserName } from "@/modules/Identity/domain/UserName";
import { UserModel, UserDocument } from "./UserModel";
import { UserMapper } from "./UserMapper";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";

export class MongoUserRepository implements UserRepository {
  async save(user: User): Promise<Result<void, DomainError>> {
    try {
      const rawUser = UserMapper.toPersistence(user);
      await UserModel.findOneAndUpdate(
        { _id: user.id.value },
        rawUser,
        { upsert: true, new: true }
      );
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new DomainError(`Failed to save user: ${error}`));
    }
  }

  async findByEmail(email: Email): Promise<Result<User | null, DomainError>> {
    try {
      const rawUser = await UserModel.findOne({ email: email.value }).lean<UserDocument>();
      if (!rawUser) {
        return Result.ok(null);
      }
      return Result.ok(UserMapper.toDomain(rawUser));
    } catch (error) {
      return Result.fail(new DomainError(`Failed to find user by email: ${error}`));
    }
  }

  async findByUserName(username: UserName): Promise<Result<User | null, DomainError>> {
    try {
      const rawUser = await UserModel.findOne({ name: username.value }).lean<UserDocument>();
      if (!rawUser) {
        return Result.ok(null);
      }
      return Result.ok(UserMapper.toDomain(rawUser));
    } catch (error) {
      return Result.fail(new DomainError(`Failed to find user by username: ${error}`));
    }
  }

  async findById(id: UserId): Promise<Result<User | null, DomainError>> {
    try {
      const rawUser = await UserModel.findOne({ _id: id.value }).lean<UserDocument>();
      if (!rawUser) {
        return Result.ok(null);
      }
      return Result.ok(UserMapper.toDomain(rawUser));
    } catch (error) {
      return Result.fail(new DomainError(`Failed to find user by id: ${error}`));
    }
  }
}

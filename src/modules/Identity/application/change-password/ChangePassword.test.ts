import { describe, it, expect, mock, beforeEach } from "bun:test";
import { ChangePassword } from "./ChangePassword";
import { UserRepository } from "../../domain/UserRepository";
import { IPasswordHasher } from "../../domain/IPasswordHasher";
import { User } from "../../domain/User";
import { Email } from "../../domain/Email";
import { UserName } from "../../domain/UserName";
import { HashedPassword } from "../../domain/HashedPassword";
import { UserRole } from "../../domain/UserRole";
import { UserId } from "../../domain/UserId";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";

describe("ChangePassword Use Case", () => {
  let useCase: ChangePassword;
  let mockRepo: UserRepository;
  let mockHasher: IPasswordHasher;

  const userId = UserId.create(crypto.randomUUID()).getValue();
  const currentPassword = "oldPassword123";
  const newPassword = "newPassword123";
  const hashedCurrent = HashedPassword.create("hashed_old").getValue();
  const hashedNew = HashedPassword.create("hashed_new").getValue();

  beforeEach(() => {
    mockRepo = {
      save: mock(() => Promise.resolve(Result.ok<void, DomainError>())),
      findById: mock(() => Promise.resolve(Result.ok<User | null, DomainError>(null))),
    } as unknown as UserRepository;

    mockHasher = {
      hash: mock(() => Promise.resolve(hashedNew)),
      compare: mock(() => Promise.resolve(false)), // Default to false
      verify: mock(() => Promise.resolve(false)),
    } as unknown as IPasswordHasher;

    useCase = new ChangePassword(mockRepo, mockHasher);
  });

  const createUser = () => {
    return User.create(
      {
        email: Email.create("test@example.com").getValue(),
        name: UserName.create("Test User").getValue(),
        passwordHash: hashedCurrent,
        role: UserRole.Customer(),
        createdAt: new Date(),
      },
      userId
    ).getValue();
  };

  it("should change password successfully", async () => {
    const user = createUser();
    mockRepo.findById = mock(() =>
      Promise.resolve(Result.ok<User | null, DomainError>(user))
    );
    mockHasher.compare = mock(() => Promise.resolve(true)); // Pass verify

    const result = await useCase.execute({
      userId: userId.value,
      currentPassword: currentPassword,
      newPassword: newPassword,
    });

    expect(result.isSuccess).toBe(true);
    expect(mockHasher.compare).toHaveBeenCalled();
    expect(mockHasher.hash).toHaveBeenCalledWith(expect.objectContaining({ value: newPassword }));
    expect(mockRepo.save).toHaveBeenCalled();
    expect(user.passwordHash).toEqual(hashedNew);
  });

  it("should fail if current password is incorrect", async () => {
    const user = createUser();
    mockRepo.findById = mock(() =>
      Promise.resolve(Result.ok<User | null, DomainError>(user))
    );
    mockHasher.compare = mock(() => Promise.resolve(false)); // Fail verify

    const result = await useCase.execute({
      userId: userId.value,
      currentPassword: "wrongPassword",
      newPassword: newPassword,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe("Contraseña Actual Incorrecta");
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});

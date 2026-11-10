import { describe, it, expect, mock, beforeEach } from "bun:test";
import { ChangePassword } from "./ChangePassword";
import { UserRepository } from "@/modules/Identity/domain/UserRepository";
import { IPasswordHasher } from "@/modules/Identity/domain/IPasswordHasher";
import { User } from "@/modules/Identity/domain/User";
import { Email } from "@/modules/Identity/domain/Email";
import { UserName } from "@/modules/Identity/domain/UserName";
import { HashedPassword } from "@/modules/Identity/domain/HashedPassword";
import { UserRole } from "@/modules/Identity/domain/UserRole";
import { UserId } from "@/modules/Identity/domain/UserId";
import { SessionRepository } from "@/modules/Identity/domain/SessionRepository";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";

describe("ChangePassword Use Case", () => {
  let useCase: ChangePassword;
  let mockRepo: UserRepository;
  let mockHasher: IPasswordHasher;
  let mockSessions: SessionRepository;

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

    mockSessions = {
      deleteAllForUserExcept: mock(() => Promise.resolve(Result.ok<void, DomainError>())),
    } as unknown as SessionRepository;

    useCase = new ChangePassword(mockRepo, mockHasher, mockSessions);
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

  it("signs out every other session of the user after a change", async () => {
    const user = createUser();
    (mockRepo.findById as ReturnType<typeof mock>).mockResolvedValue(Result.ok<User | null, DomainError>(user));
    (mockHasher.compare as ReturnType<typeof mock>).mockResolvedValue(true);

    const result = await useCase.execute(
      { userId: userId.value, currentPassword, newPassword },
      "current-session"
    );

    expect(result.isSuccess).toBe(true);
    expect(mockSessions.deleteAllForUserExcept).toHaveBeenCalledWith(userId.value, "current-session");
  });

  it("keeps other sessions when the current password is wrong", async () => {
    (mockRepo.findById as ReturnType<typeof mock>).mockResolvedValue(Result.ok<User | null, DomainError>(createUser()));

    await useCase.execute({ userId: userId.value, currentPassword: "wrongPassword1", newPassword }, "current-session");

    expect(mockSessions.deleteAllForUserExcept).not.toHaveBeenCalled();
  });
});

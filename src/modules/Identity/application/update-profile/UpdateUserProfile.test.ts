import { describe, it, expect, mock, beforeEach } from "bun:test";
import { UpdateUserProfile } from "./UpdateUserProfile";
import { UserRepository } from "@/modules/Identity/domain/UserRepository";
import { User } from "@/modules/Identity/domain/User";
import { Email } from "@/modules/Identity/domain/Email";
import { UserName } from "@/modules/Identity/domain/UserName";
import { HashedPassword } from "@/modules/Identity/domain/HashedPassword";
import { UserRole } from "@/modules/Identity/domain/UserRole";
import { UserId } from "@/modules/Identity/domain/UserId";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";

describe("UpdateUserProfile Use Case", () => {
  let useCase: UpdateUserProfile;
  let mockRepo: UserRepository;

  const userId = UserId.create(crypto.randomUUID()).getValue();
  const otherUserId = UserId.create(crypto.randomUUID()).getValue();
  const existingEmail = "john@example.com";
  const existingName = "John Doe";
  const newEmail = "new@example.com";
  const newName = "New Name";

  beforeEach(() => {
    mockRepo = {
      save: mock(() => Promise.resolve(Result.ok<void, DomainError>())),
      findById: mock(() => Promise.resolve(Result.ok<User | null, DomainError>(null))),
      findByEmail: mock(() => Promise.resolve(Result.ok<User | null, DomainError>(null))),
      findByUserName: mock(() => Promise.resolve(Result.ok<User | null, DomainError>(null))),
    } as unknown as UserRepository;

    useCase = new UpdateUserProfile(mockRepo);
  });

  const createUser = (id: UserId, emailStr: string, nameStr: string) => {
    return User.create(
      {
        email: Email.create(emailStr).getValue(),
        name: UserName.create(nameStr).getValue(),
        passwordHash: HashedPassword.create("hash").getValue(),
        role: UserRole.Customer(),
        createdAt: new Date(),
      },
      id
    ).getValue();
  };

  it("should update email and username successfully", async () => {
    const user = createUser(userId, existingEmail, existingName);
    mockRepo.findById = mock(() =>
      Promise.resolve(Result.ok<User | null, DomainError>(user))
    );

    const result = await useCase.execute({
      userId: userId.value,
      email: newEmail,
      username: newName,
    });

    expect(result.isSuccess).toBe(true);
    expect(user.email.value).toBe(newEmail);
    expect(user.name.value).toBe(newName);
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it("should fail if email is already taken by another user", async () => {
    const user = createUser(userId, existingEmail, existingName);
    const otherUser = createUser(otherUserId, newEmail, "Other");
    
    mockRepo.findById = mock(() =>
      Promise.resolve(Result.ok<User | null, DomainError>(user))
    );
    mockRepo.findByEmail = mock(() =>
      Promise.resolve(Result.ok<User | null, DomainError>(otherUser))
    );

    const result = await useCase.execute({
      userId: userId.value,
      email: newEmail,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe("Email already in use");
  });

  it("should fail if username is already taken by another user", async () => {
    const user = createUser(userId, existingEmail, existingName);
    const otherUser = createUser(otherUserId, "other@example.com", newName);
    
    mockRepo.findById = mock(() =>
      Promise.resolve(Result.ok<User | null, DomainError>(user))
    );
    mockRepo.findByUserName = mock(() =>
      Promise.resolve(Result.ok<User | null, DomainError>(otherUser))
    );

    const result = await useCase.execute({
      userId: userId.value,
      username: newName,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toBe("Username already in use");
  });

  it("should succeed if updating to same email/username (idempotency)", async () => {
    const user = createUser(userId, existingEmail, existingName);
    mockRepo.findById = mock(() =>
      Promise.resolve(Result.ok<User | null, DomainError>(user))
    );
    // Si buscar por email devuelve al mismo usuario, debería ser válido
    mockRepo.findByEmail = mock(() =>
      Promise.resolve(Result.ok<User | null, DomainError>(user))
    );

    const result = await useCase.execute({
      userId: userId.value,
      email: existingEmail, // Mismo email
    });

    // En la implementación actual, si el email coincide, omite el bloque de validación/actualización.
    // Ver código: if (dto.email && dto.email !== user.email.value)
    // Por tanto, lo omite.
    
    expect(result.isSuccess).toBe(true);
    expect(mockRepo.findByEmail).not.toHaveBeenCalled(); // Debería omitir la comprobación
  });
});

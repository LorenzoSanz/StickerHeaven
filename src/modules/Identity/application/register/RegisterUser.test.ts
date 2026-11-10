/// <reference types="bun-types" />

import { describe, it, expect, beforeEach } from "bun:test";
import { RegisterUser } from "./RegisterUser";
import { RegisterUserDTO } from "./RegisterUserDTO";
import { UserRepository } from "../../domain/UserRepository";
import { User } from "../../domain/User";
import { Email } from "../../domain/Email";
import { IPasswordHasher } from "../../domain/IPasswordHasher";
import { Password } from "../../domain/Password";
import { HashedPassword } from "../../domain/HashedPassword";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { UserName } from "../../domain/UserName";
import { UserId } from "../../domain/UserId";

// Mock Hasher for deterministic testing
class MockPasswordHasher implements IPasswordHasher {
  async hash(password: Password): Promise<HashedPassword> {
    return HashedPassword.create(`hashed_${password.value}`).getValue();
  }

  async compare(password: Password, hash: HashedPassword): Promise<boolean> {
    return `hashed_${password.value}` === hash.value;
  }
}

class FakeUserRepository implements UserRepository {
  private store = new Map<string, User>();

  async save(user: User): Promise<Result<void, DomainError>> {
    this.store.set(user.id.value, user);
    return Result.ok(undefined);
  }

  async findByEmail(email: Email): Promise<Result<User | null, DomainError>> {
    const user = Array.from(this.store.values()).find((u) => u.email.equals(email)) ?? null;
    return Result.ok(user);
  }

  async findByUserName(username: UserName): Promise<Result<User | null, DomainError>> {
    const user = Array.from(this.store.values()).find((u) => u.name.equals(username)) ?? null;
    return Result.ok(user);
  }

  async findById(id: UserId): Promise<Result<User | null, DomainError>> {
    return Result.ok(this.store.get(id.value) ?? null);
  }
}

describe("RegisterUser Use Case", () => {
  let userRepository: UserRepository;
  let passwordHasher: IPasswordHasher;
  let registerUser: RegisterUser;

  beforeEach(() => {
    userRepository = new FakeUserRepository();
    passwordHasher = new MockPasswordHasher();
    registerUser = new RegisterUser(userRepository, passwordHasher);
  });

  it("should register a new user successfully", async () => {
    const dto: RegisterUserDTO = {
      email: "test@example.com",
      name: "John Doe",
      password: "password123",
    };

    const result = await registerUser.execute(dto);

    expect(result.isSuccess).toBe(true);
    const emailOrError = Email.create(dto.email);
    expect(emailOrError.isSuccess).toBe(true);
    
    const savedUserResult = await userRepository.findByEmail(emailOrError.getValue());
    expect(savedUserResult.isSuccess).toBe(true);
    const savedUser = savedUserResult.getValue();
    expect(savedUser).not.toBeNull();
    expect(savedUser?.name.value).toBe("John Doe");
    expect(savedUser?.passwordHash.value).toBe("hashed_password123");
  });

  it("should fail if name is invalid", async () => {
    const dto: RegisterUserDTO = {
      email: "test@example.com",
      name: "",
      password: "password123",
    };

    const result = await registerUser.execute(dto);

    expect(result.isFailure).toBe(true);
  });

  it("should fail if email is invalid", async () => {
    const dto: RegisterUserDTO = {
      email: "invalid-email",
      name: "John Doe",
      password: "password123",
    };

    const result = await registerUser.execute(dto);

    expect(result.isFailure).toBe(true);
  });

  it("should fail if password is too short", async () => {
    const dto: RegisterUserDTO = {
      email: "test@example.com",
      name: "John Doe",
      password: "123",
    };

    const result = await registerUser.execute(dto);

    expect(result.isFailure).toBe(true);
  });

  it("should fail if user already exists", async () => {
    const dto: RegisterUserDTO = {
      email: "test@example.com",
      name: "John Doe",
      password: "password123",
    };

    // Primer registro
    const firstResult = await registerUser.execute(dto);
    expect(firstResult.isSuccess).toBe(true);

    // Verifica que el usuario está en el repositorio
    const email = Email.create(dto.email).getValue();
    const existing = await userRepository.findByEmail(email);
    expect(existing.getValue()).not.toBeNull();

    // Segundo registro con el mismo email
    const result = await registerUser.execute(dto);

    expect(result.isFailure).toBe(true);
    // Opcionalmente comprueba el mensaje de error
    // expect(result.error?.message).toContain("exists");
  });
});

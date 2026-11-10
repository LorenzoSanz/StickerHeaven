/// <reference types="bun-types" />

import { describe, it, expect, mock, beforeEach } from "bun:test";
import { LoginUser, InvalidCredentialsError } from "./LoginUser";
import { UserRepository } from "../../domain/UserRepository";
import { IPasswordHasher } from "../../domain/IPasswordHasher";
import { SessionRepository } from "../../domain/SessionRepository";
import { User } from "../../domain/User";
import { Session } from "../../domain/Session";
import { Email } from "../../domain/Email";
import { HashedPassword } from "../../domain/HashedPassword";
import { UserName } from "../../domain/UserName";
import { UserRole } from "../../domain/UserRole";

import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";

describe("LoginUser Use Case", () => {
  let loginUser: LoginUser;
  let mockRepo: UserRepository;
  let mockHasher: IPasswordHasher;
  let mockSessionRepo: SessionRepository;

  // Test Data
  const validEmailStr = "ermakina@example.com";
  const validPasswordStr = "securePass123";
  const wrongPasswordStr = "wrongPass123";
  const validHash = HashedPassword.create("$argon2id$v=19$m=65536,t=3,p=4$HASH").getValue();
  const validName = UserName.create("John Doe").getValue();

  beforeEach(() => {
    // Reset mocks
    mockRepo = {
      save: mock(() => Promise.resolve(Result.ok<void, DomainError>())),
      findByEmail: mock(() => Promise.resolve(Result.ok<User | null, DomainError>(null))), // Default: user not found
    } as unknown as UserRepository;

    mockHasher = {
      hash: mock(() => Promise.resolve(validHash)),
      compare: mock(() => Promise.resolve(false)), // Default: no match
    } as unknown as IPasswordHasher;

    mockSessionRepo = {
        save: mock(() => Promise.resolve(Result.ok<void, DomainError>())),
        findById: mock(() => Promise.resolve(Result.ok<Session | null, DomainError>(null))),
        delete: mock(() => Promise.resolve(Result.ok<void, DomainError>())),
        findUserBySessionId: mock(() => Promise.resolve(Result.ok<User | null, DomainError>(null))),
    } as unknown as SessionRepository;

    loginUser = new LoginUser(mockRepo, mockHasher, mockSessionRepo);
  });

  it("should login successfully with valid credentials", async () => {
    const email = Email.create(validEmailStr).value;
    const user = User.create({
      email: email,
      name: validName,
      role: UserRole.Customer(),
      passwordHash: validHash,
      createdAt: new Date(),
    }).value;

    // Mock Repo returning user
    mockRepo.findByEmail = mock(() =>
      Promise.resolve(Result.ok<User | null, DomainError>(user))
    );
    // Mock Hasher returning true
    mockHasher.compare = mock(() => Promise.resolve(true));

    const result = await loginUser.execute({
      email: validEmailStr,
      password: validPasswordStr,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.user.email).toBe(validEmailStr);
    expect(result.value.sessionId).toBeDefined();
    expect(mockRepo.findByEmail).toHaveBeenCalled();
    expect(mockHasher.compare).toHaveBeenCalled();
    expect(mockSessionRepo.save).toHaveBeenCalled();
  });

  it("should fail when user does not exist", async () => {
    mockRepo.findByEmail = mock(() =>
      Promise.resolve(Result.ok<User | null, DomainError>(null))
    );

    const result = await loginUser.execute({
      email: "nonexistent@example.com",
      password: validPasswordStr,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(InvalidCredentialsError);
  });

  it("should fail when password does not match", async () => {
    const email = Email.create(validEmailStr).value;
    const user = User.create({
      email: email,
      name: validName,
      role: UserRole.Customer(),
      passwordHash: validHash,
      createdAt: new Date(),
    }).value;

    mockRepo.findByEmail = mock(() =>
      Promise.resolve(Result.ok<User | null, DomainError>(user))
    );
    // Mock Hasher returning false
    mockHasher.compare = mock(() => Promise.resolve(false));

    const result = await loginUser.execute({
      email: validEmailStr,
      password: wrongPasswordStr,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(InvalidCredentialsError);
  });

  it("should fail with invalid email format", async () => {
    const result = await loginUser.execute({
      email: "invalid-email",
      password: validPasswordStr,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(InvalidCredentialsError);
    // Nota: ocultamos deliberadamente el error de validación específico por seguridad en Login
  });

  it("runs a password verification even when the email is unknown", async () => {
    const result = await loginUser.execute({ email: "nobody@example.com", password: validPasswordStr });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(InvalidCredentialsError);
    expect(mockHasher.compare).toHaveBeenCalledTimes(1);
  });
});

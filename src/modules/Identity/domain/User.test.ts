/**
 * POR QUÉ: Prueba el User Aggregate.
 * INTEGRIDAD: Verifica user creation, invariants, and behavior.
 * ESTRUCTURA: Suite de tests - Domain Unit Pruebas.
 */
import { describe, it, expect } from "bun:test";
import { User } from "./User";
import { Email } from "./Email";
import { UserName } from "./UserName";
import { HashedPassword } from "./HashedPassword";
import { UserRole } from "./UserRole";
import { UserRoles } from "./UserRole";
import { UserId } from "./UserId";

describe("User Aggregate", () => {
  const validEmail = Email.create("test@example.com").getValue();
  const validName = UserName.create("John Doe").getValue();
  const validPasswordHash = HashedPassword.create("hashed_secret").getValue();
  const validRole = UserRole.Customer();

  it("should create a valid User", () => {
    const userResult = User.create({
      email: validEmail,
      name: validName,
      passwordHash: validPasswordHash,
      role: validRole,
      createdAt: new Date(),
    });

    expect(userResult.isSuccess).toBe(true);
    const user = userResult.getValue();
    expect(user.email.value).toBe("test@example.com");
    expect(user.name.value).toBe("John Doe");
    expect(user.role.value).toBe(UserRoles.CUSTOMER);
    expect(user.id).toBeDefined();
    expect(user.id).toBeInstanceOf(UserId);
  });

  it("should recreate a User with an existing ID", () => {
    const existingId = UserId.create(crypto.randomUUID()).getValue();
    const userResult = User.create({
        email: validEmail,
        name: validName,
        passwordHash: validPasswordHash,
        role: validRole,
        createdAt: new Date(),
    }, existingId);

    expect(userResult.isSuccess).toBe(true);
    expect(userResult.getValue().id.equals(existingId)).toBe(true);
  });
});

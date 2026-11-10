
import { User } from "../../../domain/User";
import { Email } from "../../../domain/Email";
import { UserName } from "../../../domain/UserName";
import { HashedPassword } from "../../../domain/HashedPassword";
import { UserRole } from "../../../domain/UserRole";
import { UserDocument } from "./UserModel";
import { UserId } from "../../../domain/UserId";

export class UserMapper {
  /**
   * Reconstituye una entidad de dominio a partir de datos persistidos.
   * Lanza si los datos en la base de datos son inválidos (corrupción).
   */
  public static toDomain(raw: UserDocument): User {
    const emailResult = Email.create(raw.email);
    const nameResult = UserName.create(raw.name);
    const passwordHashResult = HashedPassword.create(raw.passwordHash);
    const roleResult = UserRole.create(raw.role);
    const userIdResult = UserId.create(raw._id);
    
    if (emailResult.isFailure) {
      throw new Error(`Invalid email in persistence: ${raw.email}`);
    }

    if (nameResult.isFailure) {
      throw new Error(`Invalid name in persistence: ${raw.name}`);
    }

    if (passwordHashResult.isFailure) {
      throw new Error(`Invalid password hash in persistence`);
    }

    if (roleResult.isFailure) {
      throw new Error(`Invalid role in persistence: ${raw.role}`);
    }

    if (userIdResult.isFailure) {
      throw new Error(`Invalid userId in persistence: ${raw._id}`);
    }

    return User.reconstitute(
      {
        email: emailResult.value,
        name: nameResult.value,
        passwordHash: passwordHashResult.value,
        role: roleResult.value,
        createdAt: raw.createdAt,
      },
      userIdResult.value
    );
  }

  /**
   * Extrae datos de la entidad de dominio para persistencia.
   */
  public static toPersistence(user: User): Partial<UserDocument> {
    return {
      _id: user.id.value,
      email: user.email.value,
      name: user.name.value,
      passwordHash: user.passwordHash.value,
      role: user.role.value,
      createdAt: user.createdAt, 
    };
  }
}

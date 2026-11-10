/**
 * POR QUÉ: Define el contrato para user persistence.
 * INTEGRIDAD: Patrón Repository (Puerto). Permite que el Domain sea agnóstico de la tecnología de base de datos.
 * ESTRUCTURA: Capa Domain - Interface only. Implementation belongs in Infrastructure.
 */

import { User } from "./User";
import { Result } from "../../../shared/domain/Result";
import { DomainError } from "../../../shared/domain/DomainError";
import { UserId } from "./UserId";
import { Email } from "./Email";
import { UserName } from "./UserName";

export interface UserRepository {
  /**
   * Persists a user entity.
   * @param user - User aggregate to save.
   */
  save(user: User): Promise<Result<void, DomainError>>;

  /**
   * Finds a user by their email address.
   * @param email - Email value object.
   */
  findByEmail(email: Email): Promise<Result<User | null, DomainError>>;

  /**
   * Finds a user by their username.
   * @param username - UserName value object.
   */
  findByUserName(username: UserName): Promise<Result<User | null, DomainError>>;

  /**
   * Finds a user by their unique ID.
   * @param id - UserId value object.
   */
  findById(id: UserId): Promise<Result<User | null, DomainError>>;
}

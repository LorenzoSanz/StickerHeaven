/**
 * POR QUÉ: Implements password hashing using Argon2.
 * INTEGRIDAD: Patrón Adapter. Implementa el puerto IPasswordHasher definido en Domain.
 * ESTRUCTURA: Capa de infraestructura - Dependencia directa con 'argon2'.
 */

import * as argon2 from "argon2";
import { IPasswordHasher } from "../../domain/IPasswordHasher";
import { Password } from "../../domain/Password";
import { HashedPassword } from "../../domain/HashedPassword";

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class Argon2PasswordHasher implements IPasswordHasher {
  async hash(password: Password): Promise<HashedPassword> {
    const hashed = await argon2.hash(password.value);
    // Asumimos que argon2 siempre devuelve un hash válido
    return HashedPassword.create(hashed).getValue();
  }

  async compare(password: Password, hash: HashedPassword): Promise<boolean> {
    return await argon2.verify(hash.value, password.value);
  }
}

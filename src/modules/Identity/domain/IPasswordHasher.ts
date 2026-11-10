/**
 * POR QUÉ: Define el contrato para servicios de hash de contraseñas.
 * INTEGRIDAD: Patrón Adapter (Puerto). Desacopla Domain de la implementación de infraestructura.
 * ESTRUCTURA: Capa Domain - el dominio no conoce Argon2 ni Bcrypt.
 */

import { Password } from "./Password";
import { HashedPassword } from "./HashedPassword";

export interface IPasswordHasher {
  hash(password: Password): Promise<HashedPassword>;
  compare(password: Password, hash: HashedPassword): Promise<boolean>;
}

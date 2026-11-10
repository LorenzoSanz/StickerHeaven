
import * as argon2 from "argon2";
import { IPasswordHasher } from "@/modules/Identity/domain/IPasswordHasher";
import { Password } from "@/modules/Identity/domain/Password";
import { HashedPassword } from "@/modules/Identity/domain/HashedPassword";

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

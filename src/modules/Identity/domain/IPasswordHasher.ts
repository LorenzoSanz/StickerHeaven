
import { Password } from "./Password";
import { HashedPassword } from "./HashedPassword";

export interface IPasswordHasher {
  hash(password: Password): Promise<HashedPassword>;
  compare(password: Password, hash: HashedPassword): Promise<boolean>;
}

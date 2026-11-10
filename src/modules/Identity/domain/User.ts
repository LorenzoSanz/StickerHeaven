
import { Entity } from "@/shared/domain/Entity";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { Email } from "./Email";
import { UserName } from "./UserName";
import { HashedPassword } from "./HashedPassword";
import { UserRole } from "./UserRole";
import { UserId } from "./UserId";

export interface UserProps {
  email: Email;
  name: UserName;
  passwordHash: HashedPassword;
  role: UserRole;
  createdAt: Date;
}

export class User extends Entity<UserProps, UserId> {
  private constructor(props: UserProps, id: UserId) {
    super(props, id);
  }

  public static reconstitute(props: UserProps, id: UserId): User {
    return new User(props, id);
  }

  public static create(props: UserProps, id?: UserId): Result<User, DomainError> {
    // Aquí se pueden añadir comprobaciones de invariantes
    const user = new User({
      ...props,
      createdAt: props.createdAt ? new Date(props.createdAt) : new Date(),
    }, id ? id : UserId.random());
    return Result.ok(user);
  }

  get email(): Email {
    return this.props.email;
  }

  get name(): UserName {
    return this.props.name;
  }

  get passwordHash(): HashedPassword {
    return this.props.passwordHash;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get createdAt(): Date {
    return new Date(this.props.createdAt);
  }

  public changeName(name: UserName): void {
    this.props.name = name;
  }

  public changeEmail(email: Email): void {
    this.props.email = email;
  }

  public changePassword(passwordHash: HashedPassword): void {
    this.props.passwordHash = passwordHash;
  }
}

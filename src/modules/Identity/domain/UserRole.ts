/**
 * POR QUÉ: Objeto de Valor que representa el rol del usuario.
 * INTEGRIDAD: Impone invariantes del valor.
 * ESTRUCTURA: Capa Domain.
 */
import { ValueObject } from "../../../shared/domain/ValueObject";
import { Result } from "../../../shared/domain/Result";
import { DomainError } from "../../../shared/domain/DomainError";

export enum UserRoles {
  ADMIN = "ADMIN",
  CUSTOMER = "CUSTOMER"
}

export type UserRoleType = UserRoles;

interface UserRoleProps {
  value: UserRoleType;
}

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class InvalidUserRoleError extends DomainError {
  constructor(role: string) {
    super(`Rol de usuario inválido: ${role}`);
  }
}

export class UserRole extends ValueObject<UserRoleProps> {
  private constructor(props: UserRoleProps) {
    super(props);
  }

  get value(): UserRoleType {
    return this.props.value;
  }

  public static create(role: string): Result<UserRole, InvalidUserRoleError> {
    if (role !== UserRoles.ADMIN && role !== UserRoles.CUSTOMER) {
      return Result.fail(new InvalidUserRoleError(role));
    }
    
    return Result.ok(new UserRole({ value: role as UserRoleType }));
  }

  public static Customer(): UserRole {
      return new UserRole({ value: UserRoles.CUSTOMER });
  }

  public static Admin(): UserRole {
      return new UserRole({ value: UserRoles.ADMIN });
  }

  public isAdmin(): boolean {
      return this.props.value === UserRoles.ADMIN;
  }
}

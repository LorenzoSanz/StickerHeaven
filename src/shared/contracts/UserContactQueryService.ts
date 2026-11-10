/**
 * POR QUÉ: Algunos flujos (p.ej. Sales) requieren datos de contacto del usuario sin depender del módulo Identity internamente.
 * QUÉ: Define un Query Service (solo lectura) para resolver email por userId como contrato entre módulos.
 * LÍMITES: No implementa persistencia ni reglas de acceso; la implementación vive en el módulo Identity (infra/queries).
 */
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";

export interface UserContactQueryService {
  getEmailByUserId(userId: string): Promise<Result<string | null, DomainError>>;
}

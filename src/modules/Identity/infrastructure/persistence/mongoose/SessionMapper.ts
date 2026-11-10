
/**
 * POR QUÉ: Converts between Domain Entities and Persistence Models (Mongoose Documents).
 * INTEGRIDAD: Patrón Data Mapper. Mantiene el Domain aislado de detalles de base de datos.
 * ESTRUCTURA: Capa de infraestructura - Mapper.
 */
import { Session, SessionProps } from "../../../domain/Session";
import { SessionDocument } from "./SessionModel";
import { SessionId } from "../../../domain/SessionId";
import { UserId } from "../../../domain/UserId";

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class SessionMapper {
  static toDomain(raw: SessionDocument): Session {
    return Session.reconstitute({
        userId: UserId.create(raw.userId).getValue(),
        createdAt: raw.createdAt,
        expiresAt: raw.expiresAt,
    }, SessionId.create(raw._id).getValue());
  }

  static toPersistence(session: Session): SessionDocument {
    return {
        _id: session.id.value,
        userId: session.userId.value,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
    } as SessionDocument;
  }
}

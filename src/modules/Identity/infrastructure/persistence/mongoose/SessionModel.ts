
/**
 * POR QUÉ: Define el esquema de Mongoose para almacenamiento de Session.
 * INTEGRIDAD: Preocupación de infraestructura. Refleja la estructura de base de datos.
 * ESTRUCTURA: Capa de infraestructura - Persistence implementation detail.
 */
import mongoose, { Schema, Document } from "mongoose";

export interface SessionDocument extends Omit<Document, '_id'> {
  _id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
}

const SessionSchema = new Schema<SessionDocument>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    createdAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: false,
    _id: false,
  }
);

// POR QUÉ: TTL Index to automatically remove expired sessions.
// MongoDB ejecuta una tarea en segundo plano para eliminar documentos cuyo campo indexado es más antiguo que `expireAfterSeconds`.
// Como almacenamos la expiración absoluta en `expiresAt`, fijamos `expireAfterSeconds: 0`.
// Esto significa: "Eliminar este documento 0 segundos después del tiempo indicado en expiresAt".
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SessionModel = mongoose.model<SessionDocument>("Session", SessionSchema);

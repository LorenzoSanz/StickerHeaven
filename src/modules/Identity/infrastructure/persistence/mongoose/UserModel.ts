/**
 * POR QUÉ: Define el esquema de Mongoose para almacenamiento de User.
 * INTEGRIDAD: Preocupación de infraestructura. Refleja la estructura de base de datos, que puede diferir del Domain.
 * ESTRUCTURA: Capa de infraestructura - Persistence implementation detail.
 */
import mongoose, { Schema, Document } from "mongoose";

export interface UserDocument extends Omit<Document, '_id'> {
  _id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    _id: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, default: "CUSTOMER" },
    createdAt: { type: Date, required: true },
  },
  {
    timestamps: false,
    _id: false, // We handle _id manually (UUID)
  }
);

export const UserModel = mongoose.model<UserDocument>("User", UserSchema);

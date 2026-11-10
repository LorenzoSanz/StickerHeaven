
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

SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SessionModel = mongoose.model<SessionDocument>("Session", SessionSchema);

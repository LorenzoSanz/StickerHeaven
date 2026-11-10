/**
 * POR QUÉ: Mongoose Schema for Sticker.
 * INTEGRIDAD: Define la estructura del documento Sticker en MongoDB.
 * ESTRUCTURA: Capa de infraestructura - Persistence Model.
 */
import mongoose, { Schema, Document } from "mongoose";

export interface IStickerDocument extends Omit<Document, "_id"> {
  _id: string;
  ownerId: string;
  name: string;
  description: string;
  price: {
    amount: number;
    currency: string;
  };
  stock: number;
  imageUrl: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

const StickerSchema = new Schema<IStickerDocument>({
  _id: { type: String, required: true },
  ownerId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: { type: String, required: false },
  price: {
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "EUR" },
  },
  stock: { type: Number, required: true, default: 0 },
  imageUrl: { type: String, required: true },
  tags: [{ type: String }],
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
});

// Indexes para optimización de consultas.
StickerSchema.index({ name: "text", description: "text" }); // Text Search
StickerSchema.index({ "price.amount": 1 }); // Range filtering
StickerSchema.index({ tags: 1 }); // Tag filtering

export const StickerModel = mongoose.model<IStickerDocument>("Sticker", StickerSchema);

/**
 * POR QUÉ: Database schema definition for Cart.
 * INTEGRIDAD: Impone invariantes del valor.
 * ESTRUCTURA: Capa de infraestructura - ODM Schema.
 */
import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  stickerId: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  addedAt: { type: Date, required: true }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // CartId
  userId: { type: String, default: null, index: true },
  anonymousId: { type: String, default: null, index: true },
  items: [cartItemSchema]
}, {
  timestamps: true,
  optimisticConcurrency: true, // Enables OCC via __v
  versionKey: "__v"
});

export interface ICartItemDocument {
  stickerId: string;
  quantity: number;
  addedAt: Date;
}

export interface ICartDocument extends Omit<mongoose.Document, '_id'> {
  _id: string;
  userId: string | null;
  anonymousId: string | null;
  items: ICartItemDocument[];
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export const CartModel = mongoose.models.Cart || mongoose.model<ICartDocument>("Cart", cartSchema);

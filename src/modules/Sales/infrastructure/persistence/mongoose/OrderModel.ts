import mongoose, { Schema, Document } from "mongoose";

export interface IMoneyDocument {
  amount: number;
  currency: string;
}

export interface IOrderItemDocument {
  stickerId: string;
  stickerName: string; // Added
  stickerImageUrl: string; // Added
  quantity: number;
  unitPrice: IMoneyDocument;
}

export interface IOrderDocument extends Omit<Document, "_id"> {
  _id: string;
  userId: string;
  items: IOrderItemDocument[];
  totalAmount: IMoneyDocument;
  status: string;
  paymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

const OrderSchema = new Schema<IOrderDocument>({
  _id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  items: [{
    stickerId: { type: String, required: true },
    stickerName: { type: String, required: true }, // Added
    stickerImageUrl: { type: String, required: true }, // Added
    quantity: { type: Number, required: true },
    unitPrice: {
      amount: { type: Number, required: true },
      currency: { type: String, required: true }
    },
  }],
  totalAmount: {
    amount: { type: Number, required: true },
    currency: { type: String, required: true }
  },
  status: { type: String, required: true, default: "PENDING_PAYMENT" },
  paymentIntentId: { type: String, index: true },
  createdAt: { type: Date, required: true, default: Date.now, index: true },
  updatedAt: { type: Date, required: true, default: Date.now },
});

export const OrderModel = mongoose.model<IOrderDocument>("Order", OrderSchema);

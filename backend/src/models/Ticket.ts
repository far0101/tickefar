import { Schema, model, Document, Types } from 'mongoose';

export interface ITicket extends Document {
  user: Types.ObjectId;
  event: Types.ObjectId;
  eventDate: Date;
  sectorName: string;
  quantity: number;
  totalPrice: number;
  purchaseCode: string;
  createdAt: Date;
}

const ticketSchema = new Schema<ITicket>(
  {
    user:         { type: Schema.Types.ObjectId, ref: 'User', required: true },
    event:        { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    eventDate:    { type: Date, required: true },
    sectorName:   { type: String, required: true },
    quantity:     { type: Number, required: true, min: 1 },
    totalPrice:   { type: Number, required: true },
    purchaseCode: { type: String, required: true, unique: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Ticket = model<ITicket>('Ticket', ticketSchema);

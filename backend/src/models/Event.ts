import { Schema, model, Document, Types } from 'mongoose';

export interface ISector {
  name: string;
  price: number;
  availableTickets: number;
}

export interface IEvent extends Document {
  title: string;
  artist: string;
  category: 'Recital' | 'Freestyle' | 'Teatro' | 'Stand-Up';
  dates: Date[];
  imageUrl: string;
  venue: Types.ObjectId;
  sectors: ISector[];
}

const eventSchema = new Schema<IEvent>({
  title:    { type: String, required: true, trim: true },
  artist:   { type: String, required: true, trim: true },
  category: { type: String, enum: ['Recital', 'Freestyle', 'Teatro', 'Stand-Up'], required: true },
  dates:    {
    type: [Date],
    required: true,
    validate: {
      validator: (v: Date[]) => v.length >= 1 && v.length <= 2,
      message: 'dates debe tener entre 1 y 2 fechas',
    },
  },
  imageUrl: { type: String, required: true },
  venue:    { type: Schema.Types.ObjectId, ref: 'Venue', required: true },
  sectors:  [
    {
      name:             { type: String, required: true },
      price:            { type: Number, required: true },
      availableTickets: { type: Number, required: true },
    },
  ],
});

export const Event = model<IEvent>('Event', eventSchema);

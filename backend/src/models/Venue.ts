import { Schema, model, Document } from 'mongoose';

export interface IVenue extends Document {
  name: string;
  address: string;
  city: string;
  capacity: number;
  sectors: string[];
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
}

const venueSchema = new Schema<IVenue>({
  name:     { type: String, required: true, trim: true },
  address:  { type: String, required: true },
  city:     { type: String, required: true },
  capacity: { type: Number, required: true },
  sectors:  [{ type: String }],
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
});

venueSchema.index({ location: '2dsphere' });

export const Venue = model<IVenue>('Venue', venueSchema);

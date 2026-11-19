import { Venue } from '../models/Venue';
import type { IVenue } from '../models/Venue';

interface NearQuery {
  lng: number;
  lat: number;
  maxDistance: number;
}

export async function getVenues(near?: NearQuery): Promise<IVenue[]> {
  if (near) {
    return Venue.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [near.lng, near.lat] },
          $maxDistance: near.maxDistance,
        },
      },
    });
  }
  return Venue.find();
}

export async function createVenue(data: Partial<IVenue>): Promise<IVenue> {
  return Venue.create(data);
}

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { getVenues, createVenue } from '../services/venue.service';

export async function listVenues(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { lng, lat, maxDistance } = req.query;

    if (lng && lat) {
      const venues = await getVenues({
        lng:         Number(lng),
        lat:         Number(lat),
        maxDistance: maxDistance ? Number(maxDistance) : 10000,
      });
      res.json(venues);
      return;
    }

    const venues = await getVenues();
    res.json(venues);
  } catch (err) {
    next(err);
  }
}

export async function addVenue(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const venue = await createVenue(req.body as Parameters<typeof createVenue>[0]);
    res.status(201).json(venue);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.errors[0]?.message });
      return;
    }
    next(err);
  }
}

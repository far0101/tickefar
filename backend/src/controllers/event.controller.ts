import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { eventSchema } from '../schemas/event.schema';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../services/event.service';

export async function listEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { category, venue, search } = req.query;
    const events = await getEvents({
      category: typeof category === 'string' ? category : undefined,
      venue:    typeof venue    === 'string' ? venue    : undefined,
      search:   typeof search   === 'string' ? search   : undefined,
    });
    res.json(events);
  } catch (err) {
    next(err);
  }
}

export async function getEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const event = await getEventById(req.params['id'] ?? '');
    if (!event) {
      res.status(404).json({ message: 'Evento no encontrado' });
      return;
    }
    res.json(event);
  } catch (err) {
    next(err);
  }
}

export async function addEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data  = eventSchema.parse(req.body);
    const event = await createEvent(data);
    res.status(201).json(event);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.errors[0]?.message });
      return;
    }
    next(err);
  }
}

export async function editEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data  = eventSchema.partial().parse(req.body);
    const event = await updateEvent(req.params['id'] ?? '', data);
    if (!event) {
      res.status(404).json({ message: 'Evento no encontrado' });
      return;
    }
    res.json(event);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.errors[0]?.message });
      return;
    }
    next(err);
  }
}

export async function removeEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const event = await deleteEvent(req.params['id'] ?? '');
    if (!event) {
      res.status(404).json({ message: 'Evento no encontrado' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

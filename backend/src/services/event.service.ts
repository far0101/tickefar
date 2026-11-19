import { Event } from '../models/Event';
import type { IEvent } from '../models/Event';
import type { EventInput } from '../schemas/event.schema';

interface EventFilters {
  category?: string;
  venue?: string;
  search?: string;
}

export async function getEvents(filters: EventFilters): Promise<IEvent[]> {
  const query: Record<string, unknown> = {};

  if (filters.category) query['category'] = filters.category;
  if (filters.venue)    query['venue']    = filters.venue;
  if (filters.search) {
    query['$or'] = [
      { title:  { $regex: filters.search, $options: 'i' } },
      { artist: { $regex: filters.search, $options: 'i' } },
    ];
  }

  return Event.find(query).populate('venue');
}

export async function getEventById(id: string): Promise<IEvent | null> {
  return Event.findById(id).populate('venue');
}

export async function createEvent(data: EventInput): Promise<IEvent> {
  return Event.create(data);
}

export async function updateEvent(id: string, data: Partial<EventInput>): Promise<IEvent | null> {
  return Event.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('venue');
}

export async function deleteEvent(id: string): Promise<IEvent | null> {
  return Event.findByIdAndDelete(id);
}

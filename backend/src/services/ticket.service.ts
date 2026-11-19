import { randomUUID } from 'crypto';
import { Event } from '../models/Event';
import { Ticket } from '../models/Ticket';
import type { ITicket } from '../models/Ticket';
import type { TicketInput } from '../schemas/ticket.schema';
import { io } from '../index';

export function calcTotal(price: number, quantity: number): number {
  return price * quantity;
}

export function hasStock(available: number, quantity: number): boolean {
  return available >= quantity;
}

export async function purchaseTicket(
  userId: string,
  data: TicketInput,
): Promise<ITicket> {
  const event = await Event.findById(data.event);
  if (!event) {
    const err = Object.assign(new Error('Evento no encontrado'), { statusCode: 404 });
    throw err;
  }

  const validDate = event.dates.some(
    (d) => new Date(d).toDateString() === new Date(data.eventDate).toDateString(),
  );
  if (!validDate) {
    const err = Object.assign(new Error('Fecha inválida para este evento'), { statusCode: 400 });
    throw err;
  }

  const sector = event.sectors.find((s) => s.name === data.sectorName);
  if (!sector) {
    const err = Object.assign(new Error('Sector no encontrado'), { statusCode: 404 });
    throw err;
  }

  if (!hasStock(sector.availableTickets, data.quantity)) {
    const err = Object.assign(new Error('Stock insuficiente'), { statusCode: 409 });
    throw err;
  }

  sector.availableTickets -= data.quantity;
  await event.save();

  const totalPrice   = calcTotal(sector.price, data.quantity);
  const purchaseCode = randomUUID().replace(/-/g, '').toUpperCase().slice(0, 12);

  const ticket = await Ticket.create({
    user:      userId,
    event:     data.event,
    eventDate: data.eventDate,
    sectorName: data.sectorName,
    quantity:   data.quantity,
    totalPrice,
    purchaseCode,
  });

  io.emit('stockUpdated', { eventId: data.event, sectors: event.sectors });

  return ticket;
}

export async function getMyTickets(userId: string): Promise<ITicket[]> {
  return Ticket.find({ user: userId })
    .populate({ path: 'event', populate: { path: 'venue' } });
}

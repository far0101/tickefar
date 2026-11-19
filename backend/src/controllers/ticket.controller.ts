import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ticketSchema } from '../schemas/ticket.schema';
import { purchaseTicket, getMyTickets } from '../services/ticket.service';

export async function buyTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }
    const data   = ticketSchema.parse(req.body);
    const ticket = await purchaseTicket(userId, data);
    res.status(201).json(ticket);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.errors[0]?.message });
      return;
    }
    next(err);
  }
}

export async function myTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }
    const tickets = await getMyTickets(userId);
    res.json(tickets);
  } catch (err) {
    next(err);
  }
}

import { z } from 'zod';

export const ticketSchema = z.object({
  event:      z.string().length(24, 'ID de evento inválido'),
  eventDate:  z.coerce.date(),
  sectorName: z.string().min(1),
  quantity:   z.number().int().min(1).max(10),
});

export type TicketInput = z.infer<typeof ticketSchema>;

import { z } from 'zod';

const sectorSchema = z.object({
  name:             z.string().min(1),
  price:            z.number().positive(),
  availableTickets: z.number().int().nonnegative(),
});

export const eventSchema = z.object({
  title:    z.string().min(1).trim(),
  artist:   z.string().min(1).trim(),
  category: z.enum(['Recital', 'Freestyle', 'Teatro', 'Stand-Up']),
  dates: z
    .array(z.coerce.date())
    .min(1, 'Mínimo 1 fecha')
    .max(2, 'Máximo 2 fechas'),
  imageUrl: z.string().url(),
  venue:    z.string().length(24, 'ID de venue inválido'),
  sectors:  z.array(sectorSchema).min(1, 'Al menos un sector'),
});

export type EventInput = z.infer<typeof eventSchema>;

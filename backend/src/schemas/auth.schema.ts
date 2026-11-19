import { z } from 'zod';

export const registerSchema = z.object({
  name:     z.string().min(2, 'El nombre debe tener al menos 2 caracteres').trim(),
  email:    z.string().email('Email inválido').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
});

export const loginSchema = z.object({
  email:    z.string().email('Email inválido').toLowerCase().trim(),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput    = z.infer<typeof loginSchema>;

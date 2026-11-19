import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { registerUser, loginUser } from '../services/auth.service';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data  = registerSchema.parse(req.body);
    const result = await registerUser(data);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.errors[0]?.message ?? 'Datos inválidos' });
      return;
    }
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data   = loginSchema.parse(req.body);
    const result = await loginUser(data);
    res.json(result);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.errors[0]?.message ?? 'Datos inválidos' });
      return;
    }
    next(err);
  }
}

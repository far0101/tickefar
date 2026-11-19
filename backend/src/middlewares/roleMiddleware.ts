import { Request, Response, NextFunction } from 'express';

export function roleMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Acceso restringido a administradores' });
    return;
  }
  next();
}

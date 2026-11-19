import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import type { RegisterInput, LoginInput } from '../schemas/auth.schema';

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET no configurado');
  return secret;
}

export async function registerUser(data: RegisterInput): Promise<{ token: string }> {
  const exists = await User.findOne({ email: data.email });
  if (exists) {
    const err = new Error('El email ya está registrado') as Error & { statusCode: number };
    err.statusCode = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(data.password, 10);
  const user   = await User.create({ name: data.name, email: data.email, password: hashed });

  const token = jwt.sign({ id: user._id.toString(), role: user.role }, getSecret(), {
    expiresIn: '4h',
  });

  return { token };
}

export async function loginUser(data: LoginInput): Promise<{ token: string }> {
  const user = await User.findOne({ email: data.email });
  if (!user) {
    const err = new Error('Credenciales inválidas') as Error & { statusCode: number };
    err.statusCode = 401;
    throw err;
  }

  const valid = await bcrypt.compare(data.password, user.password);
  if (!valid) {
    const err = new Error('Credenciales inválidas') as Error & { statusCode: number };
    err.statusCode = 401;
    throw err;
  }

  const token = jwt.sign({ id: user._id.toString(), role: user.role }, getSecret(), {
    expiresIn: '4h',
  });

  return { token };
}

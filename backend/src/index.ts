import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db';
import authRoutes   from './routes/auth.routes';
import venueRoutes  from './routes/venue.routes';
import eventRoutes  from './routes/event.routes';
import ticketRoutes from './routes/ticket.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }));
app.use(express.json());
app.use('/api', limiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth',    authRoutes);
app.use('/api/venues',  venueRoutes);
app.use('/api/events',  eventRoutes);
app.use('/api/tickets', ticketRoutes);

app.use(errorHandler);

io.on('connection', (socket) => {
  socket.on('disconnect', () => {});
});

const PORT = Number(process.env.PORT ?? 4000);

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      process.stdout.write(`Servidor corriendo en puerto ${PORT}\n`);
    });
  })
  .catch((err: unknown) => {
    process.stderr.write(`Error al conectar DB: ${String(err)}\n`);
    process.exit(1);
  });

export { io };

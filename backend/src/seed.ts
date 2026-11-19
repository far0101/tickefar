import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import { User } from './models/User';
import { Venue } from './models/Venue';
import { Event } from './models/Event';
import { Ticket } from './models/Ticket';

async function seed(): Promise<void> {
  await connectDB();

  // Limpiar
  await Promise.all([
    Ticket.deleteMany({}),
    Event.deleteMany({}),
    Venue.deleteMany({}),
    User.deleteMany({}),
  ]);

  // ── USERS ──────────────────────────────────────────────────────────────
  const [adminPass, userPass] = await Promise.all([
    bcrypt.hash('Admin123!', 10),
    bcrypt.hash('User123!', 10),
  ]);

  await User.insertMany([
    { name: 'Admin Tickefar', email: 'admin@tickefar.com', password: adminPass, role: 'admin' },
    { name: 'Faryd',          email: 'faryd@tickefar.com', password: userPass,  role: 'user'  },
  ]);

  // ── VENUES ─────────────────────────────────────────────────────────────
  const venueData = [
    {
      name: 'Movistar Arena',
      address: 'Av. Dr. Triviño 1548',
      city: 'Buenos Aires',
      capacity: 15000,
      sectors: ['Campo Delantero', 'Campo Trasero', 'Platea Baja', 'Platea Alta'],
      location: { type: 'Point' as const, coordinates: [-58.4397, -34.6180] },
    },
    {
      name: 'Teatro Vorterix',
      address: 'Monroe 3745',
      city: 'Buenos Aires',
      capacity: 3500,
      sectors: ['General'],
      location: { type: 'Point' as const, coordinates: [-58.4682, -34.5720] },
    },
    {
      name: 'C Complejo Art Media',
      address: 'Humboldt 1550',
      city: 'Buenos Aires',
      capacity: 2000,
      sectors: ['General', 'VIP'],
      location: { type: 'Point' as const, coordinates: [-58.4440, -34.5950] },
    },
    {
      name: 'Estadio Obras Sanitarias',
      address: 'Av. del Libertador 7395',
      city: 'Buenos Aires',
      capacity: 6000,
      sectors: ['Campo', 'Platea', 'Popular'],
      location: { type: 'Point' as const, coordinates: [-58.4904, -34.5451] },
    },
    {
      name: 'Teatro Gran Rex',
      address: 'Av. Corrientes 857',
      city: 'Buenos Aires',
      capacity: 1500,
      sectors: ['Platea Platino', 'Platea Oro', 'Pullman'],
      location: { type: 'Point' as const, coordinates: [-58.3802, -34.6035] },
    },
    {
      name: 'Paseo La Plaza',
      address: 'Av. Corrientes 1660',
      city: 'Buenos Aires',
      capacity: 800,
      sectors: ['Platea Preferencial', 'Platea General'],
      location: { type: 'Point' as const, coordinates: [-58.3889, -34.6031] },
    },
    {
      name: 'Niceto Club',
      address: 'Niceto Vega 5510',
      city: 'Buenos Aires',
      capacity: 1000,
      sectors: ['General'],
      location: { type: 'Point' as const, coordinates: [-58.4341, -34.5862] },
    },
  ];

  const venues = await Venue.insertMany(venueData);
  const [movistar, vorterix, artMedia, obras, granRex, paseoLaPlaza, niceto] = venues;

  // ── EVENTS ─────────────────────────────────────────────────────────────
  const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

  await Event.insertMany([
    // Movistar Arena (3)
    {
      title: 'Álvaro Díaz – Sayonara Tour',
      artist: 'Álvaro Díaz',
      category: 'Recital',
      dates: [d(2025, 3, 14), d(2025, 3, 15)],
      imageUrl: 'https://picsum.photos/seed/alvaro/800/450',
      venue: movistar._id,
      sectors: [
        { name: 'Campo Delantero', price: 25000, availableTickets: 2000 },
        { name: 'Campo Trasero',   price: 18000, availableTickets: 3000 },
        { name: 'Platea Baja',     price: 22000, availableTickets: 2500 },
        { name: 'Platea Alta',     price: 14000, availableTickets: 3000 },
      ],
    },
    {
      title: 'Rauw Alejandro',
      artist: 'Rauw Alejandro',
      category: 'Recital',
      dates: [d(2025, 4, 10), d(2025, 4, 11)],
      imageUrl: 'https://picsum.photos/seed/rauw/800/450',
      venue: movistar._id,
      sectors: [
        { name: 'Campo Delantero', price: 30000, availableTickets: 2000 },
        { name: 'Campo Trasero',   price: 22000, availableTickets: 3000 },
        { name: 'Platea Baja',     price: 27000, availableTickets: 2500 },
        { name: 'Platea Alta',     price: 18000, availableTickets: 3000 },
      ],
    },
    {
      title: 'FMS Argentina 2025',
      artist: 'FMS Argentina',
      category: 'Freestyle',
      dates: [d(2025, 5, 3)],
      imageUrl: 'https://picsum.photos/seed/fms/800/450',
      venue: movistar._id,
      sectors: [
        { name: 'Campo Delantero', price: 20000, availableTickets: 2000 },
        { name: 'Campo Trasero',   price: 15000, availableTickets: 3000 },
        { name: 'Platea Baja',     price: 18000, availableTickets: 2500 },
        { name: 'Platea Alta',     price: 12000, availableTickets: 3000 },
      ],
    },
    // Vorterix (2)
    {
      title: 'NSQK – Mostca Tour',
      artist: 'NSQK',
      category: 'Recital',
      dates: [d(2025, 3, 21), d(2025, 3, 22)],
      imageUrl: 'https://picsum.photos/seed/nsqk/800/450',
      venue: vorterix._id,
      sectors: [{ name: 'General', price: 16000, availableTickets: 3500 }],
    },
    {
      title: 'Lara91k',
      artist: 'Lara91k',
      category: 'Recital',
      dates: [d(2025, 4, 5)],
      imageUrl: 'https://picsum.photos/seed/lara91k/800/450',
      venue: vorterix._id,
      sectors: [{ name: 'General', price: 14000, availableTickets: 3500 }],
    },
    // C Art Media (2)
    {
      title: 'Latin Mafia',
      artist: 'Latin Mafia',
      category: 'Recital',
      dates: [d(2025, 5, 16), d(2025, 5, 17)],
      imageUrl: 'https://picsum.photos/seed/latinmafia/800/450',
      venue: artMedia._id,
      sectors: [
        { name: 'General', price: 12000, availableTickets: 1500 },
        { name: 'VIP',     price: 22000, availableTickets: 500  },
      ],
    },
    {
      title: 'Rels B',
      artist: 'Rels B',
      category: 'Recital',
      dates: [d(2025, 6, 7)],
      imageUrl: 'https://picsum.photos/seed/relsb/800/450',
      venue: artMedia._id,
      sectors: [
        { name: 'General', price: 13000, availableTickets: 1500 },
        { name: 'VIP',     price: 24000, availableTickets: 500  },
      ],
    },
    // Obras (2)
    {
      title: 'Tainy',
      artist: 'Tainy',
      category: 'Recital',
      dates: [d(2025, 4, 25)],
      imageUrl: 'https://picsum.photos/seed/tainy/800/450',
      venue: obras._id,
      sectors: [
        { name: 'Campo',   price: 18000, availableTickets: 2000 },
        { name: 'Platea',  price: 22000, availableTickets: 2000 },
        { name: 'Popular', price: 12000, availableTickets: 2000 },
      ],
    },
    {
      title: 'Mora',
      artist: 'Mora',
      category: 'Recital',
      dates: [d(2025, 5, 23), d(2025, 5, 24)],
      imageUrl: 'https://picsum.photos/seed/mora/800/450',
      venue: obras._id,
      sectors: [
        { name: 'Campo',   price: 16000, availableTickets: 2000 },
        { name: 'Platea',  price: 20000, availableTickets: 2000 },
        { name: 'Popular', price: 10000, availableTickets: 2000 },
      ],
    },
    // Gran Rex (2)
    {
      title: 'La Función Que Sale Mal',
      artist: 'La Función Que Sale Mal',
      category: 'Teatro',
      dates: [d(2025, 6, 13), d(2025, 6, 14)],
      imageUrl: 'https://picsum.photos/seed/lafuncion/800/450',
      venue: granRex._id,
      sectors: [
        { name: 'Platea Platino', price: 18000, availableTickets: 300 },
        { name: 'Platea Oro',     price: 14000, availableTickets: 700 },
        { name: 'Pullman',        price: 10000, availableTickets: 500 },
      ],
    },
    {
      title: 'Lucas Lauriente',
      artist: 'Lucas Lauriente',
      category: 'Stand-Up',
      dates: [d(2025, 7, 5)],
      imageUrl: 'https://picsum.photos/seed/lucas/800/450',
      venue: granRex._id,
      sectors: [
        { name: 'Platea Platino', price: 15000, availableTickets: 300 },
        { name: 'Platea Oro',     price: 12000, availableTickets: 700 },
        { name: 'Pullman',        price: 9000,  availableTickets: 500 },
      ],
    },
    // Paseo La Plaza (2)
    {
      title: 'Toc Toc',
      artist: 'Toc Toc',
      category: 'Teatro',
      dates: [d(2025, 6, 20), d(2025, 6, 21)],
      imageUrl: 'https://picsum.photos/seed/toctoc/800/450',
      venue: paseoLaPlaza._id,
      sectors: [
        { name: 'Platea Preferencial', price: 14000, availableTickets: 300 },
        { name: 'Platea General',      price: 10000, availableTickets: 500 },
      ],
    },
    {
      title: 'Soy Rada',
      artist: 'Soy Rada',
      category: 'Stand-Up',
      dates: [d(2025, 7, 12)],
      imageUrl: 'https://picsum.photos/seed/soyrada/800/450',
      venue: paseoLaPlaza._id,
      sectors: [
        { name: 'Platea Preferencial', price: 12000, availableTickets: 300 },
        { name: 'Platea General',      price: 9000,  availableTickets: 500 },
      ],
    },
    // Niceto (2)
    {
      title: 'Six Sex',
      artist: 'Six Sex',
      category: 'Recital',
      dates: [d(2025, 4, 18)],
      imageUrl: 'https://picsum.photos/seed/sixsex/800/450',
      venue: niceto._id,
      sectors: [{ name: 'General', price: 9000, availableTickets: 1000 }],
    },
    {
      title: 'Aquihayaquihay',
      artist: 'Aquihayaquihay',
      category: 'Freestyle',
      dates: [d(2025, 5, 9)],
      imageUrl: 'https://picsum.photos/seed/aqui/800/450',
      venue: niceto._id,
      sectors: [{ name: 'General', price: 8000, availableTickets: 1000 }],
    },
  ]);

  process.stdout.write('Seed completado: 2 users, 7 venues, 15 events\n');
  await mongoose.disconnect();
}

seed().catch((err: unknown) => {
  process.stderr.write(`Error en seed: ${String(err)}\n`);
  process.exit(1);
});

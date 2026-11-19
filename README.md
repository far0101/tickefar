# Tickefar

Ticketera full-stack — Trabajo Integrador 7° año Técnico en Programación (Buenos Aires).

## Stack

| Capa | Tecnologías |
|------|------------|
| Backend | Node.js · Express · TypeScript · Mongoose · Zod · JWT · Socket.io |
| Frontend | React · Vite · TypeScript · MUI v6 · Axios · Socket.io-client |
| BD | MongoDB (con índice `2dsphere` para geolocalización) |

---

## Levantar el proyecto localmente

### Requisitos
- Node.js ≥ 18
- MongoDB corriendo localmente

### 1 — MongoDB
```bash
sudo systemctl start mongod
```

### 2 — Backend
```bash
cd backend
cp .env.example .env   # completar JWT_SECRET
npm install
npm run dev            # puerto 4000
```

### 3 — Seed (datos iniciales)
```bash
cd backend
npm run seed
```

### 4 — Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev            # http://localhost:5173
```

---

## Usuarios de prueba (post-seed)

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `admin@tickefar.com` | `Admin123!` | admin |
| `faryd@tickefar.com` | `User123!` | user |

---

## Endpoints principales

| Método | Ruta | Auth |
|--------|------|------|
| POST | `/api/auth/register` | — |
| POST | `/api/auth/login` | — |
| GET | `/api/events` | — |
| GET | `/api/events/:id` | — |
| POST | `/api/events` | admin |
| PUT | `/api/events/:id` | admin |
| DELETE | `/api/events/:id` | admin |
| GET | `/api/venues` | — |
| POST | `/api/venues` | admin |
| POST | `/api/tickets` | user |
| GET | `/api/tickets/my-tickets` | user |

---

## Features

- 🔐 Autenticación JWT (4 h) con bcrypt
- 🗺 Búsqueda de venues por geolocalización (`$near` + `2dsphere`)
- 🔴 Stock en tiempo real vía **Socket.io** (`stockUpdated`)
- 📴 Modo offline con **IndexedDB** (mis entradas)
- 🌙 Toggle light / dark mode persistido en `localStorage`
- 🛡 Panel admin CRUD de eventos
- ✅ Tests unitarios con Vitest (`npm test` en `/backend`)

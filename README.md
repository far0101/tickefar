# Tickefar

Plataforma web full-stack para la consulta, reserva y compra de entradas para eventos musicales, teatrales y espectaculos en Buenos Aires. Proyecto desarrollado como Trabajo Integrador de 7mo ano para la carrera de Tecnico en Programacion.

## Descripcion

Tickefar permite a los usuarios explorar eventos clasificados por categoria, buscar por nombre o artista en tiempo real, filtrar por estadio/lugar y localizar espectaculos cercanos mediante geolocalizacion. Cuenta con actualizacion de stock en tiempo real mediante WebSockets, persistencia local para consulta de entradas adquiridas en modo offline mediante IndexedDB, autenticacion con control de acceso basado en roles (usuario y administrador) y un panel administrativo para gestion integral del catalogo de eventos.

## Stack Tecnologico

### Backend
- Runtime: Node.js (v20+)
- Lenguaje: TypeScript (modo estricto)
- Framework HTTP: Express
- Base de datos: MongoDB con Mongoose ODM (indices geoespaciales 2dsphere)
- Validacion de esquemas: Zod
- Autenticacion y seguridad: JSON Web Tokens (JWT), bcryptjs, express-rate-limit, cors
- Comunicacion en tiempo real: Socket.io
- Testing: Vitest

### Frontend
- Herramienta de compilacion: Vite
- Biblioteca de interfaz: React 18
- Lenguaje: TypeScript (modo estricto)
- Componentes y diseno: Material UI (MUI v6) y Emotion
- Enrutamiento: React Router DOM v6
- Cliente HTTP: Axios con interceptores de autorizacion
- Cliente WebSocket: Socket.io-client
- Persistencia offline: API nativa de IndexedDB
- Decodificacion de tokens: jwt-decode

## Instalacion y Configuracion

### Requisitos previos
- Node.js version 18 o superior
- Administrador de paquetes npm
- Instancia activa de MongoDB (local en puerto 27017 o servicio remoto)

### 1. Clonar el repositorio
```bash
git clone https://github.com/far0101/tickefar.git
cd tickefar
```

### 2. Configuracion del Backend
Acceder al directorio del backend y configurar variables de entorno:
```bash
cd backend
cp .env.example .env
npm install
```

Variables requeridas en `backend/.env`:
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/tickefar
JWT_SECRET=supersecretkey
CLIENT_URL=http://localhost:5173
```

Poblar la base de datos con datos de prueba (7 estadios de CABA, 15 eventos y 2 usuarios):
```bash
npm run seed
```

### 3. Configuracion del Frontend
En una nueva terminal, acceder al directorio del frontend y configurar variables de entorno:
```bash
cd ../frontend
cp .env.example .env
npm install
```

Variables requeridas en `frontend/.env`:
```env
VITE_API_URL=http://localhost:4000
```

## Scripts Disponibles

### Backend (`/backend`)
- `npm run dev`: Inicia el servidor en modo desarrollo con recarga automatica mediante `tsx watch`.
- `npm run build`: Compila el codigo TypeScript a JavaScript estandar en la carpeta `dist`.
- `npm run start`: Ejecuta el servidor compilado en produccion.
- `npm run seed`: Limpia la base de datos e inserta usuarios, estadios y eventos iniciales.
- `npm test`: Ejecuta los tests unitarios con Vitest.

### Frontend (`/frontend`)
- `npm run dev`: Inicia el servidor de desarrollo Vite (por defecto en puerto 5173).
- `npm run build`: Realiza la verificacion de tipos con TypeScript y compila el bundle de produccion.
- `npm run preview`: Previsualiza la compilacion de produccion de forma local.
- `npm run lint`: Ejecuta el analisis estatico de codigo con ESLint.

## URLs del Proyecto

- Frontend (Desarrollo): http://localhost:5173
- Backend API (Health Check): http://localhost:4000/health
- API Base: http://localhost:4000/api
- Repositorio en GitHub: https://github.com/far0101/tickefar

### Credenciales de prueba

- Administrador:
  - Email: `admin@tickefar.com`
  - Contrasena: `Admin123!`
- Usuario estandar:
  - Email: `faryd@tickefar.com`
  - Contrasena: `User123!`

## Autor

- Faryd Jalil (GitHub: [far0101](https://github.com/far0101) - Email: farydjalil@gmail.com)
  - Trabajo Integrador de 7mo año - Tecnico en Programacion

# Informe Tecnico del Proyecto Tickefar

## 1. Introduccion y Objetivos

### 1.1 Introduccion
Tickefar es una aplicacion web full-stack orientada a la venta, distribucion y gestion de entradas para espectaculos, recitales y obras de teatro situados en la Ciudad Autonoma de Buenos Aires (CABA). El proyecto surge en el marco del Trabajo Integrador final correspondiente al 7mo año de la especialidad Tecnico en Programacion.

### 1.2 Objetivos Generales
- Desarrollar un sistema completo, robusto y escalable aplicando buenas practicas de desarrollo de software.
- Diseñar una experiencia de usuario fluida, reactiva y adaptable a cualquier tamano de pantalla.
- Implementar sincronizacion de cupos en tiempo real para evitar la sobreventa de entradas.
- Garantizar la disponibilidad y acceso a las entradas adquiridas aun sin conexion a Internet.

### 1.3 Objetivos Especificos
- Backend: Implementar una API RESTful modular bajo Node.js, Express y TypeScript, aplicando esquemas estrictos de validacion, autenticacion con JWT, hash seguro de contrasenas con bcryptjs y consultas geoespaciales con MongoDB.
- Frontend: Construir una Single Page Application (SPA) con React, Vite y TypeScript, integrando Material UI para una interfaz limpia, modo oscuro/claro y consumo de WebSockets.
- Tiempo Real: Comunicar eventos de reduccion de stock a traves de Socket.io hacia todos los clientes conectados de manera bidireccional.
- Resiliencia: Integrar almacenamiento local con IndexedDB para respaldar los tickets del usuario y permitir la visualizacion en modo offline.

---

## 2. Arquitectura del Sistema

El sistema implementa una arquitectura desacoplada cliente-servidor, comunicada a traves de protocolos HTTP/REST y WebSockets (Socket.io), con una capa de persistencia primaria en base de datos NoSQL y una capa de cache local en el cliente.

```
+-----------------------------------------------------------------------------------+
|                                  CLIENTE (SPA)                                    |
|                                                                                   |
|  +--------------------+   +---------------------+   +--------------------------+  |
|  |     React + TS     |   |      Contextos      |   |   IndexedDB (Local DB)   |  |
|  |  (Vite + MUI v6)   |---|  (Auth, Theme)      |---|   tickets de usuario     |  |
|  +--------------------+   +---------------------+   |   (Soporte Offline)      |  |
|            |                         |              +--------------------------+  |
+------------|-------------------------|--------------------------------------------+
             |                         |
             | HTTP/REST (Axios + JWT) | WebSockets (Socket.io-client)
             v                         v
+-----------------------------------------------------------------------------------+
|                                 SERVIDOR (Node.js)                                |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                        Express + TypeScript Middleware                       |  |
|  |       (CORS, Rate Limiting, JWT Auth Middleware, Role Admin Middleware)     |  |
|  +-----------------------------------------------------------------------------+  |
|            |                                                 |                    |
|            v                                                 v                    |
|  +--------------------+                           +---------------------+         |
|  |    Controladores   |                           |    Socket.io Server |         |
|  |  (Zod Validation)  |                           |  (Broadcast Stock)  |         |
|  +--------------------+                           +---------------------+         |
|            |                                                 ^                    |
|            v                                                 |                    |
|  +--------------------+                                      |                    |
|  |     Servicios      |--------------------------------------+                    |
|  |  (Logica Negocio)  |                                                           |
|  +--------------------+                                                           |
|            |                                                                      |
|            v                                                                      |
|  +--------------------+                                                           |
|  | Modelos (Mongoose) |                                                           |
|  +--------------------+                                                           |
+------------|----------------------------------------------------------------------+
             | Mongoose ODM (Indices 2dsphere)
             v
+-----------------------------------------------------------------------------------+
|                             BASE DE DATOS (MongoDB)                               |
|                                                                                   |
|    Colecciones: Users, Venues (GeoJSON Point), Events (Sectores), Tickets         |
+-----------------------------------------------------------------------------------+
```

---

## 3. Decisiones Tecnicas

### 3.1 TypeScript Estricto en Todo el Codigo
- **Decision:** Prohibicion de `any` en backend y frontend; tipado exhaustivo de modelos, esquemas, DTOs y respuestas.
- **Justificacion:** Minimiza errores en tiempo de ejecucion, facilita el refactorizado y garantiza contratos claros entre capas.

### 3.2 Validacion con Zod
- **Decision:** Utilizar Zod tanto para validar el cuerpo de las peticiones en autenticacion, creacion de eventos y compra de entradas.
- **Justificacion:** Permite inferir tipos estaticos de TypeScript a partir de esquemas de runtime, unificando la regla de negocio y eliminando duplicacion de tipos.

### 3.3 Consultas Geoespaciales con MongoDB ($near y 2dsphere)
- **Decision:** Modelar la ubicacion de los estadios mediante GeoJSON (`Point` con `[longitud, latitud]`) e indexacion `2dsphere`.
- **Justificacion:** Facilita el calculo de distancias esfericas directamente en el motor de base de datos para la funcionalidad "Cerca mio".

### 3.4 Sincronizacion de Stock mediante Socket.io
- **Decision:** Emitir el evento `stockUpdated` tras cada compra exitosa en lugar de polling periodico.
- **Justificacion:** Reduce significativamente el trafico de red y ofrece una experiencia inmediata a los usuarios en la pagina de detalle.

### 3.5 Soporte Offline con IndexedDB
- **Decision:** Guardar los tickets del usuario en la base de datos interna del navegador (`tickefar-db`) mediante la API nativa de IndexedDB.
- **Justificacion:** Las entradas adquiridas representan informacion critica que el usuario debe poder acreditar en puerta de ingreso aun con cortes de red o caida de conectividad movil.

### 3.6 Filtros Reactivos sin Boton de Busqueda
- **Decision:** Aplicar debounce de 250ms para el campo de busqueda por texto y actualizacion instantanea para selectores de categoria y estadio.
- **Justificacion:** Agiliza la exploracion del catalogo y simplifica la interaccion del usuario al no requerir confirmacion manual.

---


## 4. Dificultades y Soluciones

### 4.1 Manejo de Concurrencia y Sobreventa de Stock
- **Problema:** Riesgo de ventas simultaneas que pudieran superar los cupos disponibles en un sector.
- **Solucion:** Validacion rigurosa de stock disponible en la capa de servicio (`hasStock`) antes de descontar los cupos y generar el ticket, complementado con emision inmediata del nuevo estado del sector a todos los clientes suscritos.

### 4.2 Estilos Predeterminados de Plantillas Vite en Ancho Completo
- **Problema:** La plantilla inicial de Vite incorporaba un ancho maximo fijo de 1280px y centrado automatico en el contenedor raiz, haciendo que la aplicacion se viera estrecha en monitores modernos.
- **Solucion:** Reescritura de las reglas globales en `index.css` y `App.css`, configurando `html`, `body` y `#root` con ancho del 100% y eliminando la propiedad `max-width`, en sintonia con los contenedores fluidos de Material UI.

### 4.3 Compatibilidad de Grid en Material UI v6
- **Problema:** En MUI v6, la especificacion de columnas mediante la propiedad `size` genera incompatibilidades de tipado si se importa el componente tradicional `Grid`.
- **Solucion:** Migracion a `import Grid from '@mui/material/Grid2'`, estandarizando la composicion responsive con la propiedad `size={{ xs: 12, sm: 6, md: 4, lg: 3 }}`.

### 4.4 Persistencia Desacoplada sin Dependencias Externas en Cliente
- **Problema:** Almacenar tickets en el cliente sin anadir librerias pesadas ni saturar los limites de almacenamiento de LocalStorage.
- **Solucion:** Construccion de un servicio modular nativo con la API estandar de `window.indexedDB`, manejando transacciones asincronas de lectura y escritura en `services/indexedDb.ts`.

---

## 5. Conclusiones y Aprendizajes

- El uso de TypeScript en modo estricto en ambos extremos de la aplicacion permitio un desarrollo ordenado y redujo drasticamente los errores habituales de desacople en formatos de datos.
- La combinacion de Express con esquemas declarativos en Zod resulta en endpoints autovalidados que protegen la integridad de la base de datos sin sobrecargar la logica de los controladores.
- La implementacion de WebSockets demostro ser una solucion simple y de bajo consumo de recursos para problemas criticos de tiempo real en billeteras y ticketeras.
- El desarrollo del proyecto permitio consolidar conocimientos clave de arquitectura web, seguridad basada en tokens, bases de datos geoespaciales y diseno de interfaces accesibles e intuitivas.

---

## 6. Archivos de Configuracion (.env.example completos)

### 6.1 Backend (`backend/.env.example`)
```env
# Puerto en el que escucha el servidor Express
PORT=4000

# Cadena de conexion a la base de datos MongoDB
MONGO_URI=mongodb://localhost:27017/tickefar

# Clave secreta para la firma y verificacion de JSON Web Tokens (JWT)
JWT_SECRET=supersecretkey

# URL del cliente frontend permitida en las politicas CORS y Socket.io
CLIENT_URL=http://localhost:5173
```

### 6.2 Frontend (`frontend/.env.example`)
```env
# URL base de la API backend para solicitudes HTTP de Axios y Socket.io
VITE_API_URL=http://localhost:4000
```

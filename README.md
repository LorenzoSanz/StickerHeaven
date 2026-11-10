# StickerHeaven 

Hola y bienvenido a StickerHeaven! 
Este proyecto se entrega como adjunto a la memoria del TFC y el video de defensa. 
Como se explica a fondo en la memoria, este proyecto es un Monolito Modular construido con **Next.js**, **TypeScript**, **Hono**, **MongoDB**, **Stripe** y demás, con **Bun** como runtime.

---

## Requisitos
- **Bun (>= 1.0)**: Runtime principal para la API y gestor de paquetes.
- **Puertos Libres**: La aplicación utiliza el puerto `3000` (Web) y `3001` (API).

### Si se quiere probar con Docker
- **Docker & Docker Compose**: Necesario para levantar la infraestructura local (MongoDB y Redis).

---

## Guía para el Profe

Aquí tienes los pasos para probarlo todo en 1 minuto:

1.  **Levantar Infraestructura**: `docker compose -f infra/docker/docker-compose.yml up -d`

2.  **Configurar Env**: `cp .env.example .env.local` (Si se quiere probar con Stripe/Cloudinary, asegúrate de poner las API keys en .env.local).

3.  **Poblar Base de Datos (SEED)**: `bun seed`
    - Esto crea stickers de ejemplo y un usuario administrador.

4.  **Arrancar**: `bun dev:api` y `bun dev:web` (en terminales separadas).

5.  **Credenciales de prueba**:
    - **Email**: `admin@stickerheaven.com`
    - **Password**: `admin123`

---

## Desarrollo (2 procesos)
En desarrollo, el frontend (Next) y la API (Bun/Hono) se ejecutan en procesos separados (Todos los scripts estan en package.json como siempre).

Terminal 1 (API):
```bash
bun run dev:api
```

Terminal 2 (Web):
```bash
bun run dev:web
```

## Producción (2 procesos)
De igual forma, en producción se levantan dos procesos:

API:
```bash
bun run start:api
```

Web:
```bash
bun run start:web
```

## Variables de entorno
- Frontend: `NEXT_PUBLIC_*`
- Backend: ver `src/config/envSchemas.ts` y `.env.example`

## Arranque local
1. Copia `.env.example` a `.env.local` y completa DB + Stripe + Cloudinary.
2. Arranca Mongo (por ejemplo con el compose de `infra/docker/docker-compose.yml`).
3. (Opcional) Para emails en local, usa `EMAIL_PROVIDER=console`.

---

## Testing
La calidad del sistema se valida mediante una suite de tests que se ha ido desarrollando a la vez que las funciones que testean. Este comando ejecuta todos:

- **Tests de Arquitectura**: Estos tests validan que no existan violaciones de dependencias entre capas.
- **Tests de Dominio e Inmutabilidad**: Estos tests aseguran la integridad de los Value Objects y Entidades.
- **Tests de Casos de Uso**: Estos tests mocks locales para validar la lógica de aplicación sin dependencias externas.
- **Tests de Contrato/API**: Estos tests validan los endpoints críticos de la infraestructura Hono.

```bash
# Ejecutar todos los tests
bun test
```


# MARCHÉ DU NIGER API

Backend NestJS separe pour la boutique et l'administration.

## Stack

- NestJS
- REST API
- Swagger sur `/docs`
- Auth admin JWT
- Prisma ORM
- PostgreSQL (Neon compatible)

## Installation

```bash
pnpm install
cp .env.example .env
pnpm prisma:generate
pnpm prisma:push
pnpm start:dev
```

## Variables d'environnement

- `PORT`: port API, par defaut `4000`
- `CLIENT_URL`: URL du frontend Next.js
- `ADMIN_EMAIL`: email admin initial
- `ADMIN_PASSWORD`: mot de passe admin initial
- `JWT_SECRET`: secret JWT
- `DATABASE_URL`: URL PostgreSQL (Neon)
- `DIRECT_URL`: URL directe PostgreSQL (utilisee par Prisma pour migrations)

## Endpoints principaux

- `POST /auth/admin/login`
- `GET /auth/admin/me`
- `GET /products`
- `GET /products/:id`
- `POST /products`
- `PATCH /products/:id`
- `DELETE /products/:id`
- `POST /products/:id/promotion`
- `DELETE /products/:id/promotion`
- `POST /orders`
- `GET /orders`
- `PATCH /orders/:id/status`
- `GET /promotions`
- `POST /promotions/:productId`
- `DELETE /promotions/:productId`

## Deployment Prisma (production)

1. Configurer `DATABASE_URL` vers la base PostgreSQL de production
2. Executer `pnpm prisma:generate`
3. Executer `pnpm prisma:migrate:deploy` (ou `pnpm prisma:push` si vous ne gerez pas les migrations SQL)

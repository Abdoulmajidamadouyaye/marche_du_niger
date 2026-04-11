# Project Guidelines

## Workspace Scope

- This workspace has two apps: `client/` is a Next.js 15 App Router frontend, and `server/` is a NestJS 11 backend with Prisma and SQLite.
- Use `pnpm` in both apps and run commands from the app directory, not the repository root.
- Do not edit generated output in `server/dist/`; make backend changes in `server/src/` and rebuild.
- Treat `server/data/store.json` as legacy import data. Current runtime persistence is Prisma with `DATABASE_URL="file:./dev.db"` from the `server/` directory.

## Build And Validation

- Frontend commands from `client/`: `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm lint`.
- Backend commands from `server/`: `pnpm install`, `pnpm prisma:generate`, `pnpm prisma:push`, `pnpm start:dev`, `pnpm build`.
- There are no dedicated automated test scripts yet. For most changes, validate with the relevant build or lint command plus a targeted manual check.
- On Windows, Prisma may fail with an `EPERM` lock on `query_engine-windows.dll.node`; stop running Node processes first or rerun `pnpm prisma db push --skip-generate`.

## Architecture

- The client talks to the backend through REST helpers in `client/src/services/api.ts` and through Socket.IO on the `/chat` namespace.
- Client state is composed through nested context providers in `client/src/components/Providers.tsx`; preserve provider ordering unless the change requires otherwise.
- Admin and customer authentication are separate flows. Admin tokens use `nm_admin_token`; customer tokens use `nm_customer_token`.
- Backend features follow the NestJS `module -> controller -> service` structure under `server/src/`, with shared Prisma code in `server/src/shared/prisma/`.

## Conventions

- Keep UI copy, notices, and API-facing error messages in French unless the surrounding feature already uses another language. Keep identifiers, type names, and code symbols in English.
- Prefer existing context methods and API helpers over introducing direct `fetch` or ad hoc `localStorage` access in new client code.
- Product filtering and category routing rely on `categorySlug`, not the display value in `category`.
- For backend request changes, use DTO validation and keep Swagger decorators aligned with the route contract.
- When changing product, order, auth, or chat payload shapes, update both the client types and the corresponding server DTO or entity mapping.
- In the client app, add `"use client"` only to components that actually need client-only APIs or hooks.
- Coordinate environment-sensitive changes across both apps: the frontend defaults to `http://localhost:4000`, and backend CORS currently expects local frontend origins on ports `3000` and `3001`.
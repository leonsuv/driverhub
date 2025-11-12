# Drive2.ru Clone Project - Global Context

This is a car review community platform built with **fully self-hosted infrastructure** (no cloud services).

## Technology Stack

- **Next.js 15** (App Router, React Server Components)
- **tRPC v11** (end-to-end type safety)
- **Drizzle ORM** + **PostgreSQL 16** (self-hosted database)
- **NextAuth.js v5** (credentials + OAuth authentication)
- **shadcn/ui** + **Tailwind CSS v4**
- **Vertical Slice Architecture** (feature-first organization)

## Architecture

- **Vertical Slice Architecture**: Each feature (reviews, cars, social, etc.) contains ALL its code (API, components, domain logic, infrastructure)
- **Domain-Driven Design**: Entities, Value Objects, Repositories, Domain Services
- **Self-hosted**: PostgreSQL database, local file storage (`public/uploads/`), no cloud dependencies

## Important Files

- **`prompt.md`** - Complete specification (database schema, API endpoints, folder structure)
- **`copilot-checklist.md`** - Progress tracker (always check what's done)
- **`copilot-init.md`** - Initial setup prompt
- **`copilot-resume.md`** - Resume workflow prompt

## Project Rules

### ❌ DO NOT USE:
- Supabase (auth, storage, database)
- Any cloud services (AWS, GCP, Azure)
- UUIDs for user IDs (use text from NextAuth)

### ✅ ALWAYS USE:
- **NextAuth.js v5** for authentication
- **Self-hosted PostgreSQL** via `DATABASE_URL` in `.env.local`
- **Local file storage** in `public/uploads/` 
- **bcrypt** for password hashing
- **TypeScript strict mode**
- **Vertical Slice Architecture** (features/ folder)

## Feature Slices

Each feature in `src/features/[feature-name]/` contains:
- `api/` - tRPC routers
- `components/` - React components
- `domain/` - Entities, Value Objects, Services (business logic)
- `infrastructure/` - Repositories (data access)
- `schemas/` - Zod validation schemas
- `hooks/` - Custom React hooks
- `types.ts` - TypeScript types

## Key Endpoints

- `/api/auth/[...nextauth]` - NextAuth API routes
- `/api/trpc/[trpc]` - tRPC API handler
- `/api/upload` - File upload handler

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generated-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

**When writing code, ALWAYS follow the Vertical Slice Architecture and self-hosted principles from `prompt.md`.**
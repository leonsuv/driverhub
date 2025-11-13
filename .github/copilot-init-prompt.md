# Initial Copilot Chat Prompt - Start Workflow (Self-Hosted)

Copy and paste this into GitHub Copilot Chat (@workspace) or Windsurf to initialize the Drive2.ru clone project:

---

**CONTEXT**: I'm building a Drive2.ru clone (car review community platform) using Next.js 15, tRPC v11, Drizzle ORM, NextAuth.js, and shadcn/ui. **FULLY SELF-HOSTED** - no cloud services. The complete specification is in `prompt.md` and progress tracking is in `copilot-checklist.md`.

**PROJECT STATUS**: Fresh Next.js 15 project initialized with App Router, TypeScript, Tailwind CSS v4, ESLint, src/ directory structure, and pnpm.

**YOUR TASK**: 
1. Read `prompt.md` for complete architectural specifications, tech stack, database schema, API endpoints, and project structure
2. Read `copilot-checklist.md` to understand the implementation phases
3. Start implementing Phase 1: Project Setup & Infrastructure

**PHASE 1 IMPLEMENTATION PLAN**:

### Step 1: Install Dependencies
Install all required packages (NO SUPABASE):
```bash
pnpm add @trpc/server @trpc/client @trpc/react-query @trpc/next @tanstack/react-query
pnpm add drizzle-orm drizzle-kit postgres
pnpm add next-auth@beta @auth/drizzle-adapter bcryptjs
pnpm add zod react-hook-form @hookform/resolvers
pnpm add zustand date-fns clsx tailwind-merge
pnpm add lucide-react
pnpm add -D @types/node @types/bcryptjs tsx drizzle-kit
```

### Step 2: Initialize shadcn/ui
Run shadcn/ui setup and install core components:
```bash
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button input textarea card dialog dropdown-menu avatar badge label select tabs separator skeleton toast alert-dialog form
```

### Step 3: Create .env Files
Create `.env.local` with self-hosted configuration:
```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5439/drivers

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# File Upload
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=10485760
```

Create `.env.example` with template (no secrets).

### Step 4: Project Structure Setup
Create the complete folder structure as specified in `prompt.md`:
- `src/features/` with subdirectories for: auth, reviews, cars, social, users, garage, feed
- `src/lib/` with: db, trpc, auth (NextAuth), utils
- `src/components/` with: ui, layout, common
- `src/app/` with route groups: (auth), (main), api/
- `public/uploads/` for user-uploaded files
- Each feature slice should have: api/, components/, domain/, infrastructure/, schemas/, hooks/, types.ts

### Step 5: Environment Configuration
Create `src/config/env.ts` with Zod environment variable validation:
```typescript
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

### Step 6: Drizzle ORM Setup (PostgreSQL)
- Create `drizzle.config.ts` in root:
```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

- Implement complete database schema in `src/lib/db/schema.ts` (users, sessions, verificationTokens, cars, reviews, etc.)
- Create `src/lib/db/index.ts` for Drizzle client initialization
- Set up migrations folder: `src/lib/db/migrations/`

### Step 7: NextAuth.js Setup
- Create `src/lib/auth/config.ts` with NextAuth configuration:
  - Credentials provider with bcrypt password hashing
  - Drizzle adapter for sessions
  - JWT strategy
  - Custom pages (login, register)
- Create API route: `src/app/api/auth/[...nextauth]/route.ts`
- Export `auth`, `signIn`, `signOut` functions

### Step 8: File Upload Handler
- Create `src/app/api/upload/route.ts`:
  - POST handler for file uploads
  - Save to `public/uploads/`
  - Return public URL
  - Validate file type and size
  - Require authentication
- Create `public/uploads/` directory
- Add to `.gitignore`: `public/uploads/*`

### Step 9: tRPC Infrastructure
- Create `src/lib/trpc/server.ts` with tRPC context:
  - Get session from NextAuth
  - Public procedure (no auth)
  - Protected procedure (requires auth)
- Create `src/lib/trpc/client.ts` with React Query setup
- Create `src/lib/trpc/router.ts` as root router (initially empty)
- Create API route handler: `src/app/api/trpc/[trpc]/route.ts`

### Step 10: Shared Utilities
- Create `src/lib/utils/cn.ts` (Tailwind class merger)
- Create `src/lib/utils/date.ts` (date formatting helpers)
- Create `src/lib/utils/upload.ts` (file upload helpers)
- Create `src/lib/auth/session.ts` (session management helpers)
- Create `src/lib/auth/middleware.ts` (auth middleware for protected routes)

### Step 11: Update Checklist
After completing each step, update `copilot-checklist.md` by marking tasks as done `[x]`.

---

**CRITICAL INSTRUCTIONS**:
- ❌ **DO NOT use Supabase** - this is fully self-hosted
- ✅ **Use NextAuth.js v5** for authentication
- ✅ **Use local PostgreSQL** (user will provide DATABASE_URL)
- ✅ **Save files to `public/uploads/`** not cloud storage
- ✅ **Generate `.env.local` file** with all required variables
- ✅ Follow Vertical Slice Architecture from `prompt.md`
- ✅ Use TypeScript strict mode everywhere
- ✅ Generate complete, production-ready code (not placeholders)
- ✅ Create all folder structures before adding files

---

**BEFORE STARTING, ACKNOWLEDGE**:
1. You understand this is a SELF-HOSTED setup (no Supabase)
2. You will create `.env.local` with DATABASE_URL placeholder
3. You will use NextAuth.js for authentication
4. You will use local file storage in `public/uploads/`

---

**NOW START IMPLEMENTING PHASE 1**. Generate all necessary files and code. Be thorough and complete.
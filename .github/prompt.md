# Complete Drive2.ru Clone - Self-Hosted Edition

## Project Overview & Business Domain
Build a **modern car review and automotive community platform** (Drive2.ru clone) where users can:
- Create detailed car reviews with photos/videos
- Follow other car enthusiasts
- Comment and interact on posts
- Browse cars by make/model/year
- View personalized feeds of car content
- Rate and bookmark reviews
- Create car profiles (garage feature)

**Core Business Value:** Connect car enthusiasts, enable knowledge sharing, build automotive community.

---

## Technology Stack (2025 Modern Stack - Fully Self-Hosted)

### Frontend
- **Framework:** Next.js 15 (App Router with React Server Components)
- **UI Library:** shadcn/ui components + Radix UI primitives
- **Styling:** Tailwind CSS v4
- **Type Safety:** TypeScript 5.3+
- **Forms:** React Hook Form + Zod validation
- **State Management:** Zustand (minimal client state)

### Backend & API
- **API Layer:** tRPC v11 (end-to-end type safety)
- **Database:** Self-hosted PostgreSQL 16
- **ORM:** Drizzle ORM (lightweight, SQL-first)
- **Auth:** NextAuth.js v5 (JWT, credentials, OAuth)
- **File Storage:** Local filesystem with public serving
- **Real-time:** Server-Sent Events (SSE) via tRPC

### Infrastructure
- **Deployment:** Self-hosted (Docker/bare metal/VPS)
- **Environment:** Node.js 20+ LTS
- **Package Manager:** pnpm
- **Linting:** ESLint + Prettier
- **Git Hooks:** Husky + lint-staged

---

## Architecture Approach: Vertical Slice Architecture + DDD Principles

**Why Vertical Slice Architecture:**
- Organize by feature/use case, not by technical layer
- High cohesion: related code stays together
- Minimal coupling: features are self-contained
- Easier navigation: everything for a feature is in one place
- Scalable: adding features means adding new slices
- Aligns with agile delivery and user stories

**DDD Integration:**
- Use **Bounded Contexts** to separate major domains (User, Car, Review, Social)
- Define **Entities** and **Value Objects** in domain layer
- Keep business logic in domain, not in API routes
- Use **Repository pattern** for data access abstraction

**Structure Benefits:**
- New features add code, don't modify shared code
- Reduced merge conflicts
- Easier testing (test one slice at a time)
- Clear feature boundaries

---

## Project Structure (Vertical Slice + DDD)

```
drive2-clone/
├── .github/
│   ├── copilot-instructions.md
│   └── workflows/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (main)/
│   │   │   ├── feed/page.tsx
│   │   │   ├── reviews/
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   └── create/page.tsx
│   │   │   ├── cars/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [make]/[model]/page.tsx
│   │   │   ├── garage/page.tsx
│   │   │   └── profile/[username]/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── trpc/[trpc]/route.ts
│   │   │   └── upload/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api/auth.router.ts
│   │   │   ├── components/
│   │   │   ├── schemas/
│   │   │   ├── hooks/
│   │   │   └── types.ts
│   │   ├── reviews/
│   │   │   ├── api/reviews.router.ts
│   │   │   ├── components/
│   │   │   ├── domain/
│   │   │   ├── infrastructure/
│   │   │   ├── schemas/
│   │   │   └── hooks/
│   │   ├── cars/
│   │   ├── social/
│   │   ├── users/
│   │   ├── garage/
│   │   └── feed/
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts
│   │   │   ├── schema.ts
│   │   │   └── migrations/
│   │   ├── trpc/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── router.ts
│   │   ├── auth/
│   │   │   ├── config.ts (NextAuth config)
│   │   │   ├── session.ts
│   │   │   └── middleware.ts
│   │   └── utils/
│   │       ├── cn.ts
│   │       ├── date.ts
│   │       └── upload.ts
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── common/
│   ├── hooks/
│   ├── types/
│   └── config/
│       ├── site.ts
│       └── env.ts
├── public/
│   ├── uploads/ (user-uploaded files)
│   ├── images/
│   └── icons/
├── .env.example
├── .env.local
├── drizzle.config.ts
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## Database Schema (Drizzle ORM)

**File: `src/lib/db/schema.ts`**

```typescript
import { pgTable, serial, text, timestamp, integer, boolean, varchar, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const reviewStatusEnum = pgEnum('review_status', ['draft', 'published', 'archived']);
export const userRoleEnum = pgEnum('user_role', ['user', 'moderator', 'admin']);

// Users table (managed by NextAuth)
export const users = pgTable('users', {
  id: text('id').primaryKey(), // NextAuth user ID
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: timestamp('email_verified'),
  password: text('password').notNull(), // Hashed password
  displayName: varchar('display_name', { length: 100 }),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  role: userRoleEnum('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// NextAuth sessions
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  sessionToken: text('session_token').notNull().unique(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
});

// NextAuth verification tokens
export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expires: timestamp('expires').notNull(),
});

// Cars table
export const cars = pgTable('cars', {
  id: serial('id').primaryKey(),
  make: varchar('make', { length: 100 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  year: integer('year').notNull(),
  generation: varchar('generation', { length: 100 }),
  imageUrl: text('image_url'),
  specs: jsonb('specs'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User Cars (Garage)
export const userCars = pgTable('user_cars', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  carId: integer('car_id').notNull().references(() => cars.id, { onDelete: 'cascade' }),
  nickname: varchar('nickname', { length: 100 }),
  purchaseDate: timestamp('purchase_date'),
  mileage: integer('mileage'),
  modifications: text('modifications'),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Reviews table
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  carId: integer('car_id').notNull().references(() => cars.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  rating: integer('rating').notNull(),
  pros: text('pros'),
  cons: text('cons'),
  status: reviewStatusEnum('status').default('draft').notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  likeCount: integer('like_count').default(0).notNull(),
  commentCount: integer('comment_count').default(0).notNull(),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Review Media
export const reviewMedia = pgTable('review_media', {
  id: serial('id').primaryKey(),
  reviewId: integer('review_id').notNull().references(() => reviews.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  order: integer('order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Comments, Likes, Follows, Bookmarks tables (same structure as before)
// ... (add all other tables from previous schema)

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  reviews: many(reviews),
  comments: many(comments),
  userCars: many(userCars),
  sessions: many(sessions),
}));

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  author: one(users, { fields: [reviews.authorId], references: [users.id] }),
  car: one(cars, { fields: [reviews.carId], references: [cars.id] }),
  media: many(reviewMedia),
}));
```

---

## Environment Variables

**File: `.env.example`**

```env
# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (Self-hosted PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5439/drivers

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production

# File Upload
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=10485760  # 10MB in bytes

# Optional: Email (for verification/password reset)
EMAIL_SERVER=smtp://username:password@smtp.example.com:587
EMAIL_FROM=noreply@yourdomain.com
```

---

## NextAuth Configuration

**File: `src/lib/auth/config.ts`**

```typescript
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
        });

        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
          image: user.avatarUrl,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
});
```

---

## File Upload Handler

**File: `src/app/api/upload/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { auth } from '@/lib/auth/config';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create unique filename
  const timestamp = Date.now();
  const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
  const uploadDir = join(process.cwd(), 'public', 'uploads');
  
  // Ensure upload directory exists
  await mkdir(uploadDir, { recursive: true });

  const filepath = join(uploadDir, filename);
  await writeFile(filepath, buffer);

  return NextResponse.json({ 
    url: `/uploads/${filename}`,
    filename,
  });
}
```

---

## Dependencies Installation

**Updated package.json dependencies:**

```bash
# Remove Supabase
pnpm remove @supabase/supabase-js @supabase/ssr

# Add NextAuth and bcrypt
pnpm add next-auth@beta @auth/drizzle-adapter bcryptjs
pnpm add -D @types/bcryptjs

# Keep existing
pnpm add @trpc/server @trpc/client @trpc/react-query @trpc/next @tanstack/react-query
pnpm add drizzle-orm drizzle-kit postgres
pnpm add zod react-hook-form @hookform/resolvers
pnpm add zustand date-fns clsx tailwind-merge lucide-react
pnpm add -D @types/node tsx
```

---

## Implementation Steps (Self-Hosted Version)

### Phase 1: Database Setup
1. **Install PostgreSQL locally** (or use Docker):
   ```bash
   docker run -d --name drivers-postgres \
     -e POSTGRES_PASSWORD=yourpassword \
     -e POSTGRES_DB=drivers \
     -p 5439:5439 \
     postgres:16
   ```

2. **Create `.env.local`** with your database connection:
   ```env
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5439/drivers
   NEXTAUTH_SECRET=$(openssl rand -base64 32)
   NEXTAUTH_URL=http://localhost:3000
   ```

3. **Run Drizzle migrations**:
   ```bash
   pnpm drizzle-kit generate
   pnpm drizzle-kit migrate
   ```

### Phase 2: Authentication
4. **Setup NextAuth.js**:
   - Create `src/lib/auth/config.ts` with NextAuth configuration
   - Add API route: `src/app/api/auth/[...nextauth]/route.ts`
   - Implement registration with bcrypt password hashing

### Phase 3: File Upload
5. **Setup file upload**:
   - Create `src/app/api/upload/route.ts` for file handling
   - Create `public/uploads/` directory
   - Add `.gitignore` entry for uploads

### Phase 4: Feature Implementation
6. **Build features** following Vertical Slice Architecture (same as before)

---

## Key Differences from Supabase Version

| Feature | Supabase Version | Self-Hosted Version |
|---------|-----------------|---------------------|
| **Database** | Supabase Postgres | Self-hosted PostgreSQL |
| **Auth** | Supabase Auth | NextAuth.js v5 |
| **File Storage** | Supabase Storage | Local filesystem |
| **Real-time** | Supabase Realtime | tRPC SSE |
| **User ID** | UUID | Text (NextAuth) |
| **Sessions** | JWT (Supabase) | JWT (NextAuth) |
| **Deployment** | Vercel + Supabase | Self-hosted (Docker/VPS) |

---

## Production Deployment (Self-Hosted)

### Docker Compose Example

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: drivers
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5439:5439"

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5439/drivers
      NEXTAUTH_URL: https://yourdomain.com
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
    volumes:
      - ./public/uploads:/app/public/uploads
    depends_on:
      - postgres

volumes:
  postgres_data:
```

---

## Summary

This self-hosted version:
✅ **No cloud dependencies** - Everything runs on your infrastructure
✅ **NextAuth.js** for authentication (credentials + OAuth providers)
✅ **Local file storage** in `public/uploads/`
✅ **Self-hosted PostgreSQL** via Docker or bare metal
✅ **Full control** over data, security, and deployment
✅ **Same architecture** - Vertical Slice + DDD
✅ **Same features** - All 9 feature domains work identically

Replace Supabase with your own infrastructure while maintaining all functionality!
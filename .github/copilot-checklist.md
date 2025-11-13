# Copilot Full Project Execution Checklist (Self-Hosted Edition)

This checklist helps you and Copilot track progress across the **entire Drive2.ru clone** project (self-hosted version with NextAuth, local PostgreSQL, and local file storage). Copy into `copilot-checklist.md` and keep it updated during every iteration and chat. Mark checkboxes as you go; add notes as needed so Copilot always knows what's done, what's next, and what to focus on.

## Core Initial Steps
- [x] Create project repo and directory structure (see prompt.md)
- [x] Add prompt.md with full specification (self-hosted version)
- [x] Set up environment variables (`.env.example`, `.env.local`)
- [ ] Setup local PostgreSQL database (Docker or bare metal)

## Project Setup
- [x] Initialize Next.js 15 (App Router, TypeScript, Tailwind v4, pnpm)
- [x] Initialize shadcn/ui, install required components
- [x] Install all dependencies (tRPC v11, Drizzle, NextAuth.js v5, bcryptjs, React Hook Form, Zod)
- [x] Remove any Supabase dependencies (if accidentally installed)
- [ ] Create initial commit with setup files

## Infrastructure
- [x] Create Drizzle ORM config and schema files
- [x] Setup local PostgreSQL connection via DATABASE_URL
- [x] Run database migrations, seed basic car data
- [x] Implement tRPC context (protected/public procedures with NextAuth session)
- [x] Setup tRPC client/server config
- [x] Implement environment variable config helper (`src/config/env.ts`)
- [x] Create `.env.local` file with DATABASE_URL, NEXTAUTH_SECRET, etc.

## Authentication (NextAuth.js v5)
- [x] Install NextAuth.js v5 beta and Drizzle adapter
- [x] Create NextAuth config (`src/lib/auth/config.ts`)
- [x] Setup Credentials provider with bcrypt password hashing
- [x] Create NextAuth API route (`src/app/api/auth/[...nextauth]/route.ts`)
- [x] Implement user registration endpoint with password hashing
- [x] Create login/register pages in `src/app/(auth)/`
- [x] Setup session management helpers (`src/lib/auth/session.ts`)
- [x] Implement auth middleware for protected routes (`src/lib/auth/middleware.ts`)
- [ ] Test authentication flow (register, login, logout)

## File Upload (Local Storage)
- [x] Create `public/uploads/` directory
- [x] Add `public/uploads/*` to `.gitignore`
- [x] Create file upload API route (`src/app/api/upload/route.ts`)
- [x] Implement file validation (type, size)
- [x] Require authentication for uploads
- [ ] Test file upload and retrieval
- [x] Create upload utility helpers (`src/lib/utils/upload.ts`)

## Database Schema
- [x] Users table (with password field for NextAuth)
- [x] Sessions table (NextAuth sessions)
- [x] Verification tokens table (NextAuth)
- [x] Cars table (make, model, year, specs)
- [x] User Cars (Garage) table
- [x] Reviews table (with author, car references)
- [x] Review Media table (images/videos)
- [x] Comments table (with nested support)
- [x] Likes table (reviews and comments)
- [x] Follows table (user-to-user)
- [x] Bookmarks table (saved reviews)
- [x] Define all Drizzle relations
- [x] Run migrations and verify schema

## Feature Slices (Vertical Slice Architecture)
- [x] Auth: Implement feature folder, tRPC router, components, hooks, domain/entities
- [ ] Reviews: Implement feature folder, router, repository, domain logic, components, hooks
- [ ] Cars (catalog): Implement feature folder, router, repository, domain/entities, components, hooks
- [ ] Social (comments/likes/follows): Implement feature folder, router, repository, domain/entities, components
- [ ] Users (profile): Implement feature folder, router, repository, domain/entities, components
- [ ] Garage: Implement feature folder, router, repository, domain/entities, components
- [x] Feed: Implement feature folder, feed service, router, repository, domain logic, components

## UI Implementation
- [ ] Shared UI folder: import and customize shadcn/ui components
- [x] Implement main layout/navigation/header/footer
- [x] Create auth forms (login, register) with NextAuth integration
- [x] Home/feed page with review listing
- [x] Car catalog and detail pages
- [ ] Review creation form with image upload
- [x] Review creation form with image upload
- [x] Review detail page with comments
- [ ] User profile pages
- [ ] Garage management UI
## API Endpoints (tRPC Routers)
- [x] Auth endpoints (register with password hashing, session management)
- [ ] Reviews endpoints (list, details, create, update, delete, increment view, filter)
- [ ] Car endpoints (list, catalog, search, filter, makes/models)
- [ ] Comments (create, get, update, delete, replies)
- [x] Comments (create, get, update, delete, replies)
- [ ] Likes (toggle, get, user likes)
- [ ] Follows (toggle, get followers/following)
- [ ] Users (profile, stats, update, search)
- [ ] Garage (get/add/update/remove cars)
- [ ] Feed (get personalized, latest, trending)

## Real-Time Features
- [ ] Implement tRPC Server-Sent Events (SSE) for notifications
- [ ] Live comment updates
- [ ] Real-time like counts
- [ ] New review notifications

## Testing & Validation
- [ ] Unit tests for domain entities/services
- [ ] Integration tests for API routers
- [ ] Test authentication flow (register, login, session)
- [ ] Test file upload and storage
- [ ] Test database queries and relations
- [ ] E2E tests for user journeys (register, create review, comment, follow, etc)
- [ ] Add CI pipeline for ESLint, Prettier, type checks, test execution

## Security & Quality
- [ ] Verify bcrypt password hashing works correctly
- [ ] Add auth middleware and protect sensitive endpoints
- [ ] Implement rate limiting on auth endpoints
- [ ] Validate file uploads (prevent malicious files)
- [ ] Error handling: throw and catch errors in all mutations
- [ ] Display user-friendly error states in UI
- [ ] Implement loading skeletons for all pages
- [ ] Paginate and sort all major lists
- [ ] Use React Server Components where possible
- [ ] Optimize images, lazy loading
- [ ] Ensure TypeScript strict mode everywhere
- [ ] Review and secure all tRPC procedures

## Performance & Optimization
- [ ] Implement caching/optimizations in React Query
- [ ] Review slow endpoints/components, optimize as needed
- [ ] Add database indexes for frequently queried fields
- [ ] Optimize file storage (consider compression for images)

## Deployment (Self-Hosted)
- [ ] Create Dockerfile for Next.js app
- [ ] Create docker-compose.yml with app + PostgreSQL
- [ ] Configure environment variables for production
- [ ] Setup persistent volumes for PostgreSQL and uploads
- [ ] Test production build locally
- [ ] Deploy to VPS/bare metal/Docker Swarm/Kubernetes
- [ ] Setup domain and SSL/TLS certificates
- [ ] Configure nginx/Caddy reverse proxy
- [ ] Setup automated backups for PostgreSQL
- [ ] Setup automated backups for uploaded files

## Finalization
- [ ] Review checklist, confirm completion of all major features
- [ ] Polish UI and UX (accessibility, mobile responsiveness)
- [ ] Documentation: Update README.md with setup instructions
- [ ] Document API endpoints and schemas
- [ ] Add code comments/JSDocs where needed
- [ ] Test all user flows end-to-end
- [ ] Initial release/commit/tag

---

## Self-Hosted Specific Checklist

### PostgreSQL Setup
- [ ] Install PostgreSQL 16 (Docker or native)
- [ ] Create database: `drive2_clone`
- [x] Configure DATABASE_URL in .env.local
- [x] Test connection from Drizzle
- [ ] Setup automated backups

### File Storage Setup
- [x] Create `public/uploads/` directory
- [ ] Configure proper permissions (writable by app)
- [ ] Test file write/read operations
- [ ] Setup backup strategy for uploads
- [ ] Consider volume mounting for Docker deployments

### NextAuth.js Setup
- [ ] Generate NEXTAUTH_SECRET with openssl
- [ ] Configure NEXTAUTH_URL for production
- [ ] Setup email provider (optional, for password reset)
- [ ] Configure OAuth providers (Google, GitHub, etc.) if needed
- [ ] Test session persistence and JWT handling

---

## Tips for Best Practice
- **Always** update this file after every session or major Copilot/Windsurf task
- Before each new chat, review this and explicitly tell Copilot what to focus on next
- Mark tasks as done `[x]` and add notes for blockers, clarifications, or additional features
- Use as a living contract between you and Copilot (and any teammates)
- Add new features/slices/tasks as needed, with links to further specs if required
- Copy relevant completed code snippets and test results here for historical tracking

---

## Custom Notes Section

### Database Connection
- DATABASE_URL format: `postgresql://user:password@host:port/database`
- Example: `postgresql://postgres:mypassword@localhost:5432/drive2_clone`

### NextAuth Notes
- NextAuth v5 uses App Router and Server Actions
- Sessions stored in database via Drizzle adapter
- Passwords hashed with bcrypt (10 salt rounds)

### File Upload Notes
- Max file size: 10MB (configurable in .env)
- Allowed types: image/jpeg, image/png, image/webp, video/mp4

### Session Notes (2025-11-12)
- Implemented base reviews slice (create, list, fetch detail) with feed page rendering published reviews
- Added review creation form with car selector and server-side detail page
- Files saved to: `public/uploads/[timestamp]-[filename]`
- Public URL: `/uploads/[timestamp]-[filename]`
- Feed page now uses tRPC infinite query on client with loading skeleton and "Load more" support
- Prefetch first feed page on the server and invalidate feed queries after publishing reviews for instant updates
- Review detail fetch now runs in a transaction that increments view counts automatically
- Review creation form supports uploading local media with alt text; media saved and rendered on detail page
- Added authenticated app layout with header navigation, quick actions, and footer branding
- Cars page lists catalog data with search + infinite loading via tRPC and Drizzle pagination
- Car detail page aggregates variants, specs, and top community reviews via domain service
- Review detail page now renders threaded comments with tRPC-backed create/list endpoints and auth-aware form

### Session Notes (2025-11-13)
- Social comments now support edit/delete with permission checks and shared mutation hooks
- Comment UI uses reusable actions component with prefilled edit state and consistent error handling
- Review comments section wired to new create/update/delete mutations with optimistic invalidation
- Added comment like toggle (tRPC mutation, repository, UI) with current-user state tracking

### Deployment Notes
- Docker Compose includes PostgreSQL + App
- Persistent volumes for: PostgreSQL data, uploaded files
- Environment variables passed via docker-compose.yml

---

Add your own notes, blockers, important context, meeting outcomes, or todo lists for features here.
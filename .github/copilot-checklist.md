# Copilot Ultimate Project Execution Checklist (Drive2.ru Clone)

This is the master roadmap for the **Self-Hosted Drive2 Clone**. It covers the core application, advanced automotive logic, social engines, gamification, and platform stability.

## 1. Core Foundation & Infrastructure
- [x] Create project repo and directory structure
- [x] Add prompt.md with full specification
- [x] Set up environment variables (`.env.example`, `.env.local`)
- [x] Setup local PostgreSQL database (Docker or bare metal)
- [x] Initialize Next.js 15 (App Router, TypeScript, Tailwind v4, pnpm)
- [x] Initialize shadcn/ui, install required components
- [x] Install dependencies (tRPC v11, Drizzle, NextAuth v5, bcryptjs, Zod)
- [x] Implement tRPC context (protected/public procedures)
- [x] Setup tRPC client/server config
- [x] Implement environment variable config helper
- [x] Create Drizzle ORM config and schema files
- [x] Run migrations and verify schema connections

## 2. Authentication & User Identity
- [x] Install NextAuth.js v5 and Drizzle adapter
- [x] Setup Credentials provider with bcrypt hashing
- [x] Implement user registration endpoint
- [x] Create login/register pages
- [x] Setup session management helpers & middleware
- [ ] **Social Auth:** Add Google/GitHub providers
- [ ] **Password Reset:** Email flow with temporal tokens
- [ ] **Email Verification:** Verify user email on signup
- [ ] **Account Settings:** Change password, Update email
- [ ] **Privacy Settings:** Toggle visibility of garage/costs
- [ ] **Session Management:** "Sign out all other devices"
- [ ] **Delete Account:** Soft delete or GDPR hard delete

## 3. The Garage: Vehicle Management
- [x] Cars table (make, model, year, specs)
- [x] User Cars (Garage) table
- [x] Car Catalog (Make/Model/Generation hierarchy)
- [x] Add Car flow (connect user to catalog car)
- [x] Garage management UI
- [x] Car Detail Page (Specs + User Reviews)
- [x] **Car Passport:** Fields for VIN, Engine Code, Color Code, Trim
- [x] **Modifications List:** Dedicated section for mods (linked to marketplace parts)
- [x] **Vehicle Status:** "Sold", "Wrecked", "Hidden", "Project", "Daily"
- [x] **Transfer Ownership:** Flow to move a car profile to another user (selling)
- [x] **Car Gallery:** Drag-and-drop photo gallery for the car header
- [x] **Garage Sorting:** Drag-and-drop ordering of cars
- [x] **License Plate Blurring:** Auto-detect and blur plates on upload

## 4. Content Engine: Logbook (Reviews)
- [x] Reviews table (with author, car references)
- [x] Review Media table (images/videos)
- [x] Create/Update/Delete Review endpoints
- [x] Review creation form with image upload
- [x] Review detail page with comments
- [x] Rich text content support
- [ ] **Drafts System:** Auto-save drafts to DB or LocalStorage
- [ ] **Post Categories:** Tags for "DIY", "Tuning", "Travel", "Photoshoot", "Repair", "Accident"
- [ ] **Series/Chapters:** Group posts into a "Story" (e.g., "Engine Swap Part 1")
- [ ] **Cost Association:** Field to add "Cost of this event" (currency support)
- [ ] **Mileage Tracking:** Input mileage at time of post
- [ ] **Video Embeds:** YouTube/Vimeo parsing
- [ ] **Gallery Mode:** Lightbox viewer for post images

## 5. Social Graph & Interaction
- [x] Comments table (nested support)
- [x] Likes table (reviews and comments)
- [x] Follows table (user-to-user)
- [x] Bookmarks table (saved reviews)
- [x] Follow user in feed/profile/review
- [x] Like/Unlike reviews and comments
- [x] Bookmark reviews
- [ ] **Car Subscription:** Follow a specific *Car* (updates specific to that vehicle)
- [ ] **Mentions:** `@username` parsing in comments/posts
- [ ] **Reposts:** "Share to my feed" functionality
- [ ] **Guestbook:** Simple "Wall" on user profiles for public messages
- [ ] **"I Saw You":** Special post type for spotting community cars on the road
- [ ] **Blocking:** Block user (hides content, prevents interaction)
- [ ] **Social Sharing:** Native share sheet integration

## 6. Automotive Utilities (Data & Tools)
- [ ] **Fuel Log:**
    - [ ] Input: Odometer, Liters, Price, Fuel Grade, Station
    - [ ] Stats: MPG / L/100km calculation
    - [ ] Charts: Consumption history
- [ ] **Expense Tracker:**
    - [ ] Categories: Insurance, Tax, Wash, Parking, Fines, Parts
    - [ ] "Total Invested" metric on Car Profile
- [ ] **Maintenance Scheduler:**
    - [ ] Set intervals (e.g., "Oil Change every 10k km")
    - [ ] Alert user when odometer reaches threshold
- [ ] **Tire Calculator:** Visual tool to compare tire sizes
- [ ] **Wheel Offset Calculator:** Visual tool for rim fitment

## 7. Gamification: The "Drive" Score
- [ ] **User Reputation:** Points system for likes received and helpful comments
- [ ] **Car "Drive" Score (DR):**
    - [ ] Algorithm (Views + Followers + Activity + Completeness)
    - [ ] Daily updates via Cron job
- [ ] **Leaderboards:**
    - [ ] "Top Cars" by City/Region
    - [ ] "Top Cars" by Make/Model
    - [ ] "Top Users"
- [ ] **"Car of the Day" (Elections):**
    - [ ] **Scheduler:** Auto-select candidates (Top DR cars not won recently)
    - [ ] **Voting UI:** "Battle" mode (A vs B) or List mode
    - [ ] **Hall of Fame:** Calendar view of past winners
    - [ ] **Trophies:** Digital badges on Car Profile (e.g., "Election Winner")

## 8. Marketplace (Flea Market)
- [ ] **Marketplace Schema:** Items, Prices, Condition, Location
- [ ] **Parts Database:** Categories (Engine, Body, Wheels, Audio)
- [ ] **Create Listing:** Sell a part linked to a specific car model compatibility
- [ ] **Car Sales:** Specialized listing for selling a garage vehicle
- [ ] **Geo-Location:** "Parts near me" filter
- [ ] **Seller Rating:** 1-5 stars after transaction
- [ ] **Expiration:** Auto-expire listings after 30 days

## 9. Communities & Groups
- [ ] **Communities Schema:** Groups, Memberships, Roles
- [ ] **Club Creation:** Create specialized groups (e.g., "JDM Legends")
- [ ] **Club Feed:** Posts tagged for the club
- [ ] **Events/Meetups:**
    - [ ] Create Event (Date, Location Map)
    - [ ] "I'm Going" / RSVP list

## 10. Messaging & Notifications
- [ ] **Notification Schema:** Types, Read Status, Payload
- [ ] **Notification Center:** UI with bell icon and unread count
- [ ] **Triggers:** Like, Comment, Reply, Follow, Election Win, Mention
- [ ] **Direct Messaging (Chat):**
    - [ ] Conversation List
    - [ ] Real-time messaging (WebSockets/SSE)
    - [ ] Image attachments
- [ ] **Email Notifications:** Digest of weekly activity (optional)

## 11. Search & Discovery
- [x] Basic Car Catalog Search
- [ ] **Global Search Bar:** Unified search for Users, Cars, Posts, Parts
- [ ] **Advanced Car Filter:** Filter by Engine, Drivetrain (RWD/AWD), Transmission, Horsepower
- [ ] **Region Filter:** "Show content from my City"
- [ ] **Hashtag System:** Clickable tags in posts (#bmw #drift)
- [ ] **Recommendations:** "Similar cars you might like" algorithm

## 12. UI Implementation & Navigation
- [x] Main layout/navigation/header/footer
- [x] Home/feed page with review listing
- [x] Car catalog and detail pages
- [x] User profile pages & Garage UI
- [x] Click user name in feed
- [x] Click user name in review detail page
- [x] Click user name in review list
- [x] Click user name in comments
- [x] Click user name in liked reviews list
- [x] Click user name in liked comments list
- [x] Click user name in bookmarks list
- [x] **Followers List Page/Modal**
- [x] **Following List Page/Modal**
- [x] Click user name in followers list
- [x] Click user name in following list
- [x] **User Hover Cards:** Quick profile preview on hover
- [x] **Breadcrumbs:** Navigation aid for deep pages
- [x] **Mobile Menus:** Responsive bottom sheet navigation

## 13. Admin & Safety
- [ ] **Admin Dashboard:** Stats (Users, Posts, Storage), System Health
- [ ] **User Management:** Ban, Shadowban, Suspend
- [ ] **Content Moderation:** Report content buttons, Review queue
- [ ] **Automated Safety:** Rate limiting on API routes
- [ ] **File Validation:** Strict mime-type checks and virus scanning (optional)

## 14. File Storage & Media
- [x] `public/uploads` local storage setup
- [x] File upload API route
- [x] File validation helpers
- [ ] **Image Optimization:** Server-side resizing (Sharp)
- [ ] **CDN Integration:** Option to swap local storage for S3/R2 later
- [ ] **Backup Strategy:** Script to zip uploads folder

## 15. Deployment, DevOps & Quality
- [ ] **Dockerfile:** Optimized multi-stage build
- [ ] **Docker Compose:** App + Postgres + Redis configuration
- [ ] **Nginx Config:** Reverse proxy with caching rules
- [ ] **Backups:** Automated Postgres dump script
- [ ] **SEO:** Metadata, sitemap.xml, robots.txt, OpenGraph tags
- [ ] **E2E Tests:** Playwright tests for critical paths
- [ ] **Unit Tests:** Jest for domain logic (Score algorithms, Cost calcs)
- [ ] **Performance:** Database indexing, Query optimization
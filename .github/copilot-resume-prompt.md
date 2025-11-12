# Resume Copilot Chat Prompt - Continue Workflow (Self-Hosted)

Copy and paste this into a new GitHub Copilot Chat session (@workspace) or Windsurf to resume work on the Drive2.ru clone:

---

**CONTEXT**: I'm continuing work on a Drive2.ru clone (car review community platform) using Next.js 15, tRPC v11, Drizzle ORM, NextAuth.js, and shadcn/ui. **FULLY SELF-HOSTED** - no cloud services.

**IMPORTANT FILES TO READ**:
1. **`prompt.md`** - Complete project specification (SELF-HOSTED version with NextAuth, no Supabase)
2. **`copilot-checklist.md`** - Progress tracking with checkboxes (READ THIS FIRST to see what's done)
3. **`copilot-init.md`** - Initial setup instructions for reference

**YOUR FIRST TASK**: 
1. Read `copilot-checklist.md` thoroughly to understand:
   - Which phases are complete ✅
   - Which tasks are in progress 🔄
   - What needs to be done next ⏭️
   - Any blockers or notes I've added
2. Summarize the current project status for me
3. Ask me what I want to work on next, OR suggest the next logical step based on the checklist

**CONTEXT PRESERVATION RULES**:
- ALWAYS check `copilot-checklist.md` before making suggestions
- DO NOT repeat work that's already marked as done [x]
- DO NOT suggest Supabase or cloud services - this is SELF-HOSTED
- When generating code, maintain consistency with existing patterns and architecture
- Follow Vertical Slice Architecture from `prompt.md`
- Update `copilot-checklist.md` after completing tasks

**SELF-HOSTED REMINDERS**:
- ✅ Use **NextAuth.js v5** for authentication (not Supabase Auth)
- ✅ Use **local PostgreSQL** via DATABASE_URL in .env
- ✅ Save files to **`public/uploads/`** (not cloud storage)
- ✅ Use **bcrypt** for password hashing
- ✅ No Supabase dependencies

**COMMON RESUME SCENARIOS**:

### If I'm continuing infrastructure setup:
Review what infrastructure is complete (Drizzle? tRPC? NextAuth?), then work on missing pieces.

### If I'm implementing a feature slice:
Check which feature slices are done. Implement the next one completely (api/, components/, domain/, infrastructure/, schemas/, hooks/).

### If I'm building UI/pages:
Check which pages/routes exist. Build the next set of pages according to the App Router structure in `prompt.md`.

### If I'm stuck or have errors:
Help me debug by:
1. Asking about the specific error
2. Reviewing relevant files
3. Checking if dependencies are installed
4. Verifying environment variables (.env.local)
5. Suggesting fixes that align with the self-hosted architecture

**AFTER RESUMING**:
- Show me the current checklist status
- Recommend the next 3-5 tasks to tackle
- Ask if I want to continue with your recommendation or work on something specific

---

**READY TO RESUME**. Please read the checklist and tell me where we are in the project.
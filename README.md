# Peblo Notes — AI-Powered Collaborative Workspace

A full-stack, AI-powered notes application built as part of the Peblo Full Stack Developer Challenge. Peblo Notes enables users to create, organize, and extract insights from their notes using Claude AI.

🔗 **Live Demo:** https://peblo-notes-ocnw.vercel.app

---

## Features

### Core
- **Authentication** — Secure signup/login with JWT sessions and bcrypt password hashing
- **Notes Workspace** — Create, edit, and organize notes with auto-save (debounced at 1.5s)
- **AI Integration** — Generate summaries, extract action items, and suggest titles using Claude AI
- **Search & Filtering** — Real-time keyword search and tag-based filtering
- **Public Sharing** — Generate shareable public links for any note
- **Productivity Dashboard** — Insights including total notes, weekly activity, tag analytics, and AI usage stats

### Bonus
- **Dark Mode** — Premium dark-first design using a zinc color palette
- **Markdown Preview** — Toggle between edit and rendered markdown view
- **Keyboard Shortcuts** — `Ctrl+S` to save, `Ctrl+Shift+N` new note, `Ctrl+Shift+P` preview toggle
- **Optimistic UI** — Instant feedback on delete/archive without waiting for server
- **Auto-expanding Title** — Title textarea grows as you type

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (Neon for production) |
| ORM | Prisma 7 |
| Authentication | NextAuth.js v5 |
| AI Provider | Anthropic Claude (claude-sonnet-4-5) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Deployment | Vercel |

---

## Architecture

peblo-notes/
├── prisma/
│   ├── schema.prisma          # DB schema
│   └── prisma.config.ts       # Prisma 7 config with datasource
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login & signup pages
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/       # Protected workspace
│   │   │   ├── dashboard/     # Insights page
│   │   │   └── notes/
│   │   │       └── [id]/      # Note editor
│   │   ├── shared/
│   │   │   └── [shareId]/     # Public share page
│   │   └── api/
│   │       ├── auth/          # NextAuth + signup
│   │       ├── notes/         # CRUD + AI summary
│   │       └── insights/      # Dashboard analytics
│   ├── components/
│   │   ├── layout/            # Sidebar
│   │   ├── notes/             # NoteCard
│   │   ├── providers/         # SessionProvider
│   │   └── ui/                # shadcn components
│   ├── hooks/
│   │   └── useKeyboardShortcuts.ts
│   └── lib/
│       ├── auth.ts            # NextAuth config
│       ├── claude.ts          # AI integration
│       └── prisma.ts          # DB client singleton

### Key Design Decisions

**Single Next.js repo** — Frontend and backend coexist in one codebase. No CORS issues, shared TypeScript types, and instant deployment to Vercel.

**Prisma 7 with driver adapters** — Prisma 7 introduced a breaking change requiring explicit database adapters (`@prisma/adapter-pg`). This project uses the new `prisma.config.ts` pattern for datasource configuration.

**Debounced auto-save** — Notes save automatically 1.5 seconds after the user stops typing. This uses `useCallback` + `useRef` to prevent stale closures and unnecessary API calls.

**JWT sessions** — Chosen over database sessions for stateless scalability. User ID is embedded in the JWT and extended via NextAuth callbacks.

**Anthropic Claude for AI** — Claude's instruction-following reliability makes it ideal for structured JSON output (summary + action items + title) from unstructured note content.

---

## Database Schema

```prisma
model User {
  id        String    @id @default(cuid())
  name      String
  email     String    @unique
  password  String    # bcrypt hashed
  notes     Note[]
  aiUsages  AIUsage[]
}

model Note {
  id          String    @id @default(cuid())
  title       String    @default("Untitled")
  content     String    @default("")
  isArchived  Boolean   @default(false)
  isPublic    Boolean   @default(false)
  shareId     String?   @unique @default(cuid())
  summary     String?
  actionItems String[]  # PostgreSQL array
  tags        NoteTag[]
  aiUsages    AIUsage[]
}

model Tag {
  id    String    @id @default(cuid())
  name  String    @unique
  notes NoteTag[]
}

model NoteTag {
  noteId String
  tagId  String
  # Explicit join table for full control
  @@id([noteId, tagId])
}

model AIUsage {
  id        String   @id @default(cuid())
  type      String   # "summary" | "action_items"
  userId    String
  noteId    String
}
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new account |
| POST | `/api/auth/callback/credentials` | Login (NextAuth) |
| GET | `/api/notes` | List notes with search/filter |
| POST | `/api/notes` | Create new note |
| GET | `/api/notes/:id` | Get single note |
| PATCH | `/api/notes/:id` | Update note content/tags/status |
| DELETE | `/api/notes/:id` | Delete note |
| POST | `/api/notes/:id/generate-summary` | Generate AI summary |
| GET | `/api/insights` | Dashboard analytics |
| GET | `/shared/:shareId` | Public note page (no auth) |

---

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 17
- Anthropic API key (console.anthropic.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOURUSERNAME/peblo-notes.git
cd peblo-notes

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values
```

### Environment Variables

```bash
# .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/peblo_notes"
NEXTAUTH_SECRET="your-secret-key"
AUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="sk-ant-..."
```

### Database Setup

```bash
# Create database
psql -U postgres -c "CREATE DATABASE peblo_notes;"

# Push schema
npx prisma db push

# Generate client
npx prisma generate

# (Optional) Open Prisma Studio
npx prisma studio
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Sample AI Output

Given a note about a product planning meeting, the AI generates:

```json
{
  "summary": "Quarterly product planning meeting focused on improving user onboarding and reducing first-month churn. Team discussed increasing onboarding completion from 42% to 70% through interactive tutorials, better analytics, and personalized email campaigns.",
  "action_items": [
    "John to prepare UI mockups for new onboarding flow by next Friday",
    "Sarah to review and update API documentation before next sprint",
    "DevOps team to set up staging environment for new payment gateway",
    "Marketing team to A/B test two versions of welcome email"
  ],
  "suggested_title": "Q3 Product Planning: Onboarding Improvement Initiative"
}
```

---

## Deployment

The application is deployed on **Vercel** with **Neon PostgreSQL** as the production database.

```bash
# Production build
npm run build

# The postinstall script auto-generates Prisma client on Vercel
"postinstall": "prisma generate"
```

---

## What I Would Add With More Time

- **Real-time collaboration** using WebSockets or Liveblocks
- **Rich text editor** (Tiptap or Lexical) instead of plain textarea
- **Note versioning** — track edit history
- **Automated tests** with Vitest + Playwright
- **Rate limiting** on AI endpoints
- **Export to PDF/Markdown**

---

## Author

Built with care for the Peblo Full Stack Developer Challenge.
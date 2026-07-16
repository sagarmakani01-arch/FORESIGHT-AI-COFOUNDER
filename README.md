<div align="center">

# FORESIGHT

### AI Co-Founder for Startups

**From idea to execution — a founding team that thinks, plans, and builds alongside you.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)](#license)

[Getting Started](#-getting-started) · [Features](#-features) · [Architecture](#-architecture) · [Self-Host](#-self-host)

</div>

---

## What is Foresight?

Foresight is a **premium AI-powered startup operating system** that gives founders a full-stack co-founder capable of strategic thinking, market analysis, financial planning, and real-time execution. It doesn't just answer questions — it plans sprints, tracks milestones, monitors competitors, manages your knowledge base, and runs autonomous research cycles.

Built with the **Premium Executive Edition** design system — a light-first, glass-panel aesthetic with 0.5px hairline borders, emerald accents, and Geist typography.

---

## Features

### Core Intelligence
| Feature | Description |
|---------|-------------|
| **AI Co-Founder Chat** | Persistent, context-aware conversations with memory across sessions. Your AI partner remembers your vision, strategy, and decisions. |
| **Multi-Provider AI** | Switch between Ollama (local), OpenAI, Anthropic, or Google Gemini. Bring your own API keys — no vendor lock-in. |
| **Autonomous Research** | AI generates research reports, market analyses, and competitive intelligence on demand. |
| **Smart Document Generation** | AI drafts business plans, pitch decks, technical specs, and strategy documents from conversation context. |

### Startup Operations
| Feature | Description |
|---------|-------------|
| **Projects & Sprints** | Track projects with status, priority, deadlines, and task dependencies. |
| **Task Management** | Kanban-style tasks with assignees, priorities, and sprint assignment. |
| **Roadmaps** | Visual roadmaps with phases, milestones, and timeline tracking. |
| **Milestones** | Key achievement markers across your startup journey. |
| **Documents** | Version-controlled document management with folders and AI sidebar. |

### Financial & Market Intelligence
| Feature | Description |
|---------|-------------|
| **Financial Dashboard** | Revenue vs. expenses tracking, burn rate calculation, runway projection. |
| **Investor CRM** | Track investors, stages, check sizes, and last contact dates. |
| **Competitor Analysis** | Monitor competitors with strengths, weaknesses, features, and pricing. |
| **Export to CSV** | Export any dataset for external analysis. |

### Growth & Team
| Feature | Description |
|---------|-------------|
| **Hiring Pipeline** | Track open positions, applicants, and hiring stages. |
| **Marketing Campaigns** | Plan and monitor marketing initiatives with status tracking. |
| **Meeting Scheduler** | Log meetings with attendees, notes, and outcomes. |
| **Knowledge Base** | Build institutional knowledge with categorized entries and metadata. |

### Developer & Platform
| Feature | Description |
|---------|-------------|
| **Full-Text Search** | Search across all entities — projects, tasks, docs, files, investors — with Cmd+K. |
| **File System** | In-browser file editor with tree view, AI sidebar, and multi-type support. |
| **Audit Log** | Track all create/update actions across the platform. |
| **Email Notifications** | Server-side email notifications for key events. |
| **Dark Mode** | Toggle between light and dark themes with persistent preference. |
| **Responsive** | Collapsible sidebar, mobile-optimized layouts, touch-friendly. |
| **Keyboard Shortcuts** | Cmd+K (search), Ctrl+N (new conversation), Escape (dismiss). |
| **DB-Backed Notifications** | Real-time notification center with unread counts and mark-as-read. |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     FORESIGHT                            │
├─────────────────────────────────────────────────────────┤
│  Frontend                                               │
│  ├─ Next.js 16 (App Router + Turbopack)                 │
│  ├─ React 19 + Tailwind CSS v4                          │
│  ├─ Framer Motion (animations)                          │
│  ├─ Recharts (data visualization)                       │
│  └─ Premium Executive Design System                     │
├─────────────────────────────────────────────────────────┤
│  Backend                                                │
│  ├─ 40+ API Routes (REST)                               │
│  ├─ NextAuth v4 (JWT + Credentials + OAuth)             │
│  ├─ Multi-Provider AI (Ollama/OpenAI/Anthropic/Google)  │
│  ├─ Prisma 7 ORM + PostgreSQL                          │
│  └─ 30+ Database Models                                 │
├─────────────────────────────────────────────────────────┤
│  Infrastructure                                         │
│  ├─ PostgreSQL (via Prisma Dev or Docker)               │
│  ├─ Ollama (local AI, no API key required)              │
│  └─ Docker Compose (production-ready)                   │
└─────────────────────────────────────────────────────────┘
```

### Database Schema (30+ Models)

```
User ─┬─ Company ─┬─ Project ─── Task ─── TaskDependency
      │           ├─ Document ── DocumentVersion
      │           ├─ Competitor
      │           ├─ Milestone
      │           ├─ FinanceEntry
      │           ├─ Investor
      │           ├─ Roadmap ── RoadmapPhase
      │           ├─ KnowledgeEntry
      │           ├─ ResearchReport
      │           ├─ Position (Hiring)
      │           ├─ Campaign (Marketing)
      │           └─ Meeting
      ├─ Conversation ── Message
      ├─ Notification
      ├─ AiProvider
      ├─ AuditLog
      ├─ Session
      └─ Account
```

---

## Getting Started

### Prerequisites

- **Node.js** 20.9+ (LTS)
- **PostgreSQL** (or use `npx prisma dev` for zero-config local DB)
- **Ollama** (optional — for free local AI, no API key needed)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/sagarmakani01-arch/FORESIGHT-AI-COFOUNDER.git
cd FORESIGHT-AI-COFOUNDER

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration (see below)

# Push database schema
npx prisma db push

# Seed test data (optional)
npx tsx prisma/seed.ts

# Start development server
npm run dev
```

Open **http://localhost:3000** and sign in with the test account:

| Field | Value |
|-------|-------|
| Email | `sagar@nexuspay.io` |
| Password | `password123` |

### Environment Variables

```env
# Database (use `npx prisma dev` for automatic local DB)
DATABASE_URL="postgres://postgres:postgres@localhost:5432/foresight?sslmode=disable"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# AI — Ollama (default, no key needed)
OLLAMA_BASE_URL="http://localhost:11434/v1"
AI_MODEL="llama3.2:latest"

# Optional: OpenAI / Anthropic / Google (configured via Settings UI)
```

### Docker (Production)

```bash
docker compose up -d
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 16 | App Router, Turbopack, React Server Components |
| Language | TypeScript 5 | End-to-end type safety |
| UI | React 19 + Tailwind CSS v4 | Component architecture, utility-first styling |
| Animations | Framer Motion | Smooth transitions, micro-interactions |
| Charts | Recharts | Declarative, composable data visualization |
| Database | PostgreSQL | Battle-tested, JSONB support, full-text search |
| ORM | Prisma 7 | Type-safe queries, migrations, studio |
| Auth | NextAuth v4 | JWT + Credentials + OAuth (Google, GitHub) |
| AI | Ollama / OpenAI / Anthropic / Google | Multi-provider, bring your own keys |
| Design | Premium Executive Edition | Light theme, glass panels, emerald accents |

---

## SaaS Features Included

Foresight ships with the foundational features every SaaS product needs:

- **Authentication** — Email/password + OAuth (Google, GitHub) with bcrypt hashing
- **Authorization** — Session-based with JWT, middleware-protected routes
- **Rate Limiting** — Per-IP rate limiting on API and auth endpoints
- **Security Headers** — X-Frame-Options, CSP, HSTS, XSS Protection
- **CORS** — Configurable allowed origins
- **Audit Logging** — Track who did what and when
- **Error Boundaries** — Graceful failure with recovery UI
- **Loading States** — Skeleton loaders for every major view
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Dark Mode** — System-aware with manual toggle
- **Keyboard Navigation** — Power-user shortcuts throughout
- **CSV Export** — Export any dataset for external tools
- **Email Notifications** — Server-side email integration
- **Full-Text Search** — Cross-entity search with Cmd+K
- **Onboarding Flow** — Guided 7-step company setup
- **Database Seeding** — Realistic test data for development
- **Zero-Config DB** — `npx prisma dev` for instant local PostgreSQL

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, register, forgot-password
│   ├── (dashboard)/      # All app pages
│   │   ├── cofounder/    # AI chat interface
│   │   ├── dashboard/    # Analytics overview
│   │   ├── projects/     # Project management
│   │   ├── tasks/        # Task tracking
│   │   ├── documents/    # Document management
│   │   ├── files/        # In-browser file editor
│   │   ├── finance/      # Financial tracking
│   │   ├── competitors/  # Competitor analysis
│   │   ├── investors/    # Investor CRM
│   │   ├── knowledge/    # Knowledge base
│   │   ├── research/     # AI research reports
│   │   ├── hiring/       # Hiring pipeline
│   │   ├── marketing/    # Campaign tracking
│   │   ├── meetings/     # Meeting scheduler
│   │   ├── roadmaps/     # Strategic roadmaps
│   │   └── settings/     # Account + AI provider config
│   ├── (onboarding)/     # 7-step onboarding wizard
│   └── api/              # 40+ REST API routes
├── components/
│   ├── chat/             # AI conversation components
│   ├── dashboard/        # Metric cards, charts, widgets
│   ├── files/            # File tree, editor
│   ├── landing/          # Marketing page sections
│   ├── layout/           # Sidebar, topbar, app shell
│   ├── shared/           # Modals, search, page headers
│   └── ui/               # Skeleton, reusable UI
├── lib/
│   ├── ai/               # Multi-provider AI system
│   ├── auth/             # NextAuth configuration
│   ├── hooks.ts          # Custom React hooks
│   ├── prisma.ts         # Database client
│   ├── files-store.tsx   # File system context
│   ├── audit.ts          # Audit logging
│   └── use-keyboard.ts   # Keyboard shortcuts
└── proxy.ts              # Route protection (Next.js 16)
```

---

## API Reference

All authenticated endpoints require a valid session cookie.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/data` | Full dashboard data (projects, tasks, finance, etc.) |
| `GET` | `/api/user/me` | Current user profile + company |
| `POST` | `/api/onboarding` | Complete onboarding setup |
| `GET/POST` | `/api/projects` | List or create projects |
| `GET/POST` | `/api/tasks` | List or create tasks |
| `GET/POST` | `/api/documents` | List or create documents |
| `GET/POST` | `/api/competitors` | List or add competitors |
| `GET/POST` | `/api/investors` | List or add investors |
| `GET/POST` | `/api/finance` | List or add finance entries |
| `GET/POST` | `/api/conversations` | AI conversation management |
| `POST` | `/api/ai/chat` | Stream AI chat response |
| `GET/POST` | `/api/ai/providers` | Manage AI provider API keys |
| `GET` | `/api/search?q=` | Full-text search across all entities |
| `GET` | `/api/export?entity=X` | Export data as CSV |
| `GET` | `/api/audit` | View audit log |
| `POST` | `/api/seed` | Seed sample data |

---

## Development

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type check
npx tsc --noEmit

# Database studio (visual DB browser)
npx prisma studio

# Reset database and re-seed
npx prisma db push --force-reset && npm run db:seed
```

---

## Deployment

Foresight is designed for deployment on **Vercel**, **Railway**, **Render**, or any Node.js hosting platform.

### Vercel

```bash
npx vercel
```

### Docker

```bash
docker compose -f docker-compose.prod.yml up -d
```

### Manual

```bash
npm run build
npm start
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## License

Proprietary. All rights reserved.

---

<div align="center">

**Built with conviction. Engineered for scale.**

*Foresight — Your AI Co-Founder*

</div>

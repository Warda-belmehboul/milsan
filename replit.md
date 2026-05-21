# Workspace

## Overview

pnpm workspace monorepo using TypeScript. This is **منصة التفصيح والتحسين** — an Arabic literature and language platform.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, TailwindCSS, shadcn/ui, framer-motion
- **AI**: OpenAI via Replit AI Integrations (for auto-tafseeh feature)

## Platform Features

1. **المعجم الرقمي** — Digital Arabic dictionary with search, eloquent words, phrases, and examples
2. **التفصيح الآلي** — AI-powered text eloquence improvement (OpenAI GPT)
3. **المفصحون البشريون** — Human proofreader marketplace with booking and sessions
4. **العبارات المسجوعة** — Browsable rhyming Arabic phrases explorer
5. **الدورات التدريبية** — Free and paid training courses
6. **لعبة الأفصح** — Quiz game for choosing the most eloquent word
7. **مصحح الإملاء** — Arabic spelling dictation trainer
8. **لوحة تحكم المدير** — Admin panel (password: admin123) with full CRUD control

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (all routes)
│   └── tafseeh/            # React + Vite frontend (Arabic, RTL)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
│       └── src/schema/
│           ├── dictionary.ts
│           ├── proofreaders.ts  # includes sessions table
│           ├── rhymes.ts
│           ├── courses.ts
│           ├── quiz.ts
│           └── spelling.ts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## API Routes

All routes under `/api/`:
- `GET/POST /dictionary` — Dictionary entries (paginated)
- `GET /dictionary/search?q=` — Search dictionary
- `PUT/DELETE /dictionary/:id` — Admin CRUD
- `POST /tafseeh/auto` — AI text improvement
- `GET/POST /proofreaders` — List/register proofreaders
- `PUT /proofreaders/:id` — Admin status update
- `POST /proofreaders/:id/sessions` — Book a session
- `GET /sessions` — All sessions (admin)
- `GET/POST/PUT/DELETE /rhymes` — Rhyming phrases CRUD
- `GET/POST/PUT/DELETE /courses` — Courses CRUD
- `GET /quiz/question` — Random quiz question
- `GET/POST /quiz/questions` — Admin quiz management
- `DELETE /quiz/questions/:id` — Delete quiz question
- `POST /quiz/answer` — Submit answer
- `GET /spelling/text` — Random spelling text
- `POST /spelling/check` — Check user spelling
- `POST /spelling/texts` — Admin: add spelling text
- `GET /admin/stats` — Platform statistics

## Admin Access

Admin panel at `/admin` with password: `admin123`

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API types from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes

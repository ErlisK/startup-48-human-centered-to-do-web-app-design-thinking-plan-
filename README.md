# ✦ focus — keyboard-first todo app

**Live app:** https://startup-48-human-centered-to-do-web.vercel.app  
**Stack:** Next.js 15 (App Router, TypeScript) · Supabase (PostgreSQL + auth) · Vercel · PWA

---

## What is focus?

A minimal, keyboard-first todo app that captures tasks in under 2 seconds and surfaces your top 3 for today. No noise, no gamification, no streak anxiety.

```
⌘K          → Quick capture from anywhere
Type naturally: "Call dentist tomorrow 3pm #health"
Space       → Complete focused task
← → ↑ ↓    → Navigate tasks
G T         → Go to Today
G I         → Go to Inbox
```

---

## Features

- **2-second capture** — type naturally with NLP date/tag parsing (chrono-node)
- **Morning deal** — pick your top 3 focus tasks each morning (swap up to 3 times)
- **Done Wall** — visual tile wall of completed tasks (ethical dopamine without streaks)
- **Offline-ready** — PWA with service worker, IndexedDB queue, background sync
- **Data portability** — CSV/JSON export, CSV import (Todoist-compatible), account deletion
- **Keyboard-first** — full arrow-key navigation, WCAG AA accessibility
- **Privacy-first** — no analytics by default, telemetry opt-in only, open source

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 App Router + TypeScript |
| Styling | Tailwind-compatible CSS vars + design tokens |
| Database | Supabase (PostgreSQL + RLS + Realtime) |
| Auth | Supabase Auth (magic link + password) |
| Offline | Manual Service Worker + IndexedDB queue + ULID |
| PWA | manifest.json + sw.js (6KB) |
| Deploy | Vercel (Turbopack build) |
| Testing | Jest (138 unit tests) + Playwright (58 E2E tests) |
| Security | Middleware rate limiting + input sanitisation + audit log |

---

## Security

- Row-Level Security on all tables (PostgreSQL RLS)
- Rate limiting: 10 req/min on `/api/auth`, 120 req/min on `/api/*`
- Input sanitisation: XSS/injection protection on all user fields
- Audit log table: all data mutations tracked
- HSTS + COOP + COEP + X-Frame-Options security headers
- Privacy: no third-party tracking SDKs loaded by default

---

## Development

```bash
git clone https://github.com/ErlisK/startup-48-human-centered-to-do-web-app-design-thinking-plan-
cd startup-48-human-centered-to-do-web-app-design-thinking-plan-
npm install
cp .env.local.example .env.local   # Add Supabase keys
npm run dev
```

### Tests

```bash
npx jest --no-coverage              # 138 unit/integration tests
npx playwright test --project=chromium  # 58 E2E tests
```

---

## Roadmap

- [x] Phase 1–4: Research, design, prototyping
- [x] Phase 5: MVP build (auth, capture, today view, PWA, accessibility)
- [x] Phase 6: Dogfooding + security hardening + micro-fixes
- [ ] Phase 7: Analytics (opt-in) + user interviews
- [ ] Phase 8: Growth — SEO, directories, community

---

## License

MIT — see [LICENSE](LICENSE)

---

*Built with design thinking. No VC funding. No dark patterns.*

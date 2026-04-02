# ✦ focus — keyboard-first todo app

**Live app:** https://startup-48-human-centered-to-do-web.vercel.app  
**Install:** https://startup-48-human-centered-to-do-web.vercel.app/install  
**Stack:** Next.js 15 (App Router, TypeScript) · Supabase (PostgreSQL + auth) · Vercel · PWA

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests: 162 unit + 71 E2E](https://img.shields.io/badge/tests-162_unit_%2B_71_E2E-brightgreen)](https://github.com/ErlisK/startup-48-human-centered-to-do-web-app-design-thinking-plan-/actions)
[![No tracking](https://img.shields.io/badge/tracking-none-success)](https://startup-48-human-centered-to-do-web.vercel.app/privacy)

---

## What is focus?

A minimal, keyboard-first todo app that captures tasks in under 2 seconds and surfaces your top 3 for today. No noise, no gamification, no streak anxiety.

```
⌘K          → Quick capture from anywhere
Type: "Call dentist tomorrow 3pm #health"
Space       → Complete focused task
← → ↑ ↓    → Navigate tasks
G T         → Go to Today
G I         → Go to Inbox
```

**Privacy-first:** No analytics, no tracking scripts, no ads — ever. Only connection is Supabase (your data).

---

## Features

- **2-second capture** — NLP date/tag parsing ("tomorrow 3pm", "#work", "!high")
- **Morning deal** — pick your top 3 focus tasks; swap up to 3 times
- **Done Wall** — visual tile wall of completions (ethical dopamine, no streaks)
- **Offline-ready** — PWA + service worker + IndexedDB queue + background sync
- **Data portability** — CSV/JSON export, Todoist-compatible CSV import
- **Account deletion** — hard delete in one confirmed tap
- **Keyboard-first** — full arrow-key nav, WCAG AA, 100% mouse-free usable
- **Privacy-first** — zero third-party SDKs loaded by default

---

## Install as PWA (no app store needed)

focus is a Progressive Web App — add it to your home screen on any device:

### 📱 iPhone / iPad (Safari required)
1. Open **Safari** and visit the app URL
2. Tap the **Share button** (□↑) at the bottom
3. Tap **"Add to Home Screen"**
4. Tap **"Add"** — done!

### 🤖 Android (Chrome / Samsung Internet)
1. Open **Chrome** and visit the app URL
2. Tap **⋮** (three dots) → **"Add to Home screen"** or **"Install app"**
3. Tap **"Install"**
4. Or: wait for Chrome's automatic install banner

### 🖥️ Desktop Chrome / Edge
1. Visit the app URL in Chrome or Edge
2. Look for the **⊕ install icon** in the address bar (right side)
3. Click it → **"Install"**

### 🧭 macOS Safari (Sonoma+)
1. Visit the app URL in Safari
2. **File → Add to Dock**

📖 [Detailed install guide with screenshots →](https://startup-48-human-centered-to-do-web.vercel.app/install)

---

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Quick capture from anywhere |
| `Enter` | Save task |
| `Space` | Complete focused task |
| `↑` `↓` | Navigate between tasks |
| `⌫` / `Delete` | Delete task (with confirmation) |
| `Esc` | Close modal / cancel |
| `G T` | Go to Today |
| `G I` | Go to Inbox |

---

## Privacy

**No tracking. No ads. No third-party analytics.**

The app makes exactly one external connection: Supabase, to save your tasks. No Google Analytics, no Facebook Pixel, no Hotjar, no session recording — ever.

- **Export:** CSV or JSON at any time from Settings
- **Delete:** Hard-delete your account + all data in one tap
- **Open source:** Every line of code is public on GitHub

[Read the full privacy policy →](https://startup-48-human-centered-to-do-web.vercel.app/privacy)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 App Router + TypeScript |
| Styling | CSS custom properties (design tokens) |
| Database | Supabase (PostgreSQL + RLS + Realtime) |
| Auth | Supabase Auth (magic link + password) |
| Offline | Manual Service Worker (6KB) + IndexedDB queue + ULID |
| PWA | manifest.json + sw.js |
| Deploy | Vercel (Turbopack build) |
| Testing | Jest 162 unit/snapshot + Playwright 71 E2E |
| Security | Middleware rate limiting + input sanitisation + audit log |

---

## Security

- Row-Level Security on all tables (PostgreSQL RLS)
- Rate limiting: 10 req/min auth endpoints, 120 req/min general API
- Input sanitisation: XSS/injection protection on all fields
- Audit log: all mutations tracked with IP + user-agent
- Security headers: HSTS, COOP, COEP, X-Frame-Options, CSP
- Zero third-party tracking SDKs

Report vulnerabilities: see `/.well-known/security.txt`

---

## Performance (smoke test results)

| Metric | Budget | Actual |
|--------|--------|--------|
| P99 API latency | ≤ 300ms | **88ms** |
| P75 HTML (TTI) | ≤ 2000ms | **29ms** |
| P99 static assets | ≤ 500ms | **34ms** |
| 5xx error rate | < 1% | **0.00%** |

Tested: k6, 50 VUs × 5 minutes, 100,806 requests.

---

## Development

```bash
git clone https://github.com/ErlisK/startup-48-human-centered-to-do-web-app-design-thinking-plan-
cd startup-48-human-centered-to-do-web-app-design-thinking-plan-
npm install
cp .env.local.example .env.local   # Fill in Supabase keys
npm run dev                         # http://localhost:3000
```

### Supabase setup

1. Create a project at https://app.supabase.com
2. Run SQL migrations in `supabase/migrations/` in order
3. Enable Realtime on the `tasks` table
4. Copy project URL + keys to `.env.local`

### Tests

```bash
# Unit + snapshot tests (162 tests, ~3s)
npx jest --no-coverage

# Core E2E flows (58 tests, Chromium)
PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test --project=chromium

# Visual regression (13 tests, needs running app)
PLAYWRIGHT_BASE_URL=https://... npx playwright test e2e/visual/

# Performance smoke test (50 VUs, 5 min — needs k6)
k6 run perf/load-test.js
```

### Build

```bash
npm run build    # Turbopack production build
npm run lint     # ESLint
npx tsc --noEmit # Type check
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). PRs welcome for:
- Bug fixes
- Accessibility improvements
- Performance optimisations
- Documentation

**Not looking for:** analytics integrations, gamification, social features, streak mechanics.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

**Latest:** v0.1.2 — Privacy page navigation, done-state messaging, iOS zoom fix.

---

## License

MIT — see [LICENSE](LICENSE).

---

*Built with design thinking. No VC. No dark patterns. Free forever.*

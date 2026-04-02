# Contributing to focus

Thank you for your interest! focus is a small, opinionated project — contributions that align with its core design principles are welcome.

## Core principles (before you PR)

1. **Privacy-first** — no new third-party scripts or tracking of any kind
2. **No streak mechanics** — ethical design (see SOUL section in codebase comments)
3. **Keyboard-accessible** — all interactive elements must be reachable without a mouse (WCAG AA)
4. **Performance budget** — keep the service worker under 10KB; P99 API ≤ 300ms
5. **Minimal surface** — resist feature creep; if in doubt, leave it out

## Getting started

```bash
git clone https://github.com/ErlisK/startup-48-human-centered-to-do-web-app-design-thinking-plan-
cd startup-48-human-centered-to-do-web-app-design-thinking-plan-
npm install
cp .env.local.example .env.local
# Fill in Supabase keys (see README for setup)
npm run dev
```

## Development commands

```bash
npm run dev          # Development server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint

# Tests
npx jest --no-coverage                    # Unit + snapshot tests (162 tests)
npx playwright test --project=chromium   # Core E2E flows (58 tests)
npx playwright test e2e/visual/           # Visual regression (13 tests)
```

## Database setup (Supabase)

1. Create a Supabase project at https://app.supabase.com
2. Run `supabase/migrations/` SQL files in order against your project
3. Enable Realtime for the `tasks` table
4. Set env vars in `.env.local`

## Pull Request checklist

- [ ] `npx jest --no-coverage` passes (162 tests)
- [ ] `npm run build` succeeds (no TypeScript errors)
- [ ] `npm run lint` clean
- [ ] No new third-party scripts added to `app/layout.tsx` or `next.config.ts`
- [ ] Any new interactive component has keyboard support + ARIA roles
- [ ] CHANGELOG.md updated under `[Unreleased]`

## Reporting bugs

Open an issue with:
- Browser + OS
- Steps to reproduce
- Expected vs actual behaviour
- Screenshot if relevant (no personal task data please)

## Security vulnerabilities

Please don't open public issues for security bugs. Use the contact in `/.well-known/security.txt` or open a private GitHub Security Advisory.

## Code style

- TypeScript strict mode
- No `any` types unless unavoidable (add a comment explaining why)
- CSS: design tokens only (`var(--accent-blue)`, not raw hex values)
- Commits: conventional commits format (`feat:`, `fix:`, `docs:`, `perf:`, `test:`)

---

*focus is built with ❤️ and design thinking. Quality over quantity.*

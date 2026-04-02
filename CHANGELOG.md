# Changelog

All notable changes to focus app are documented here.  
Format: [Semantic Versioning](https://semver.org) — [Keep a Changelog](https://keepachangelog.com)

---

## [Unreleased]
### Added
- /install page: platform-specific PWA install instructions (iOS/Android/Desktop/macOS)
- Landing page: privacy pledge section, JSON-LD structured data, Install section, Open Source section
- robots.txt: search engine indexing rules
- sitemap.ts: Next.js App Router dynamic sitemap (6 public pages)
- /.well-known/security.txt: vulnerability disclosure contact
- .env.local.example: self-hosting environment variable template
- CONTRIBUTING.md: development setup, PR checklist, core principles
- LICENSE: MIT license file
- Performance smoke test results in README

### Changed
- Landing page: nav now includes Install link; footer includes Changelog link
- README: comprehensive rewrite with PWA install instructions, keyboard shortcuts, privacy section, performance stats

---

## [0.1.2] — 2026-04-02 (Dogfooding Week 1, Day 6)
### Added
- Privacy page: "← Back to app" navigation link in header
- Today empty state: "All done today! N tasks completed ✓" in accent-green
- `⌘K` shortcut hint shown in Today empty state

### Fixed
- QuickCaptureModal: restores focus to previously-focused element on close (WCAG 2.4.3)

---

## [0.1.1] — 2026-04-01 (Dogfooding Week 1, Day 4)
### Fixed
- CaptureBar + all inputs: font-size bumped to 16px (suppresses iOS auto-zoom on focus)
- QuickCaptureModal: focus stored on open, restored on Escape/close
- Today empty state: added "Add your first task above ↑" CTA for new users

---

## [0.1.0] — 2026-03-28 (Phase 5 Complete)
### Added
- Full auth flow: magic link + password, signup, password reset, onboarding
- Task capture: NLP parsing (chrono-node), ULID IDs, optimistic UI
- Today view: morning deal, focus-3 limit, swap pool, done wall
- Inbox view: full task list with priority sorting
- Data portability: CSV/JSON export, CSV import (Todoist-compatible)
- Account deletion: hard-delete with typed confirmation
- Privacy page + telemetry opt-in policy
- PWA: manifest.json, service worker, offline fallback, installable
- WCAG AA accessibility: skip nav, ARIA landmarks, keyboard navigation
- Security: rate limiting, RLS, audit log, input sanitisation, HSTS
- 138 unit/integration tests, 58 E2E tests (Playwright)
- CI: GitHub Actions (unit-tests, build, e2e, lighthouse-ci jobs)
- Health endpoint: `GET /api/health`

---

## [0.0.1] — 2026-03-15 (Phase 1–4: Research & Design)
### Added
- Design thinking research: user interviews, empathy maps, POV statements
- 14 HMW questions, 3 design principles
- KLM analysis: capture ≤2.0s, check-off kbd ≤1.0s, check-off touch ≤1.0s
- Wireframes, accessibility audit plan, ethical retention mechanics

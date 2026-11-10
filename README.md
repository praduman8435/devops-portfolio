# devops-portfolio

The personal site of **Praduman Prajapati**, a freelance DevOps engineer (AWS · Kubernetes · Terraform · CI/CD · DevSecOps).
The design is terminal-first: a boot sequence, a working interactive shell, a ⌘K command palette and a live cluster-topology background.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Motion · Vercel Analytics & Speed Insights.

## Features

| | |
|---|---|
| **Interactive terminal** | A small real shell with a command registry, history (↑/↓), tab completion, `Ctrl+L`, and easter eggs like `sudo hire-me` and `kubectl get pods`. Press `/` anywhere to focus it. |
| **Command palette** | `⌘K` / `Ctrl+K`. An accessible combobox to jump to sections, copy the email address, or open social links. |
| **Project brief builder** | Clients pick services, timeline and budget, and a live `brief.md` preview turns into a pre-filled email. There's no backend and nothing is stored. |
| **Boot sequence** | Plays once per session. An inline script decides before first paint, so there's no flash. It's skipped for `prefers-reduced-motion` and fails open if JavaScript never loads. |
| **Network canvas** | Drifting nodes, links and data packets that react to the cursor. It pauses off-screen and in hidden tabs, and is DPR-aware. |
| **Products** | Klasiq, Radixo and Klasiq Kirana, each shown in a browser-frame mockup. |
| **SEO** | Metadata API, Open Graph and Twitter images, JSON-LD `Person`, `sitemap.xml`, `robots.txt` and a web manifest. |
| **Security headers** | HSTS, `X-Frame-Options`, `nosniff`, Referrer-Policy, Permissions-Policy and COOP, set in `next.config.ts`. |
| **Accessibility** | Semantic landmarks, skip link, visible focus, ARIA on the terminal, palette and toasts, and reduced-motion support throughout. |

## Gig Radar (private)

`/radar` is a private, owner-only tool. It finds fresh DevOps, SRE, platform and infrastructure freelance work across several sources, ranks it by fit, and puts low-competition jobs first.

| Source | Access | Bid counts |
|---|---|---|
| Upwork | Official OAuth + GraphQL API (needs an approved API key) | ✓ proposals + client stats |
| Freelancer.com | Official public API, filtered by DevOps/cloud skill IDs | ✓ |
| HN "Who is hiring?" | Algolia API, contract/freelance posts only | – |
| Remote OK · We Work Remotely · Remotive | Public API / RSS (attribution kept, Remotive cached 6h) | – |
| X / Twitter | API v2 recent search (optional, paid token) | – |
| LinkedIn · Toptal · Contra · Guru · PeoplePerHour · Wellfound | No usable API: one-click pre-filtered searches | – |

**How a job is ranked:** fit = 45% relevance + 25% freshness + 20% competition (fewer bids) + 10% client quality. Relevance uses the keyword profile in [`src/lib/radar/profile.ts`](src/lib/radar/profile.ts), weighted by where a term appears (title > skills > description), with off-profile work filtered out. Each card shows *why* it matched. Jobs posted within 3 hours with fewer than 5 bids are flagged **apply early**.

**Security:**
- Fails closed when unconfigured.
- Passphrase login with constant-time comparison and per-IP throttling.
- The session is an HS256 JWT in an HttpOnly, Secure, SameSite=Lax cookie.
- Upwork tokens are AES-256-GCM encrypted (JWE) in their own HttpOnly cookie, so there's no database.
- OAuth is protected with a CSRF `state`.
- Secrets are guarded by `server-only`.
- `noindex` on the page, the robots file and response headers.

**Environment variables (Vercel → Settings → Environment Variables):**

| Variable | Required | Purpose |
|---|---|---|
| `RADAR_PASSWORD` | yes | Your login passphrase (≥ 8 chars; use a long random one) |
| `RADAR_SECRET` | yes | ≥ 32 random chars; signs sessions and encrypts tokens |
| `UPWORK_CLIENT_ID` / `UPWORK_CLIENT_SECRET` | for Upwork | From your approved Upwork API key |
| `UPWORK_REDIRECT_URI` | optional | Defaults to `<site>/api/radar/upwork/callback` |
| `X_BEARER_TOKEN` | optional | X API v2 token with recent search |

**Upwork setup:**
1. Request a key at upwork.com/developer/keys/apply with read access to marketplace job postings, using the callback URL shown in the radar's setup panel.
2. Add the two env vars and redeploy.
3. Press **connect**.

If Upwork changes its schema, open `/api/radar/upwork/schema` while signed in. It introspects the live GraphQL schema so the query in `src/lib/radar/sources.ts` can be matched to it.

```bash
npm test   # ranking engine + normalizers (vitest)
```

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # ESLint (next/core-web-vitals + typescript)
npm run typecheck  # tsc --noEmit
npm run build      # production build
```

Fonts are self-hosted from `@fontsource-variable/*` through `next/font/local`, so builds never need network access.

## Editing content

All copy lives in typed modules under [`src/content/`](src/content). Components never hard-code it.

| File | What it controls |
|---|---|
| `site.ts` | name, email, social links, section order |
| `services.ts` | services, engagement models, process stages |
| `projects.ts` | DevOps projects and the "more work" list |
| `products.ts` | shipped products (add new ones here) |
| `writing.ts` | blog posts and the Kubernetes series |
| `stack.ts` | the tool tree and the marquee |

Terminal commands live in [`src/components/terminal/commands.tsx`](src/components/terminal/commands.tsx).

## Project structure

```
src/
├─ app/                 layout, page, SEO routes (sitemap, robots, manifest), OG image, 404
├─ components/
│  ├─ sections/         one file per page section
│  ├─ terminal/         interactive shell (registry + renderer)
│  ├─ effects/          boot screen, network canvas, pointer glow
│  └─ ui/               primitives: reveal, scramble text, palette, toaster, icons, button
├─ content/             typed content: the single source of truth
├─ hooks/               useBooted (external-store subscription)
└─ lib/                 cn, mailto, clipboard, toast bus, scroll
```

## Deploy

The site deploys on **Vercel** with zero configuration. Push to `main` for a production deploy; pull requests get preview URLs.
To use a custom domain, set `NEXT_PUBLIC_SITE_URL` (see `.env.example`). Otherwise the canonical URL falls back to the Vercel production domain.

## License

MIT for the code. The written content, project descriptions and screenshots © Praduman Prajapati.

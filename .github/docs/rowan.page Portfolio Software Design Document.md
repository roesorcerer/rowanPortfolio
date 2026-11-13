# rowan.page Portfolio: Software Design Document

Nov 3, 2026 · @Rowan

## 1. Introduction

The recommended path is to keep the working React, Express and MongoDB system and change how public pages reach readers: prerendered HTML first, with a story-driven dungeon crawl as the site's main experience. Current-state facts come from the `production` branch at commit `b216560` (2026-09-11). Everything marked Target is a proposal awaiting Rowan's approval.

### 1.1 Purpose

This document describes the architecture, data, components and interfaces of the rowan.page portfolio, and is the primary reference for writing its code. Its readers are Rowan as sole developer, any coding agent working in the repository, and engineers reviewing the project as a work sample.

### 1.2 Scope

The system is a personal portfolio site with a private content manager, built to support a fullstack engineering job search.

| Goal | Objective | Benefit |
| --- | --- | --- |
| Be found and previewed | Every public URL returns complete HTML, metadata and a link preview | Shared links and search results show real content |
| Prove engineering ability | Stack, role and outcomes are one click from any page; the repository reads as professional work | The site itself is evidence of skill |
| Show design identity | A playable first-person RPG tells Rowan's journey and proves game development and gamification skill | The site stands apart from template portfolios |
| Stay easy to run | Publishing stays in the admin CMS, with one maintainer and low hosting cost | Content changes need no code change |

In scope: public pages, admin CMS, REST API, data store, build and deployment. Out of scope: visitor accounts, a blog, payments, translations, and The Archive mobile app itself.

### 1.3 Overview

The document follows the [IEEE 1016-based template](https://wildart.github.io/MISG5020/standards/SDD_Template.pdf) section for section. From [Atlassian's guide](https://www.atlassian.com/work-management/knowledge-sharing/documentation/software-design-document) it adds API interface design (5.1), assumptions and dependencies (8.3). From the [METU Carpool SDD](https://senior.ceng.metu.edu.tr/2014/such/documents/SDD.pdf) it borrows use-level, data, sequence and state views as diagrams. No SRS exists, so section 7 states the requirements as well as tracing them.

### 1.4 Reference material

- [Software Design Document: tips and best practices](https://www.atlassian.com/work-management/knowledge-sharing/documentation/software-design-document), Atlassian
- [SDD template summarized from IEEE Std 1016](https://wildart.github.io/MISG5020/standards/SDD_Template.pdf)
- [Carpool System SDD](https://senior.ceng.metu.edu.tr/2014/such/documents/SDD.pdf), METU Group SUCH
- [rowanPortfolio repository](https://github.com/roesorcerer/rowanPortfolio), `production` branch
- [How the Core Web Vitals thresholds were defined](https://web.dev/articles/defining-core-web-vitals-thresholds), web.dev
- [What's New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/), W3C
- [JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) and [dynamic rendering as a workaround](https://developers.google.com/search/docs/crawling-indexing/javascript/dynamic-rendering), Google Search Central
- [OWASP Top 10:2025](https://top10.owasp.org/2025/)

### 1.5 Definitions and acronyms

| Term | Meaning |
| --- | --- |
| Dungeon frame | The game's frame: a dungeon whose floors are chapters of Rowan's life, working title Late Game |
| Case study | The long-form project record shown at `/projects/:slug` |
| CLS | Cumulative Layout Shift, a Core Web Vital for visual stability |
| CMS | Content management system; here, the `/admin` dashboard |
| CSP | Content Security Policy, a header limiting what a page may load |
| Display group | The set a project is ordered within: `featured`, or its `projectType` |
| INP | Interaction to Next Paint, a Core Web Vital for responsiveness |
| JSON-LD | Structured data embedded in a page for search engines |
| JWT | JSON Web Token, the signed admin session credential |
| LCP | Largest Contentful Paint, a Core Web Vital for load speed |
| OG | Open Graph, the metadata that builds link previews |
| Poppy | A guide character from The Archive; not used unless reinstated (8.6) |
| Prerender | Generating a page's final HTML at build time |
| SDD / SRS | Software Design Document / Software Requirements Specification |
| Slug | The frozen URL segment for a project, safe to print on a resume |
| SPA | Single-page application, rendered in the browser by JavaScript |
| WCAG | Web Content Accessibility Guidelines |

## 2. System overview

rowan.page is live and its engineering core is solid, but public content only exists after JavaScript runs and the redesign has not started. Those two facts set the priorities in this design.

### 2.1 Functionality and users

Public visitors browse projects by tab, read case studies at stable permalinks, view a printable resume and send a message. The admin signs in to manage projects, reorder them, read messages and review analytics.

| User | Need | Main path |
| --- | --- | --- |
| Recruiter | Fit, stack and contact details fast | Shared link, then home, resume, contact |
| Hiring engineer | Evidence of judgment and quality | Case study, then GitHub repository |
| Research peer | Papers and study context | Research tab, then paper links |
| Rowan (admin) | Publish and measure with little effort | `/admin` |
| Crawlers and preview bots | Readable HTML and metadata | Any public URL, `sitemap.xml` |

### 2.2 Current system

The frontend is a React 18, TypeScript and Vite SPA on Vercel. The backend is Express with Mongoose, in a Docker container on Fly.io, backed by MongoDB. Vercel rewrites `/api/*` to Fly, so the browser sees one origin.

These parts are strong and stay as they are:

- **Typed contract:** `shared/contracts.d.ts`, with compile-time parity checks against the Zod validators
- **Layered backend:** routes, middleware, controllers, operations, stores and models are cleanly separated
- **Authentication basics:** Argon2id hashing, identical errors for unknown email and wrong password, password excluded from queries
- **Publishing safety:** drafts fail closed, slugs stay frozen on rename, and `order` is scoped to a display group
- **Contact reliability:** a message is saved before email is attempted, so a mail outage loses nothing
- **Delivery:** GitHub Actions gates deployment on type checks, tests and builds; all 125 frontend tests across 14 files pass

The admin refactor is further along than earlier notes suggest. Search, filters, denser rows, grouped sections, drag reorder, the `status` field, `category` as tags and the single `featured` boolean have all shipped. The contact form also shipped, using the backend and SMTP. `ProjectForm.tsx` remains large at 479 lines.

### 2.3 Audit findings

These findings come from reading the code, a production build, and an axe accessibility scan with stubbed seed data. The live site was unreachable from the audit environment, so real-user speed is not yet measured.

| # | Finding | Evidence | Addressed in |
| --- | --- | --- | --- |
| F1 | Public HTML has no content | `index.html` holds an empty `#root`, the title "Rowan Portfolio", and no description, OG or canonical tags | 3.1, 5.2 |
| F2 | Unknown URLs render a blank page | `App.tsx` has no catch-all route; confirmed in a browser | 5.2, 6.3 |
| F3 | Missing projects are soft 404s | The not-found message renders on a page served as 200 | 5.2 |
| F4 | Public write endpoints have no rate limit | No limiter in `backend/src` or its dependencies, covering login, register, contact and analytics. **Login and contact fixed in #24**; analytics intake still open | 5.5, 8.2 |
| F5 | Registration is open to anyone | `POST /api/auth/register` is public, though the site has one admin; new accounts get no admin rights. **Fixed in #24**: the route is removed | 5.4 |
| F6 | Long-lived token sits in `localStorage` | 7-day JWT, with no CSP on the site to limit script injection. **Fixed in #32**: the session is an `HttpOnly` cookie; the API moves to `api.rowan.page` so the cookie is first-party | 5.4, 8.2 |
| F7 | Visitors download the admin | One 440 KB JavaScript file (138 KB gzipped), with no code splitting | 3.2 |
| F8 | List responses carry full case studies | `GET /api/projects` maps every field, including `caseStudy`. **Fixed in #30**: the list returns `ProjectSummary` | 4.1, 5.1 |
| F9 | Home page has 25 axe failures | 18 contrast, 3 nested interactive, 3 label mismatch, 1 target size | 6.4 |
| F10 | Text colors miss AA | `muted` is 3.43:1 and `faint` 2.02:1 on `paper`; body text needs 4.5:1 | 6.4 |
| F11 | Motion cannot be paused | Looping hero video and a word change every 2.2 s; no reduced-motion handling | 6.4 |
| F12 | Fonts do not match the CSS | Google Fonts loads Cormorant Garamond, while the body stack names Perpetua and Palatino, which are not served | 6.1 |
| F13 | Images are unoptimized | 12.7 MB in `public`, nearly all PNG and JPG, and many duplicated in `src/assets`; one image exceeds 1 MB | 5.3 |
| F14 | Analytics are spoofable and kept forever | `/pageview` has no validator, a non-string `path` raises a 500, and no retention limit or notice exists. **Validator fixed in #29; 13-month retention and bot filtering in #31**; the notice remains | 4.1, 5.6 |
| F15 | Headshot is a link to admin login | `Header.tsx` wraps the public photo in a link to `/admin/login` | 6.3 |
| F16 | Repository undersells the work | README is an unfilled template; root `package.json` is a leftover template; `.env.example` is missing though startup errors cite it; `development` last moved 2026-04-17 | 8.5 |
| F17 | Dependencies and claims have drifted | Redux Toolkit and Inter are installed but never imported; About lists PostgreSQL, not the MongoDB this site runs on | 8.5 |

### 2.4 Target system

The target keeps the stack and changes three things. Public pages become prerendered HTML served from the CDN. The API narrows to admin, contact and analytics work. The home page becomes a one-screen summary with three projects and contact links, and it invites visitors into a first-person dungeon crawl, so every key fact is visible without playing.

## 3. System architecture

The target separates reading from writing: public pages are static files, and the API serves only actions that must run on a server. This removes the API as a dependency for reading the portfolio.

### 3.1 Architectural design

&#91;embedded content: Figure 1. Target architecture\]

Public readers never wait on Fly.io or MongoDB. If the API is down, every public page still loads, and only contact, analytics and admin stop working.

| Subsystem | Responsibility | Status |
| --- | --- | --- |
| Public site | Prerendered pages, hydrated with React for interaction | Target; SPA today |
| Game layer | The dungeon crawl: town menu, maze, encounters, saves | New |
| Admin CMS | Project, message and analytics management | Exists; move to a lazy bundle |
| REST API | Auth, content, contact, analytics | Exists; harden |
| Build pipeline | Render routes, generate sitemap, optimize images | New step in the existing Vercel build |
| Data store | MongoDB collections listed in section 4 | Exists |

### 3.2 Decomposition description

This is a functional decomposition, because the code is organized as modules and functions rather than class hierarchies.

| Frontend module | Location | Responsibility |
| --- | --- | --- |
| Route shell | `src/App.tsx` | Routes, including the new catch-all not-found route |
| Public pages | `src/pages/` (new) | Home, case study, resume, not found, privacy |
| Project display | `src/components/project/` | Cards, facts, links, media |
| Page metadata | `src/lib/seo.ts` (new) | Title, description, canonical, OG, JSON-LD per route |
| API client | `src/api/` | Typed requests and one `ApiError` type |
| Data hooks | `src/hooks/` | TanStack Query reads and mutations |
| Analytics | `src/analytics/` | Adapter-based event tracking; skips admin paths |
| Game layer | `src/features/game/` (new) | Crawl engine, floor data, encounters, save store |
| Admin | `src/components/admin/` | CMS, loaded with `React.lazy` so visitors never download it |
| Prerender script | `frontend/scripts/prerender.tsx` (new) | Build-time page generation (5.2) |

The backend keeps its one-way dependency chain: routes call middleware and controllers, controllers call operations and reports, those call stores, and stores call Mongoose models. `shared/contracts.d.ts` defines every shape that crosses HTTP.

&#91;embedded content: Figure 2. Publishing sequence\]

Step 3 fails safely. The API retries nothing and the save still stands, so a failed build only delays publication until the next deploy.

### 3.3 Design rationale

Prerendering wins because it fixes findings F1 and F3 while keeping the existing components and CMS. Google [recommends server-side or pre-rendering](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) since not all bots run JavaScript, and calls dynamic rendering [a workaround](https://developers.google.com/search/docs/crawling-indexing/javascript/dynamic-rendering).

| Option | Content in HTML | Migration effort | Effect on admin | Verdict |
| --- | --- | --- | --- | --- |
| Stay a pure SPA | No | None | None | Rejected: F1 remains |
| Vite with prerender step | Yes | Small; adds a build script | None | Chosen |
| Next.js on Vercel | Yes | Medium; routing and data fetching rewritten | Must be ported | Viable fallback if per-page revalidation is needed |
| Astro with islands | Yes, with the least JavaScript | Large; public pages restructured | Separate React app | Rejected: too much rewrite for the gain |

| ID | Decision | Reason | Trade-off |
| --- | --- | --- | --- |
| D1 | Prerender public routes at build | Fast, crawlable, resilient | Publishing waits for a build |
| D2 | Keep Express and MongoDB | Working, tested, and a resume item | Two hosts to maintain |
| D3 | Rebuild through a Vercel deploy hook | Admin publishing stays code-free | Needs a new secret and a failure path |
| D4 | Store the admin session in an `HttpOnly` cookie | Injected scripts cannot read it | Requires CSRF protection and auth changes |
| D5 | Remove public registration | One admin needs no sign-up route | `npm run admin` becomes the only way to add an admin |
| D6 | Split admin into a lazy bundle | Visitors stop paying for code they never run | One more loading state |
| D7 | Lead with a one-screen landing page, then invite visitors into the game | The game is the portfolio's strongest proof, but no fact may depend on playing it | Two presentations of the same content to keep in step |
| D8 | Keep game saves in `localStorage` | No accounts, no personal data, no server cost | Progress stays on one device |

## 4. Data design

The data model is already sound, so the target adds only a list projection, one metadata field, retention limits and a browser-side progress record. Zod validators define the project shape, and `limits.ts` holds every length limit for both Zod and Mongoose.

### 4.1 Data description

&#91;embedded content: Figure 3. Data model\]

Project content is stored as one document because it is always read and edited together. Dashed lines are soft references: nothing enforces them, so deleting a project leaves its analytics rows intact.

Project images and other static files live in `frontend/public/assets`, and documents store only their paths. The 512-character limit on `src` blocks inline image data on purpose.

| Target change | Detail | Fixes |
| --- | --- | --- |
| Add a `ProjectSummary` list shape | `GET /api/projects` omits `caseStudy`; case studies load by slug or at build time | F8 |
| Add `metaDescription` | Optional, 160 characters at most; falls back to a trimmed `description` | F1 |
| Set analytics retention | TTL index on `PageView` and `Event` `createdAt` at 396 days (13 months, so a month compares with the same month a year earlier); done in #31 | F14 |
| Replace `userAgent` with `device` | Store `mobile` or `desktop` at write time, then stop keeping the raw string | F14 |
| Allow message deletion | New admin delete action for contact submissions | F14 |
| Add `GameSave` | Versioned JSON in `localStorage`, read and written in `try/catch` | D8 |

```json
{
  "version": 1,
  "floor": 2,
  "x": 3,
  "y": 5,
  "dir": 1,
  "cleared": ["0a", "1b"],
  "visited": ["2:3,5", "2:3,6"]
}
```

Floor layouts live in code. Each published project gains an optional `journey` field, `{ floor, cell, encounter }`, that places it in the dungeon. A project with no placement still appears on the landing page.

### 4.2 Data dictionary

| Entity | Attribute | Type | Rules and meaning |
| --- | --- | --- | --- |
| GameSave | cleared | string\[\] | Encounter ids already finished |
| GameSave | floor, x, y, dir | number | Where the party stands, and which way it faces |
| GameSave | version | number | Schema version; an unknown value resets the record |
| GameSave | visited | string\[\] | Cells walked, used to draw the automap |
| CaseStudy | lessons, outcomes | string\[\] | 20 items at most, 500 characters each |
| CaseStudy | problem, role, summary | string | Optional; 4,000 characters at most |
| CaseStudySection | body | string | Required; 8,000 characters at most |
| CaseStudySection | heading | string | Required; 160 characters at most |
| CaseStudySection | media | Media\[\] | 12 items at most |
| Collaborator | name, socialLink | string | Required; `socialLink` must be a valid URL |
| Collaborator | role, socialLabel | string | Optional |
| ContactSubmission | email | string | Required, lowercased, valid format |
| ContactSubmission | message | string | Required; 10 to 5,000 characters |
| ContactSubmission | name, subject | string | Name required, 100 at most; subject optional, 200 at most |
| Detail | key | string | Required, lowercase, 48 at most, unique within a project |
| Detail | kind | enum | `text`, `url` or `date` |
| Detail | label, value | string | Required; 60 and 500 characters at most |
| Event | eventType | string | Required, 64 at most; `project_view` or `link_click` |
| Event | linkType, projectId, projectTitle, projectType | string | Optional context, length-limited |
| Link | kind | string | Required, lowercase, 32 at most; open set |
| Link | label, url | string | URL required and validated; label 60 at most |
| Media | alt, caption, poster | string | Optional today; target requires `alt` on images |
| Media | src | string | Required path or URL; 512 at most |
| Media | type | enum | `image` or `video` |
| PageView | path | string | Required, 512 at most; `/admin` paths are ignored |
| PageView | referrer | string | Optional, 512 at most |
| Project | category | string\[\] | Tags, de-duplicated ignoring case |
| Project | description | string | Required; 4,000 at most |
| Project | featured | boolean | Promotion flag; default false |
| Project | image | string | Required card image path |
| Project | order | number | Position inside its display group |
| Project | projectType | enum | `product`, `research`, `practice`, `gameDev` or `art` |
| Project | researchStatus | enum | Optional; `published` or `in-revision` |
| Project | slug | string | Unique, 120 at most, frozen on rename; `all` and `reorder` are reserved |
| Project | status | enum | `draft` or `published`; default `draft` |
| Project | title | string | Required; 200 at most |
| Admin | email | string | Required, unique, lowercased |
| Admin | password | string | Argon2id hash; excluded from queries by default |
| Admin | name | string | Required; 100 at most |

## 5. Component design

The components below are new or change meaningfully. Components not listed here keep their current design. Pseudocode is given where the logic is not obvious, as the template asks.

### 5.1 REST API interface

All routes sit under `/api` and exchange JSON in one envelope: `{ success, data?, error? }`.

| Method and path | Access | Purpose | Target change |
| --- | --- | --- | --- |
| GET `/health` | Public | Liveness | Add a database ping; wire it to a Fly health check |
| POST `/auth/login` | Public | Start an admin session | Set a cookie; rate limit |
| POST `/auth/register` | Public | Create an account | Removed (D5, #24) |
| GET `/auth/me` | Signed in | Current user | Used by the admin route guard |
| POST `/auth/logout` | Public | End the session | Clears the cookie (#32); public so an expired session can still sign out |
| GET `/projects` | Public | Published list | Returns `ProjectSummary` (#30) |
| GET `/projects/:idOrSlug` | Public | One published project | Cache-Control headers |
| GET `/projects/all` | Admin | List including drafts | None |
| GET `/projects/all/:idOrSlug` | Admin | Draft preview | None |
| POST `/projects` | Admin | Create | Trigger deploy if published |
| PUT `/projects/reorder` | Admin | Rewrite group order | Trigger deploy |
| PUT `/projects/:id` | Admin | Partial update | Trigger deploy if the public page changed |
| DELETE `/projects/:id` | Admin | Delete | Trigger deploy if it was published |
| POST `/contact` | Public | Send a message | Rate limit |
| GET `/contact/submissions` | Admin | Latest 200 messages | None |
| DELETE `/contact/submissions/:id` | Admin | Delete a message | New |
| POST `/analytics/pageview` | Public | Record a page view | Validator added (#29); rate limit |
| POST `/analytics/event` | Public | Record an interaction | Rate limit |
| GET `/analytics/summary` | Admin | Traffic report | None |
| GET `/analytics/engagement` | Admin | Project engagement report | None |

| Status | Meaning | Client behavior |
| --- | --- | --- |
| 400 | Validation failed; `error` names the field | Show the message beside the form |
| 401 / 403 | Not signed in / not an admin | Return to `/admin/login` |
| 404 | Not found, or a draft requested publicly | Not-found state |
| 413 | Body over 512 KB | Explain that images belong in `public/assets` |
| 429 | Rate limit reached (new) | Ask the visitor to wait, and show the email address |
| 5xx | Server fault; details hidden in production | Calm error text; the page stays usable |

### 5.2 Prerender step

This step runs after `vite build`. It takes the built app and the published projects, and it outputs one HTML file per public route plus `sitemap.xml`, `robots.txt` and `404.html`. It depends on the API being reachable.

```text
projects = fetch published summaries
FAIL BUILD if the request fails or projects is empty   // the previous release stays live

routes = "/", "/resume", "/privacy" + "/projects/<slug>" for each project
for each route:
    data = fetch what the route needs
    html = renderToString(App at route, with data preloaded)
    head = seoFor(route, data)   // title, description, canonical, OG, JSON-LD
    write build/<route>/index.html

write sitemap.xml using each project's updatedAt
write robots.txt, disallowing /admin
write 404.html
```

Three related changes make this work. `main.tsx` moves to `hydrateRoot`. Components read `localStorage` only after mounting, so server and client markup match. The catch-all rewrite in `vercel.json` narrows to `/admin/*`, so a missing URL returns a real 404 status instead of the app shell, which resolves F2 and F3.

`vercel.json` also gains site-wide headers: Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options and Referrer-Policy. The CSP should start in report-only mode, since JSON-LD and hydration data need a nonce-free approach such as hashes.

### 5.3 Image and media pipeline

At build time, a `sharp` script reads `public/assets`. It writes AVIF and WebP versions at 480, 960 and 1600 px wide, plus a manifest keyed by original path, so stored project paths stay valid. An `<Image>` component reads the manifest and renders `srcset`, `width` and `height`, which prevents layout shift.

The largest image on each page loads eagerly with `fetchpriority="high"`, and all others load lazily. The hero video moves to the site's own origin with a poster image, and the duplicate files in `src/assets` go away.

### 5.4 Authentication

Only one person ever signs in, so the design favors a small attack surface over features.

```text
POST /auth/login:
    reject with 429 if this client exceeded the login limit
    find admin by email, including password hash
    if no admin, or Argon2 verify fails:
        return 401 "Invalid email or password"
    set cookie session=<JWT>, HttpOnly, Secure, SameSite=Strict, 12 h expiry
    return the admin, without the hash

requireAuth: read the cookie instead of the Authorization header
```

`SameSite=Strict` and JSON-only writes cover CSRF. They depend on the API being same-site with the frontend: the site is `rowan.page` and the API is `api.rowan.page`, a Fly certificate on a subdomain. On `rowan-portfolio-api.fly.dev` the cookie would be third-party, because `fly.dev` is a public suffix, and Safari would refuse it. Routing admin calls through Vercel's `/api` rewrite would also make the cookie first-party, but every admin request would then arrive from a Vercel IP and share one login rate limit bucket. **Done in #32.** Session length is `JWT_EXPIRES_IN`, and the cookie expires with the token. Rate limiting needs `trust proxy` set correctly, and the header carrying the visitor's real IP must be confirmed through both the Vercel rewrite and Fly's proxy (see 8.6). `server.ts` used to reset the admin password on every boot when `ADMIN_PASSWORD` was set. **Fixed in #28**: the account changes only through `npm run admin`.

### 5.5 Contact

The persist-then-mail design stays. The new parts are a rate limit, proposed at 5 messages per hour per client, and a quieter honeypot.

```text
POST /contact:
    reject with 429 if over the limit
    validate fields
    if honeypot is filled: return 202 and store nothing
    save the submission
    try to send email
    return 202, with wording that depends on whether email succeeded
```

### 5.6 Analytics

The design stays first-party and cookie-free. `/pageview` gains a Zod validator, public routes gain a rate limit, and writes store `device` rather than the raw user agent. A new `web_vital` event reports LCP, INP and CLS from real visits, which fills the measurement gap noted in 2.3. A short `/privacy` page states what is collected and for how long.

### 5.7 Deploy trigger

A new `site-publisher` service in the backend calls the Vercel deploy hook after a public change. It waits for a quiet period, proposed at 2 minutes, so a burst of edits causes one build.

```text
after a project write:
    if the project is, or was, published:
        restart a 2-minute timer
on timer end:
    POST DEPLOY_HOOK_URL
    record time and result for the admin status line
```

The timer lives in memory on one Fly machine. A restart can lose a pending trigger, so the admin dashboard shows the last publish time and a manual "Rebuild site" button.

### 5.8 Game layer

Behind the landing page sits a first-person dungeon crawl that plays like Wizardry 1, the 1981 RPG: a [text-led screen with a small line-drawn view](https://en.wikipedia.org/wiki/Wizardry:_Proving_Grounds_of_the_Mad_Overlord), a town reached by menu, and floors of grid mazes below it. It borrows the genre's conventions only, with no Wizardry names, art or code. The engine is plain state plus SVG lines, so it stays light by default. Art, when added, loads per floor through the image pipeline in 5.3.

Play begins with character select, because the visitor's role decides what matters. The classes are Hiring Manager, Software Developer, Researcher, Game Developer and Traveler.

| What changes by class | Example |
| --- | --- |
| Quest log | Suggests where to go first, with a jump to that floor |
| Treasure | Adds a note written for that role, such as stack for a developer or methods for a researcher |
| Guild Hall | Shows a summary pitched to that role |
| Starting floor | Offers a jump to the floor that role cares about most |

The choice lives in `GameSave.role`, and camp can change it. Role notes become an optional `audienceNotes` map on each project, edited in the admin form. A `role_selected` analytics event shows who actually visits. The story itself never changes by class, only what is added around it.

Wayfinding departs from Wizardry on purpose, because Rowan got lost in the first version and a visitor will not draw a map. Every maze screen shows three things:

- **Floor map:** the whole floor from the start, with the player's position and facing, and a marker on everything left to see
- **Floor checklist:** each chapter by name, ticked when seen, with a clear "cleared" message
- **Next command:** N walks straight to the next chapter in story order, then the stairs, then the next floor

A visitor can finish the whole game with N alone, without ever turning in a corridor. The stairs say what they do: down is the next chapter, up is the earlier one. Floor B8 can fill from any project flagged as in progress, so the ending stays current without code changes.

| Game part | Behavior | Portfolio meaning |
| --- | --- | --- |
| Town menu | Text menu: Guild Hall, Smithy, Library, Inn, Edge of Town | About, skills, publications, contact, start of the journey |
| Maze | Eight small grid floors; forward, left, right, turn, camp | The timeline, oldest floor first |
| Encounter | The view gives way to a picture; Fight steps through events, Run leaves | One project or milestone, told as what happened |
| Treasure | Shown after victory | The result, plus case study and source links |
| Camp | Jump to any floor or change class | Quick travel for hurried readers |
| Party roster | Rowan's class and level change by floor; the visitor joins as row 2 | The career path itself; no fake skill numbers |
| Open slot | Row 2 stays open until the visitor picks a class | The hiring invitation |
| The Workshop | B8 shows current builds, then The Open Door ends the game | What Rowan is building now, that Rowan is looking for work, and how to make contact |

```text
on forward:
    next = cell ahead of the party
    if next is a wall: show "OUCH!" and stay
    move to next, and mark it visited
    if next holds an uncleared encounter: open it

on fight:
    if rounds remain: show the next round
    else: mark cleared, show treasure and links

after any change: save to localStorage, inside try/catch
```

Nothing is locked: stairs always work, Run always works, and camp can jump floors. A "Skip game" control stays on every game screen, and it returns to the landing page. Each encounter links to its `/projects/:slug` page, which stays prerendered, so crawlers and link previews never need the game.

Commands are real buttons with keyboard shortcuts and arrow keys. Story text sits in an `aria-live` region, and the corridor has a text alternative. Production also needs focus management on screen changes, which the prototype only handles roughly.

## 6. Human interface design

The interface must serve two readers in one page: a recruiter who wants facts in seconds, and a curious visitor who wants to explore. A landing page answers the recruiter in one screen, and the game is the invitation. Visual direction needs mockup approval before any code, so this section fixes structure and behavior, not final styling.

### 6.1 Overview of user interface

The site should look and work like a story-based RPG in the style of Wizardry 1, showing where Rowan has been and where Rowan is going. Phosphor green on black keeps the stated taste for greens and blacks. Game screens replace the earlier scrolling layout, and the structure below keeps every route.

&#91;embedded content: Figure 4. Site map\]

The redesign also settles the visual foundations, starting from the prototype's terminal look. Colors move into one token set, replacing today's separate Tailwind palette and shadcn variables. Type uses one or two self-hosted WOFF2 families, which resolves F12.

The landing page is one column of labeled sections: introduction, At a glance, Work, The long way down and Contact. Each section has a solid title bar and is linked from the top navigation, so a reader can scan to what they need.

The two themes are two art styles built on one token set. Dark mode is a phosphor CRT, with a soft glow, faint scanlines and a torchlit grid that follows the pointer. Light mode is the graph paper players mapped dungeons on, with dark ink and a red pencil accent. The site follows the visitor's system setting on first load, a header button switches themes, and the choice is remembered in `localStorage`. Body text uses a readable monospace at 16 to 18 px with a line length near 60 characters, and the pixel face is kept for headings and commands.

Layouts adapt at 860 px and 640 px, and were rendered at 360, 768 and 1280 px wide with no horizontal scrolling. On narrow screens the game view and map sit side by side, and the Next command spans the full width.

The page spends its boldness in two places. The hero is an endless corridor drawn on a canvas, whose vanishing point follows the pointer. The long way down shows eight floors as stairs, and a pixel character walks to whichever floor is chosen, with a summary and a jump into that floor.

The game adds a title card on each first floor visit, stepped corridor motion, pixel sprites for encounters and project cards, a line-drawn Coleraine scene and optional sound, off by default. All art is generated from code, so it adds no image weight. `prefers-reduced-motion` freezes the corridor and removes the rest of the motion.

The Work section keeps the current site's tabs: Featured, Product, Research, Practice, Game Dev and Art. It replaces a separate skills list, because [skills are best shown through projects](https://scrimba.com/articles/web-developer-portfolio-mistakes/), not ratings. Each skill backed by at least two projects is a filter, so choosing it shows the work that used it. Skills with no public project sit under Also worked with.

The Contact section keeps the existing form, backend and spam protection, with email beside it as the direct option.

### 6.2 Screen images

**Current site.** These were captured from a local production build with stubbed seed data. The hero video and Google Fonts were blocked in that environment, so the live site looks richer than the first image shows.

&#91;image: Current home page first screen\]

&#91;image: Current case study page\]

&#91;image: Current admin project list\]

**Target.** The [playable prototype](https://claude.ai/artifact/T2EFZuzgC1yCZJKVwhVHYr) replaces the earlier wireframe and is the design under review. This figure records its layout.

&#91;embedded content: Figure 5. Target game screen layout\]

The rotating "I'm a..." heading goes away. The landing page names Rowan and states the role in its first lines.

### 6.3 Screen objects and actions

| Screen | Object | Action | Feedback or result |
| --- | --- | --- | --- |
| Every screen | Skip the game | Select | Returns to the landing page |
| Title | Play my story, project and contact links | Select, or P to play | Goes to character select, or opens the link |
| Town | Guild, Smithy, Library, Inn, Edge of Town | Select or first letter | Shows that place; Edge of Town enters the maze |
| Maze | Forward, Left, Right, Turn, Camp | Select, letter key or arrows | Redraws the corridor; a wall shows "OUCH!" |
| Maze | Stairs | Select or D, U | Moves between floors; the first visit shows the chapter text |
| Encounter | Fight, Run | Select or F, R | Steps through events, or backs away with nothing lost |
| Victory | Continue, links | Select or C | Returns to the maze; links open the case study or source |
| Camp | Return, Town, floor numbers | Select or key | Shows the automap; jumps floors |
| Inn | Contact links | Select | Opens email, GitHub or LinkedIn; production uses the existing contact form |
| Case study | Copy link | Select | Confirms in a live region |
| Case study | Media carousel | Previous, next | Moves by button or keyboard; never auto-advances |
| Resume | Page | Print | Prints or saves as PDF, with URLs spelled out |
| Not found | Browse projects | Select | Returns home; served with a 404 status |
| Admin list | Row | Search, filter, drag, edit, delete | Optimistic reorder with rollback on failure |
| Admin form | Journey, Status | Place in dungeon; draft or publish | Shows when the public site last rebuilt |

### 6.4 Accessibility and responsive rules

The target is WCAG 2.2 AA, applied to the public site and admin alike.

| Rule | Design requirement | Fixes |
| --- | --- | --- |
| Contrast | Text at 4.5:1 or better; `muted` moves to `#6B6A64` (5.16:1 on `paper`); `faint` becomes decoration only; `accent` is not used for small text | F9, F10 |
| Motion | Respect `prefers-reduced-motion`; give the hero video a pause control; stop rotating text | F11 |
| Keyboard | Every action works by keyboard; add a skip link; visible focus never hidden by sticky UI | 2.4.11 |
| Targets | Pointer targets at least 24 by 24 CSS px | F9, 2.5.8 |
| Dragging | Admin reorder keeps a non-drag alternative | 2.5.7 |
| Structure | One `h1` per page, ordered headings, one `main`, no links nested inside links | F9 |
| Images | Meaningful `alt` required at save time; decorative images use empty `alt` | Media rules |
| Sign-in | Allow password managers and paste | 3.3.8 |
| Layout | Mobile first; no horizontal scrolling at 320 px wide; text holds up at 200% zoom | Responsive |
| Help | Contact stays in the same place on every page | 3.2.6 |

## 7. Requirements matrix

Of 22 requirements, 5 are done, 6 are partial and 11 are planned; the Status column is editable, so this table can double as the progress tracker. No SRS exists, so requirements are defined here, drawn from the goals in 1.2 and the findings in 2.3.

| ID | Requirement | Components | Data | Status |
| --- | --- | --- | --- | --- |
| FR1 | Visitors browse projects by category | `Main`, `ProjectCard`, `GET /projects` | Project | Done |
| FR2 | Visitors read a case study at a permanent URL | `ProjectPage`, `CaseStudy` | Project.slug, CaseStudy | Done |
| FR3 | Visitors view and print the resume | `Resume` | None | Done |
| FR4 | Visitors send a message that is never lost and cannot be abused | `ContactSection`, 5.5 | ContactSubmission | Partial |
| FR5 | Only Rowan can sign in and change content | 5.4, `requireAuth`, `RequireAdmin` | User | Partial |
| FR6 | Admin creates, drafts, publishes, reorders and deletes projects | `ProjectsTab`, `ProjectForm`, projects store | Project | Done |
| FR7 | Admin reads messages and analytics | `MessagesTab`, `AnalyticsTab`, analytics report | ContactSubmission, PageView, Event | Done |
| FR8 | Publishing updates the public site without code | 5.2, 5.7 | Project.status | Planned |
| FR9 | Every public URL returns full HTML and metadata | 5.2, `seo.ts` | Project.metaDescription | Planned |
| FR10 | Unknown URLs return a real 404 page | 5.2, not-found page | None | Planned |
| FR11 | Home leads with a one-screen summary, then a playable dungeon crawl | 5.8 | Project | Planned |
| FR12 | Visitors pick a role, and encounters adapt their notes and links to it | 5.8 | GameSave | Planned |
| FR13 | Visitors can skip, resume and jump floors; nothing is gated | 5.8 | GameSave | Planned |
| FR14 | A privacy page explains data handling | `/privacy` | None | Planned |
| NFR1 | Core Web Vitals rate good at the 75th percentile | 5.2, 5.3, 5.6 | Event | Planned |
| NFR2 | Public pages stay under the JavaScript budget | Lazy admin and game bundles | None | Planned |
| NFR3 | Site meets WCAG 2.2 AA | 6.4 | Media.alt | Partial |
| NFR4 | Design addresses OWASP Top 10:2025 | 5.4, 5.5, 8.2 | User | Partial |
| NFR5 | Public pages load while the API is down | 3.1, 5.2 | None | Planned |
| NFR6 | Every deploy passes automated checks | GitHub Actions | None | Partial |
| NFR7 | Repository reads as professional work | README, cleanup in 8.5 | None | Planned |
| NFR8 | Analytics use no cookies and data has limits | 5.6 | PageView, Event | Partial |

## 8. Appendices

### 8.1 Website quality targets

Each best practice below has a measurable target and an automated check where possible. The page-weight, resilience and privacy targets are proposals in this design; the others come from the linked standards.

| Area | Target | How it is checked | Today |
| --- | --- | --- | --- |
| Speed | [LCP 2.5 s or less, INP 200 ms or less, CLS 0.1 or less](https://web.dev/articles/defining-core-web-vitals-thresholds), at the 75th percentile | `web_vital` events; Lighthouse CI on pull requests | Not yet measured |
| Page weight | Public JavaScript at or under 100 KB gzipped per page | Bundle budget in CI | 138 KB, all in one file |
| Accessibility | [WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/) AA | axe in Playwright, plus manual keyboard and screen reader passes, since scanners catch only part of the issues | 25 failures on home |
| Search | Unique title and description, one canonical, real links, sitemap, per [Google's guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) | Script asserts tags in the built HTML | One site-wide title in HTML; project titles set by JavaScript |
| Sharing | OG title, description and image on every public page; `Person` JSON-LD on home | Built-HTML assertion | Missing |
| Security | [OWASP Top 10:2025](https://top10.owasp.org/2025/) coverage (8.2) | Route tests, header scan, dependency audit | Partial |
| Resilience | Public pages load with the API off | Playwright against the static build | Home shows an error; project lists fail |
| Privacy | No cookies for visitors; 13-month retention | TTL index test | 13 months (#31) |

### 8.2 Security review

| OWASP 2025 risk | Current state | Design action |
| --- | --- | --- |
| A01 Broken Access Control | All writes require admin; drafts fail closed | Keep route tests; add `/auth/register` removal test |
| A02 Security Misconfiguration | API uses Helmet and scoped CORS; the site has no CSP | Add site headers (5.2) |
| A03 Software Supply Chain Failures | `flyctl-actions@master` and an unpinned Vercel CLI in deploys; [Node 20 is end-of-life](https://nodejs.org/en/about/eol) in Docker and CI | Pin both, move to the current LTS, enable Dependabot, remove unused packages |
| A05 Injection | Zod on inputs, React escaping, escaped email HTML | Validate `/pageview` |
| A07 Authentication Failures | Argon2id, generic login errors, but no limiter and a 7-day token | 5.4 |
| A09 Security Logging and Alerting Failures | Morgan logs only; no alerts | Alert on repeated 5xx and failed deploys |
| A10 Mishandling of Exceptional Conditions | Central error handler; bad `/pageview` input returns 400 (#29) | Add a Fly health check |

A04, A06 and A08 raise no project-specific action beyond the items above, this design and the existing CI gates.

### 8.3 Assumptions and dependencies

| Item | Assumption or dependency |
| --- | --- |
| Maintainer | One developer and one admin, so simple operations win |
| Traffic | Low, so one 256 MB Fly machine stays adequate |
| Vercel | Hosts static files, rewrites and deploy hooks; plan limits still need checking |
| Fly.io | Runs the API in `ord`, with one machine always on |
| MongoDB | Hosted on Atlas per project notes; the repository only requires `MONGODB_URI` |
| SMTP | A configured provider; without it, messages are still saved |
| Browsers | Current evergreen browsers; the core content also works without JavaScript |
| Content | Project text stays in MongoDB; images stay in the repository |
| Game art | Art is Rowan's own or licensed for this use, and credited where required; each pack's terms are checked before its files enter the public repository; Wizardry names, art and code are not used |

### 8.4 Risks

| Risk | Effect | Mitigation |
| --- | --- | --- |
| Game layer distracts recruiters | Facts become harder to find | Skip control on every screen; test with 3 to 5 people, including a recruiter, before launch |
| Game layer hurts speed | Slower pages, worse first impression | Separate bundle, load after interaction, budget in CI |
| Hydration mismatches | Console errors, flicker | Browser-only values read after mount; test the built site |
| Strict CSP breaks pages | Blank or partly broken pages | Start report-only, then enforce |
| Failed publish goes unnoticed | Site shows stale content | Admin status line, manual rebuild, alert |
| Polish delays applications | Job search time lost | Ship phases 1 to 3 first; the site stays live throughout |

### 8.5 Build order

**Status, 2026-11-04.** The game redesign is ready to apply as a patch, with `docs/REDESIGN.md` as the guide. It covers the landing page, light and dark themes, Work tabs on live data, the skill filter, the contact form, the game at `/play` with saved progress, case study pages for The Archive, Food Forward and Bug Cup Fill, the 404 page, the removed headshot link, self-hosted fonts and split bundles. Prerendering, rate limits, the session cookie, closing registration and the Node upgrade are not in it and stay open below.

1. **Clean the foundation.** Write the README, remove the root template files, add `.env.example`, drop Redux and Inter, correct the About stack, upgrade Node and pin CI actions.
2. **Harden the API.** Add rate limits, remove registration, validate `/pageview`, add the summary shape, retention and the session cookie.
3. **Fix public quality.** Add the 404 route, metadata, prerendering, sitemap, code splitting, image pipeline and accessibility fixes, with CI gates.
4. **Settle the look.** Produce mockups and tokens in Design, and get approval before any UI code.
5. **Build the Game layer.** Port the prototype's engine, load real content from the API, then add saves and the admin journey field.
6. **Verify and launch.** Run the checks in 8.1, test with real people, and add this project as a case study.

### 8.6 Open decisions

- [ ] Approve Vite prerendering (D1), or choose Next.js instead
- [ ] Approve the session cookie (D4)
- [ ] Confirm which header carries the visitor IP through Vercel and Fly
- [x] Confirm analytics retention: 13 months (#31)
- [ ] Decide whether `development` stays, or pull requests go straight to `production`
- [ ] Decide whether project backups run on a schedule; `backup:projects` is manual today
- [ ] Rowan reviews the story text and role notes; family and health details stay out of all public text
- [ ] Confirm the game's name; the working title is Late Game
- [ ] Choose the art: Rowan's own, itch.io packs, or a mix

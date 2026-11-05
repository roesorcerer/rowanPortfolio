# Codebase map

Where things live in rowan.page and how a request moves through them. Read this
before changing something you haven't touched before. For *why* the system is
built this way, see the Software Design Document. For what's planned, see
`ROADMAP.md` (added in PR #18).

## The big picture

```text
Browser ──> Vercel (static React build)
              │
              └── /api/* is rewritten to ──> Fly.io (Express API) ──> MongoDB Atlas
```

- **`frontend/`** is a React 18 + TypeScript app built with Vite. Vercel hosts it.
- **`backend/`** is an Express + Mongoose API. It runs in Docker on Fly.io.
- **`shared/contracts.d.ts`** holds the types for every JSON shape that crosses
  HTTP. Both sides import it, so a field renamed there shows up as a type error
  on both sides.

Because Vercel forwards `/api/*` to Fly, the browser only ever talks to one
origin. In development, Vite's proxy does the same thing (`frontend/vite.config.ts`).

## Running it locally

```bash
# once
cd backend  && npm install
cd ../frontend && npm install

# backend (needs backend/.env, see below)
cd backend && npm run dev

# frontend (http://localhost:3000)
cd frontend && npm start
```

Run `npm install` **inside** each folder. `npm install --prefix frontend` from
the repo root adds the root package as a dependency by mistake.

`backend/.env` needs at least `MONGODB_URI` and `JWT_SECRET`. Without them the
server stops on boot with a message naming the missing variable
(`backend/src/config/index.ts`). Also set `PORT=5001`: the backend defaults to
5000, but Vite forwards `/api` to 5001, so without it the frontend can't reach
the API. Add `ADMIN_EMAIL` and `ADMIN_PASSWORD` to get an admin login. For a safe local database, run Mongo in Docker, then point
`MONGODB_URI` at it and run `npm run seed`:

```bash
docker run -d --rm --name portfolio-mongo -p 27017:27017 mongo:7
```

## Checks

| What | Frontend (`cd frontend`) | Backend (`cd backend`) |
| --- | --- | --- |
| Types | `npx tsc` | `npx tsc --noEmit` |
| Tests | `npx vitest run` | `npx vitest run` (route tests need `MONGODB_URI`) |
| Lint | none yet (#13) | `npm run lint` |
| Build | `npm run build` | `npm run build` |

CI runs the same checks on every pull request (`.github/workflows/ci.yml`).
Tests sit next to the file they test, as `name.test.ts(x)`.

## Frontend: `frontend/src/`

| Folder | What's in it | Start here |
| --- | --- | --- |
| `App.tsx` | Every route, and which ones load lazily | Adding a page |
| `main.tsx` | Mounts React and sets up the React Query cache | Rarely changed |
| `site/` | The public landing page: hero, Work tabs, stairs, contact, 404, theme | `Landing.tsx` |
| `site/site.css` | Colors, type and layout for the public site, as CSS variables | Changing the look |
| `game/` | The game at `/play` (see below) | `data.ts` for story text |
| `components/` | Pages shared with the old site: case study, project page, resume, admin login | `ProjectPage.tsx` |
| `components/project/` | Pieces of a project page: heading, facts, links, media carousel | |
| `components/admin/` | The admin CMS: projects, messages, analytics tabs | `AdminDashboard.tsx` |
| `api/` | One function per API call. `client.ts` adds the auth token and turns errors into `ApiError` | `projects.ts` |
| `hooks/` | React Query hooks wrapping the `api/` functions. Components call these, not `api/` | `useProjects.ts` |
| `lib/` | Pure helper functions with no React in them. Easy to unit test | `projectLinks.ts` |
| `analytics/` | Page view and event tracking. Skips `/admin` paths | `index.tsx` |
| `types/` | Re-exports the shared contracts, so imports read `from "../types"` | |
| `test/setup.ts` | Test environment setup for Vitest | |

### The game, in four files

| File | Job | Has React? |
| --- | --- | --- |
| `game/data.ts` | Everything the game says: floors, maps, encounters, roles | No |
| `game/logic.ts` | The rules: moving, fighting, saving to `localStorage` | No |
| `game/view.ts` | Works out what each screen shows from the current state | No |
| `game/Game.tsx` | Draws that view and handles keys and buttons | Yes |

Story changes only touch `data.ts`. Rule changes only touch `logic.ts`, and
`logic.test.ts` covers them. Keeping React out of the first three files is what
makes the game testable.

### How a component gets data

```text
Component ──> hook (hooks/) ──> API function (api/) ──> client.ts ──> /api/...
```

For example, `site/WorkSection.tsx` calls `useProjects()`, which calls
`getProjects()` in `api/projects.ts`. React Query caches the result for 5
minutes, so every component that calls `useProjects()` shares one request.
After a change, mutations such as `useUpdateProject()` invalidate that cache so
lists refetch.

**Rule of thumb:** components never call `api/` or `fetch` directly. Go through a
hook, so loading, error and cache handling stay in one place.

## Backend: `backend/src/`

Each layer only calls the one below it:

```text
routes/        which URL, which middleware, which handler
  │
middleware/    validate.ts (Zod), requireAuth.ts (JWT), errorHandler.ts
  │
controllers/   read the request, call an operation, shape the HTTP response
  │
operations/    business rules that span several steps (e.g. save, then email)
reports/       read-only aggregations (analytics)
  │
stores/        the only code that talks to Mongoose; returns plain objects
  │
models/        Mongoose schemas and indexes
```

Other folders:

| Folder | What's in it |
| --- | --- |
| `validators/` | Zod schemas for request bodies. `limits.ts` holds every length limit, used by both Zod and Mongoose. `project.contract-parity.ts` fails the build if the validator and `shared/contracts.d.ts` drift apart |
| `services/` | Outside systems, currently just the mailer |
| `utils/` | Small pure helpers: password hashing, JWTs, slugs |
| `config/` | Env vars, checked on boot, and the database connection |
| `scripts/` | Command-line jobs run with `npm run <name>`: seeding, backups, migrations, creating the admin |

Simple reads skip the controller. `routes/respond.ts` wraps a store call in the
standard `{ success, data }` reply, as `GET /api/contact/submissions` does.

### One request, end to end: sending a contact message

1. `frontend/src/site/ContactPanel.tsx` calls `mutate()` from `useContact()`.
2. `hooks/useContact.ts` calls `sendContactMessage()` in `api/contact.ts`, which
   sends `POST /api/contact`.
3. `backend/src/routes/contact.routes.ts` runs `validate(contactSchema)`. Bad
   input stops here with a 400 that names the field.
4. `controllers/contact.controller.ts` calls `submitContact()` in
   `operations/contact-operations.ts`.
5. The operation **saves first** through `stores/contact-submissions-store.ts`,
   then tries the mailer. If email fails, the message is still saved.
6. The controller replies with 202 and wording that depends on whether the email
   went out. Any thrown error goes to `middleware/errorHandler.ts`.

Admin routes look the same with `requireAuth, requireAdmin` added before the
handler (see the second route in `contact.routes.ts`).

## Recipe: adding a field to projects

Work from the contract outward. The type checker then points out every place
still missing the field.

1. Add it to `Project` (and `ProjectPayload` if the admin edits it) in
   `shared/contracts.d.ts`.
2. Add the length limit to `backend/src/validators/limits.ts`.
3. Add it to the Zod schema in `validators/project.validators.ts`.
4. Add it to the Mongoose schema in `models/project.model.ts`.
5. Map it in `stores/projects-store.ts`.
6. Run `npx tsc --noEmit` in `backend`. The parity check flags anything you missed.
7. Frontend: add it to the admin form (`hooks/useProjectFormState.ts`,
   `components/admin/ProjectForm.tsx`), then render it where it belongs.
8. Run `npx tsc` and the tests on both sides.
9. If existing documents need the field filled in, add a script in
   `backend/src/scripts/` and run `npm run backup:projects` before it.

## Shipping

- Work on a branch and open a PR into `production`. CI must pass.
- **Merging into `production` deploys.** `.github/workflows/deploy.yml` runs
  the checks again, deploys the API to Fly.io and the frontend to Vercel.
- Project content lives in MongoDB, so publishing a project is done in `/admin`
  and needs no deploy. Images live in `frontend/public/assets/` and do need one.
- Before any script that writes to production data, run `npm run backup:projects`.
  `npm run restore:projects` undoes it.

## Known oddities

These are tracked in #13. Expect them to change.

- The `@/` import alias points at `frontend/`, not `frontend/src/`. That's why
  `@/components/ui/button` lives outside `src`. Elsewhere imports are relative.
- `src/components/ui/Badge.tsx` and `components/ui/badge.tsx` are two different
  files whose names differ only in case.
- Images exist twice, in `src/assets/` and `public/assets/`. `public/assets/` is
  the real one.
- There are two `vercel.json` files, one at the root and one in `frontend/`.
- The public site lives in `site/` and `game/`, while the design document says
  `pages/` and `features/game/`. One of them will be changed to match the other.
- The `docker` CI job fails on every PR because the frontend image can't see
  `shared/`. Production doesn't use that image.
- On Windows, two files in one folder whose names differ only in case resolve to
  the same file. Avoid names like `Thing.tsx` beside `thing.ts`.

# Moving rowan.page to the game redesign

This patch replaces the public site. The landing page, the game, the case study
pages and the 404 are new. The API, the database schema, the admin and the
resume page are unchanged, apart from one new script.

## 1. Apply it

Start from a clean `production` at b216560.

```bash
git checkout production
git pull
git checkout -b redesign
git apply --index rowan-portfolio-redesign.patch
npm install --prefix frontend
npm install --prefix backend
```

Check it:

```bash
cd frontend && npx tsc && npx vitest run && npm run build
cd ../backend && npx tsc --noEmit && npx vitest run
```

The backend tests need your usual `MONGODB_URI`, `JWT_SECRET` and
`MONGODB_URI_TEST` values. Without them, 7 test files fail before they start. That
happens on `production` too.

Preview it with `npm start` in `frontend`, with the backend running. Then commit
and merge the way you normally do.

## 2. Load the case studies

Deploy the frontend first, because the case studies point at images in
`frontend/public`. Then, from `backend`, with `MONGODB_URI` set to the production
database:

```bash
npm run backup:projects
npm run seed:case-studies -- --dry
npm run seed:case-studies
```

The dry run prints which project each case study will land on. Check that it
finds all three. A title that matches nothing, or more than one project, is
skipped and reported. The Archive matches "archive", Food Forward matches
"food forward", and Bug Cup Fill matches "bug cup" or "cup fill". If your Bug Cup
project has another title, change `match` in
`backend/src/scripts/data/case-studies.ts`.

The script only writes `caseStudy`, but it replaces any case study already on
those projects. Once it has run, edit them in the admin. Running it again
overwrites those edits. To undo it, use `npm run restore:projects` with the
backup file.

## 3. Finish in the admin

- Work comes from the database, so **Eggshells** (formerly What the Mountain
  Keeps) and **Metamorphosis** appear only once they are published. They are
  still drafts. When renaming Eggshells, edit its slug too: slugs are frozen on
  rename, and it is safe to change while nothing links to it.
- Update these two links: Itasca Trails to
  `https://github.com/roesorcerer/ItascaCountyExplore/tree/release2`, and Anime
  Ratings to `https://github.com/roesorcerer/AnimeRatingsWeb/tree/version4`.
  Both are the branches where active work lives, so revisit the links when
  those branches merge.
- The skill filter is built from each project's tags, so tags need to match
  exactly ("React Native", not "react-native") to be counted together. A skill
  shows up once two projects share it.
- The Art tab appears once a project has the Art type.

## 4. What changed that you might trip over

- The headshot no longer links to the admin. Go to `/admin/login` directly.
- Project cards go straight to the project page. The old pop-up is gone.
- `/#projects` still works, so old links won't break.
- Unknown addresses now show a page instead of a blank screen. It is still a
  200 response, because the site is a single-page app. Prerendering fixes that.
- Fonts are now bundled with the site instead of coming from Google Fonts.
- Admin and resume keep their old look. Tailwind colors now read from CSS
  variables: `index.css` holds the admin values, `site/site.css` holds the themes.
- Game progress is saved in the visitor's browser. **Play from the beginning**
  clears it.

## 5. Where things live

| What | Where |
| --- | --- |
| Landing page sections | `frontend/src/site/` |
| Colors, type and layout | `frontend/src/site/site.css` |
| Hero text, facts | `frontend/src/site/Landing.tsx` |
| Game story, maps, game name | `frontend/src/game/data.ts` |
| Game rules | `frontend/src/game/logic.ts` |
| Case study text | `backend/src/scripts/data/case-studies.ts`, then the admin |
| Case study images | `frontend/public/assets/thearchive/cs-*`, `assets/timemanff/` |

Removed: `Main`, `AboutSection`, `ContactSection`, `Header`, `ProjectCard` and its
test. The contact form's fields, honeypot and API call moved to
`site/ContactPanel.tsx`.

## 6. Still open from the design document

Not in this patch: prerendered HTML for search engines and link previews, rate
limiting on login and contact, closing public registration, moving the admin
token out of localStorage, trimming case studies out of the list endpoint, image
compression, and the Node upgrade.

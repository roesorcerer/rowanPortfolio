# Redesign roadmap

The plan for moving rowan.page from the current site to the game redesign. Each
phase has one issue with its checklist, and that issue is where progress is
tracked. The full reasoning is in the Software Design Document.

| Phase | Goal | Issue | Status |
| --- | --- | --- | --- |
| 1 | Apply the redesign and load the case studies | [#12](https://github.com/roesorcerer/rowanportfolio/issues/12) | Ready to apply |
| 2 | Clean the foundation | [#13](https://github.com/roesorcerer/rowanportfolio/issues/13) | Not started |
| 3 | Harden the API | [#14](https://github.com/roesorcerer/rowanportfolio/issues/14) | Not started |
| 4 | Public quality and search | [#15](https://github.com/roesorcerer/rowanportfolio/issues/15) | Partly done by phase 1 |
| 5 | Finish the game | [#16](https://github.com/roesorcerer/rowanportfolio/issues/16) | Partly done by phase 1 |
| 6 | Test with people and wrap up | [#17](https://github.com/roesorcerer/rowanportfolio/issues/17) | Not started |

## Order

The redesign comes first because it is finished and the job search needs it live.
The design document's original order put foundation and API work first, but that
work doesn't block the redesign and the current site keeps running either way.

Phases 2 and 3 can swap or overlap. Phases 4 to 6 can wait if they would take time
away from applications.

## What phase 1 delivers

- Landing page with light and dark modes, for phone through desktop
- Work tabs and a skill filter, on live project data
- Contact form, still using the existing API
- Playable game at `/play` with saved progress
- Case studies for The Archive, Food Forward and Bug Cup Fill
- A 404 page, page metadata, split bundles, self-hosted fonts and accessibility fixes
- No more admin link on the headshot

The API, database schema, admin and resume page do not change, apart from one new
script, `seed:case-studies`.

## Older issues to settle first

Issues #1 to #10 date from May, before projects gained `links`, `projectType`
values such as `gameDev`, and the current `featured` behavior. Some now conflict
with the redesign. These are recommendations, and nothing has been closed.

| Issue | Conflict | Recommendation |
| --- | --- | --- |
| #1 and PR #11, drop `featured` | The Featured tab reads `featured`. PR #11 no longer merges cleanly | Close both |
| #5, replace `category` with `topics` | The skill filter is built from `category` | Close, or redo it after phase 1 with skills in the vocabulary |
| #4, `demoUrl` and `sourceUrl` | Replaced by `links` | Close |
| #2, drop `developmentTime` | The field is still in the model. Check it isn't still shown | Keep, after phase 1 |
| #3, rename `image` | The Work cards and project page read `image` | Keep, after phase 1, and include the new files |
| #6, scoped `order` | Ordering by display group and a reorder endpoint already exist | Check, then close if covered |
| #7, #8, #9, #10 | No conflict found, but #10 names a variable in a file phase 1 removes | Keep #7 to #9 and close #10 |

## Deployment notes

- Any push to `production` deploys, so a merge is a release.
- Back up projects before seeding. `npm run restore:projects` undoes it.
- Running `seed:case-studies` again overwrites edits made in the admin.

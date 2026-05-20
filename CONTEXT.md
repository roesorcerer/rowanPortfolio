# Rowan Portfolio

Personal portfolio site presenting **Projects**, an **About** section, a **Resume**, and a **Contact** form, with lightweight built-in **Analytics** and a single-admin **Admin** area for editing project content. MERN stack: React+Vite frontend, Express+Mongo backend.

## Language

### Project

**Project**:
A single item displayed in the portfolio gallery — represents something Rowan built, researched, or wrote. Each Project has exactly one **Project Type** and zero or more **Topics**.

**Project Type**:
The structural classification of a Project — i.e. *how it is displayed*. Drives which tab/section the Project appears under on the public site. One of: `featured`, `research`, `practice`. Always single-valued.
_Avoid_: "category" when you mean Project Type. Avoid the legacy boolean `featured` flag; it is being removed.

**Cover Image URL**:
The Project's hero/thumbnail image — shown on the Project card, in the modal, and in admin previews. A single image per Project (no galleries today). Contract: any valid URL — absolute (`https://...`) or root-relative (`/assets/...`). The admin pastes from wherever the image is hosted; the site does not host or upload images itself. Required. Field name: `coverImageUrl`.
_Avoid_: "image" (too generic — doesn't communicate the role or the URL contract), "imagePath" (locks in a relative-path-only interpretation), "thumbnail" (implies a separate full-size variant that does not exist).

**Demo URL**:
The Project's live demo URL — where a visitor can interact with the running thing. Optional (some Projects, e.g. research papers, may not have one). Field name: `demoUrl`.
_Avoid_: "link" (ambiguous), "url" (too generic), "site".

**Source URL**:
The Project's source URL — where the underlying code, paper, or design lives. Often a GitHub repo, but deliberately abstract: also covers GitLab, arXiv, Figma, etc. Optional. Field name: `sourceUrl`.
_Avoid_: "githubLink" or "githubUrl" (locks in a specific host), "repo", "code".

**Order**:
A Project's position **within its Project Type** — *not* a global position across all Projects. The admin reorders Projects tab-by-tab; position only has meaning relative to siblings of the same Project Type. Stored as an integer; lower values appear first. Indexed on `(projectType, order)`.
_Avoid_: treating `order` as a global ranking — Featured #1 and Practice #1 are independent positions, not the same slot.

**Topic**:
The subject-matter classification of a Project — i.e. *what it is about*. Cross-cutting filter axis, independent of Project Type. Multi-valued (a Project can have several Topics). Drawn from a **closed vocabulary** maintained intentionally — admins cannot type new Topics in free-form; adding a new Topic is a deliberate change to the vocabulary. Example values: `mental-health`, `co-design`, `machine-learning`, `web-app`, `research-paper`.
_Avoid_: "category", "tags", "themes". A Project's Topics are not free-text tags and should not be referred to as such.

### Analytics

**PageView**:
A single record of a visitor loading a public route. Auto-fired by the frontend on every client-side route change (admin routes are excluded). Skinny shape: `path`, `referrer`, `userAgent`, timestamp. High-volume.

**Interaction**:
A single record of an explicit, named action taken by a visitor — e.g. opening a project's modal, clicking a project's demo link. Lower-volume than PageView; carries project context (`projectId`, `projectTitle`, `Project Type`, `Link Type`) where applicable.
_Avoid_: "Event" as a domain term. The model is currently named `Event` in code (legacy); it is being renamed to `Interaction`. In the meantime, the word "event" should only appear in casual English, never as a term of art.

**Interaction Type**:
The kind of Interaction recorded. Drawn from a **closed vocabulary**: `project_view`, `link_click`. New Interaction Types require a deliberate code change in both the frontend tracker and the backend validator.

**Link Type**:
Sub-vocabulary on `link_click` Interactions, identifying which link on a Project was clicked. Closed: `demo`, `source`. Mirrors the two URL fields on a Project (**Demo URL** and **Source URL**).
_Avoid_: "github" as a Link Type value — the legacy code uses `github` but it is being renamed to `source` as part of the `githubLink` → `sourceUrl` migration.

**Engagement**:
Per-project usage stats (modal opens + link clicks) shown on the admin dashboard. Distinct from raw PageView counts — engagement specifically means *interaction with a Project*, not just *visiting a page*.

**Conversion Rate**:
The admin-dashboard metric `messages / totalPageViews × 100`. "Conversion" here means a visitor sending a **Message**; a pageview that does not result in a Message is, by definition, not converted.

### Identity

**Admin**:
The single principal who can authenticate and use the management area of the site. There is exactly one. Logs in via the admin login form, manages Projects, reads Messages, reads the analytics dashboard. The `User` model in code represents an Admin and is being renamed.
_Avoid_: "User" (implies a multi-user system, which this is not).

**Visitor**:
Any unauthenticated person browsing the public site. Visitors generate **PageViews** and **Interactions**, and can send **Messages**. They have no account and no identity beyond `referrer` and `userAgent`.
_Avoid_: "User" for a Visitor — the public site has no users in the auth sense.

### Contact

**Message**:
A note a visitor sends through the contact form on the public site. Carries the sender's `name`, `email`, optional `subject`, and the actual **body** of the note. Stored for the admin to read; not yet wired to outbound delivery beyond the mailer service.
_Avoid_: "Contact Submission" (the legacy model name, being renamed), "Inquiry" (too CRM-flavored), "Contact" used as a noun for the Message itself.

**Body**:
The text content of a Message. Field name on the Message entity. (The legacy field name is `message`, which clashed with the entity name — being renamed.)
_Avoid_: "message" as a field name on a Message — too confusing.

## Flagged ambiguities

- **`featured` (legacy boolean) vs `Project Type = "featured"`**: Historically, Projects had a boolean `featured` flag. `Project Type` was added later to expand the taxonomy and now subsumes that meaning. The boolean is **vestigial** and slated for removal — `Project Type === "featured"` is the single source of truth. Until the boolean is deleted, do not introduce new code that reads it.

- **`category` (legacy free-text field) is being replaced by `Topics`**: The current `Project.category` string field is cosmetic — it renders as a subtitle under the project title but does not drive any filtering. Its values (e.g. "Mental Health Application", "Research Paper") are essentially one-off taglines, not reusable categories. Migration: rename/replace this field with `topics: string[]` drawn from the closed Topic vocabulary; the human-readable subtitle is dropped from the card UI (title + Topic pills carry the same information more structurally). Until migrated, do not introduce new code that reads `category` for classification.

- **`Project.developmentTime` is being dropped**: Optional free-text field carrying the value for a "Built in X" phrase on the card. Vestigial — used on zero seed projects and not load-bearing for a portfolio. Migration: remove the field from the model, the type, the validator, the admin form, and the card rendering. If the "Built in" line is ever wanted back, it can be reintroduced with an honest name (`effort`) at that point.

- **`Project.image` is being renamed to `coverImageUrl`**: The current name is generic and the contract is implicit. Migration: rename the field, add a zod URL validator (accepts absolute `https://...` or root-relative `/...`), and update the admin form label to make the URL contract obvious. No upload behavior is being added — admin pastes the URL of an image hosted elsewhere.

- **`Project.order` is moving from global to per-Project-Type**: Currently a single integer drives a global sort across all Projects, even though the UI never shows them in one list — the public site is tab-by-tab. Migration: change the index to compound `(projectType, order)` and update the backend sort accordingly; admin reordering UX should reorder within a tab only.

- **`User` model is being renamed to `Admin`; the `role` enum is being removed**: The system is single-admin in practice — there is exactly one principal who logs in, and the only role check anywhere is "is admin?". The `"user"` role value is unreachable dead weight, and the `AuthUser.role: string` type drifts looser than the model's enum. Migration: rename `User` model/collection to `Admin`, drop the `role` field, drop the `requireAdmin` middleware (collapse it into `requireAuth`), and remove `role` from the JWT payload and `AuthUser` type. The domain vocabulary becomes **Admin** + **Visitor** — see definitions above.

- **`ContactSubmission` is being renamed to `Message`, and the `message` field to `body`**: The current model name is bureaucratic, and the field `submission.message` is awkward — a Message containing a "message". The engagement summary already labels the count `totalMessages`, so the codebase has effectively two names for the same thing. Migration: rename the model, collection, routes, and types to `Message`; rename the `message` field to `body`.

- **`Project.link` and `Project.githubLink` are being renamed to `demoUrl` and `sourceUrl`**: The current names are asymmetric and misleading. `link` is generic but actually means "live demo URL"; `githubLink` hard-codes GitHub as the source host, which doesn't generalize to research papers (arXiv), design files (Figma), or other code hosts (GitLab). Migration: rename `link` → `demoUrl`, `githubLink` → `sourceUrl`, and update the `Link Type` value `"github"` → `"source"` in both the frontend tracker and the backend Interaction records.

- **`Event` (legacy collection name) is being renamed to `Interaction`**: The Mongo collection currently named `Event` (and its model `EventModel`) does not record all analytics activity — it specifically excludes PageViews. Using "Event" as the domain term creates a hypernym clash with the casual English word ("isn't a pageview also an event?"). Migration: rename `Event` → `Interaction` (model, collection, fields, controller naming). Until migrated, the word "event" in code refers to the legacy collection; the domain term is **Interaction**.

- **The word "category" overloads two unrelated concepts** in the current code: (1) `Project.category` (covered above, being removed), and (2) `TECH_STACK[i].category` in `AboutSection.tsx` (groups skills into "Frontend"/"Backend"/"Database"/"Tooling"). Only the second is a genuine category in the classification sense. Prefer **Skill Group** when referring to the tech-stack grouping to keep it distinct from anything Project-related.

## Example dialogue

> **Dev:** A Visitor opened the modal on the Itasca Trails project. Should that show up in the dashboard?
>
> **Owner:** Yes — that's an Interaction of type `project_view`. It'll show under Engagement, not under PageViews. The PageView count only goes up if they actually navigated to a new route.
>
> **Dev:** Got it. And if they click the demo link?
>
> **Owner:** Another Interaction — type `link_click`, Link Type `demo`. Counts toward Engagement on that Project but doesn't move the Conversion Rate. Conversion only counts Messages.
>
> **Dev:** What about the project's tab — does the Interaction record which tab the visitor was viewing?
>
> **Owner:** It records the Project's *Project Type*, not the tab. The tab is just the UI affordance — the underlying term is Project Type. If we redesigned the public projects view as a dropdown, the Interactions would still record the same field.
>
> **Dev:** And Topics?
>
> **Owner:** Topics aren't in Interactions — they're a filter axis on Projects themselves. A Project has one Project Type (which tab it lives in) and zero or more Topics (what it's about). A visitor can filter the gallery by Topic to pull, say, all `mental-health` Projects regardless of which tab they're under.
>
> **Dev:** If someone sends a Message, do I associate it to a Project somehow?
>
> **Owner:** No. A Message has no link to a Project — it's just a note from a Visitor. The connection to a Project, if any, lives in the body text.

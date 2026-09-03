import type { Project, ProjectCaseStudy, ProjectLink } from "../types";

// Link vocabulary for projects, inbound and outbound: the permalink a resume
// points at, and the labels the outbound `links[]` render with. Not to be
// confused with `@/lib/utils`, which is the shadcn-generated `cn` helper at the
// frontend root — this one is app domain code and is always imported relatively.

type Linkable = Pick<Project, "slug" | "_id">;

/**
 * The permalink for a project: `/projects/<slug>`.
 *
 * This is the URL that goes on a resume, so it's derived in exactly one place
 * — the modal's "read the case study" link, the admin's copy-link button, and
 * the resume page itself all read it from here.
 *
 * Falls back to the id when a project arrives without a slug, because the
 * route resolves either. Without the fallback, an API that hasn't been
 * redeployed yet produces `/projects/undefined` — a dead link that looks like
 * a routing bug rather than a stale server.
 */
export function projectPath(project: Linkable): string {
  return `/projects/${project.slug || project._id}`;
}

/** The same link, absolute — what a copy-to-clipboard button hands over. */
export function projectUrl(project: Linkable): string {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}${projectPath(project)}`;
}

/**
 * Whether enough has been written to be worth showing as a case study. An
 * empty `caseStudy` object — one the form created but nobody filled in —
 * shouldn't render a heading over nothing.
 */
export function hasCaseStudy(
  caseStudy: ProjectCaseStudy | undefined
): caseStudy is ProjectCaseStudy {
  if (!caseStudy) return false;

  return Boolean(
    caseStudy.summary?.trim() ||
      caseStudy.role?.trim() ||
      caseStudy.problem?.trim() ||
      caseStudy.sections?.some(
        (section) => section.heading.trim() || section.body.trim()
      ) ||
      caseStudy.outcomes?.some((item) => item.trim()) ||
      caseStudy.lessons?.some((item) => item.trim())
  );
}


// ---- Outbound links ----

/**
 * Default labels for the kinds the UI knows by name.
 *
 * `demo` is deliberately absent: what following it gets you depends on the
 * project type ("Live demo", "Read manuscript", "Play build"), so its label
 * comes from `CARD_COPY[projectType].demoLabel` and is passed in.
 */
export const LINK_KIND_LABELS: Record<string, string> = {
  github: "View source",
  research: "Related research",
};

/** Sentence-cases an unknown kind so "itch" reads as "Itch", not "itch". */
function humanizeKind(kind: string): string {
  const trimmed = kind.trim();
  if (!trimmed) return "Open link";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * What a link's button says. An explicit `label` always wins — that is how a
 * kind the UI has never heard of still reads properly ("Play on itch.io").
 */
export function linkLabel(link: ProjectLink, demoLabel: string): string {
  const explicit = link.label?.trim();
  if (explicit) return explicit;
  if (link.kind === "demo") return demoLabel;
  return LINK_KIND_LABELS[link.kind] ?? humanizeKind(link.kind);
}

/** Links with a usable URL, in authored order. */
export function usableLinks(project: Pick<Project, "links">): ProjectLink[] {
  return (project.links ?? []).filter((link) => link.url?.trim());
}

/** The first link of a kind — the card shows the demo and the source only. */
export function linkOfKind(
  project: Pick<Project, "links">,
  kind: string
): ProjectLink | undefined {
  return usableLinks(project).find((link) => link.kind === kind);
}

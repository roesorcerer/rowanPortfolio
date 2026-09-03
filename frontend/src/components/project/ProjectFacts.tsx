import type { Project, ProjectDetail } from "../../types";
import { datesLabel, researchStatusOf } from "./projectFacts";
import { CARD_COPY } from "./cardCopy";
import {
  DETAIL_KEYS,
  REVISION_TRAIL_KEYS,
  detailValue,
  detailsExcept,
} from "../../lib/projectDetails";

/**
 * The metadata grid: dates, tech, and whichever type-specific blocks apply.
 *
 * Shared by the project modal and the project page so the two can't drift
 * into showing different facts about the same project. External links are
 * deliberately not here — each surface places those differently (the modal
 * boxes them in the grid, the page puts them in a footer), so they live in
 * `ProjectLinks`.
 */
function ProjectFacts({ project }: { project: Project }) {
  const researchStatus = researchStatusOf(project);
  const inRevision =
    project.projectType === "research" && researchStatus === "in-revision";

  // The revision trail gets its own callout below, so its keys are held back
  // from the generic list rather than printed twice.
  const details = detailsExcept(project, inRevision ? REVISION_TRAIL_KEYS : []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Fact label="Dates">
        <p className="text-body text-sm">{datesLabel(project)}</p>
      </Fact>

      {/* One list since `technologies` merged into `category`, labelled in the
          type's own words — a painting's tags read as a medium, a paper's as
          topics and methods. */}
      <Fact label={CARD_COPY[project.projectType].tagsLabel}>
        {project.category && project.category.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {project.category.map((tag) => (
              <li
                key={tag}
                className="px-2.5 py-1 border border-rule-soft text-ink text-xs bg-paper"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body text-sm">Not listed</p>
        )}
      </Fact>

      {/* Research keeps a named block because a paper is read as a citation,
          and status is a typed field rather than a detail. */}
      {project.projectType === "research" && (
        <Fact label="Publication details">
          <p className="text-body text-sm">
            Status:{" "}
            {researchStatus === "in-revision" ? "Developing manuscript" : "Published"}
          </p>
        </Fact>
      )}

      {inRevision && <RevisionTrail project={project} />}

      {/* Everything else the admin chose to record. Whatever gets added
          tomorrow renders here without this file learning its name. */}
      {details.length > 0 && (
        <Fact label="Details" className="md:col-span-2">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {details.map((detail) => (
              <div key={detail.key} className="flex gap-2 text-sm">
                <dt className="text-muted shrink-0">{detail.label}</dt>
                <dd className="text-body min-w-0">
                  <DetailValue detail={detail} />
                </dd>
              </div>
            ))}
          </dl>
        </Fact>
      )}

      <Fact label="Worked on by">
        {project.collaborators && project.collaborators.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {project.collaborators.map((collaborator) => (
              <li key={`${collaborator.name}-${collaborator.socialLink}`}>
                <a
                  href={collaborator.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 border border-rule-soft text-ink text-xs hover:border-accent transition-colors"
                >
                  <span>{collaborator.name}</span>
                  {collaborator.role && (
                    <span className="text-muted">({collaborator.role})</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body text-sm">Not listed</p>
        )}
      </Fact>
    </div>
  );
}

/** A URL detail becomes a link; everything else is text. */
function DetailValue({ detail }: { detail: ProjectDetail }) {
  if (detail.kind === "url") {
    return (
      <a
        href={detail.value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent-dark hover:text-accent-darker break-words"
      >
        {detail.value}
      </a>
    );
  }

  return <span className="whitespace-pre-line">{detail.value}</span>;
}

/**
 * A paper still in revision, and where it came from. Kept as a bespoke block
 * rather than four rows in the generic list because the trail is one claim —
 * "this was turned down here, and became this" — and reads as a unit.
 */
function RevisionTrail({ project }: { project: Project }) {
  const originalVenue = detailValue(project, DETAIL_KEYS.originalVenue);
  const improvedInto = detailValue(project, DETAIL_KEYS.improvedInto);
  const improvedIntoLink = detailValue(project, DETAIL_KEYS.improvedIntoLink);
  const summary = detailValue(project, DETAIL_KEYS.improvementSummary);

  return (
    <section className="border border-amber-200 bg-amber-50/40 p-4">
      <h3 className="text-amber-900 text-xs uppercase tracking-widest font-medium mb-2">
        Revision trail
      </h3>
      <div className="space-y-1">
        <p className="text-body text-sm">
          Original submission: {originalVenue || "Not listed"}
        </p>
        <p className="text-body text-sm">
          Improved into:{" "}
          {improvedIntoLink ? (
            <a
              href={improvedIntoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-dark hover:text-accent-darker"
            >
              {improvedInto || "Revised manuscript"}
            </a>
          ) : (
            <span>{improvedInto || "Not listed"}</span>
          )}
        </p>
        {summary && <p className="text-muted text-sm">{summary}</p>}
      </div>
    </section>
  );
}

function Fact({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`border border-rule bg-white p-4 ${className ?? ""}`}>
      <h3 className="text-ink text-xs uppercase tracking-widest font-medium mb-2">
        {label}
      </h3>
      {children}
    </section>
  );
}

export default ProjectFacts;

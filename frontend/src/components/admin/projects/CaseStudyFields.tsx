import type {
  CaseStudyFormState,
  MediaFormState,
} from "../../../hooks/useProjectFormState";
import { EMPTY_MEDIA } from "../../../hooks/useProjectFormState";
import type { ProjectType } from "../../../types";
import { PROJECT_TEMPLATES } from "./projectTemplates";
import { buttonVariants } from "@/components/ui/button";

/**
 * The case study editor inside the project form.
 *
 * Split out of ProjectForm because it's the longest thing on the form by a
 * wide margin, and because it's a self-contained sub-object: it takes the
 * whole `caseStudy` slice and hands back a new one, rather than reaching for
 * a dozen `setField` keys.
 */
interface CaseStudyFieldsProps {
  value: CaseStudyFormState;
  /** Only used to suggest step headings — never to gate what can be written. */
  projectType: ProjectType;
  onChange: (next: CaseStudyFormState) => void;
}

function CaseStudyFields({
  value,
  projectType,
  onChange,
}: CaseStudyFieldsProps) {
  const set = <K extends keyof CaseStudyFormState>(
    key: K,
    fieldValue: CaseStudyFormState[K]
  ) => onChange({ ...value, [key]: fieldValue });

  const addSection = (heading = "") =>
    set("sections", [...value.sections, { heading, body: "", media: [] }]);

  const removeSection = (index: number) =>
    set(
      "sections",
      value.sections.filter((_, i) => i !== index)
    );

  const setSectionField = (
    index: number,
    key: "heading" | "body",
    fieldValue: string
  ) =>
    set(
      "sections",
      value.sections.map((section, i) =>
        i === index ? { ...section, [key]: fieldValue } : section
      )
    );

  const setSectionMedia = (index: number, media: MediaFormState[]) =>
    set(
      "sections",
      value.sections.map((section, i) =>
        i === index ? { ...section, media } : section
      )
    );

  /**
   * Step headings this type usually has, minus the ones already written. A
   * suggestion is a starting heading and nothing more — every step is
   * free-form, and any type can have any of them.
   */
  const suggestedSteps = PROJECT_TEMPLATES[projectType].sections.filter(
    (candidate) =>
      !value.sections.some(
        (section) =>
          section.heading.trim().toLowerCase() ===
          candidate.heading.toLowerCase()
      )
  );

  /** Reordering is a two-button nudge — a process rarely has enough steps to
      justify dragging, and the form is already a long scroll. */
  const moveSection = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= value.sections.length) return;

    const next = [...value.sections];
    [next[index], next[target]] = [next[target], next[index]];
    set("sections", next);
  };

  return (
    <section className="border border-rule rounded-lg p-4 space-y-3">
      <div>
        <h3 className="text-ink text-sm font-medium">Case study</h3>
        <p className="text-faint text-xs mt-1">
          The long-form process write-up. Shown in the project modal and on the
          project's own page — leave it all blank and neither shows one.
        </p>
      </div>

      <Field label="Summary">
        <textarea
          rows={3}
          value={value.summary}
          onChange={(e) => set("summary", e.target.value)}
          className={inputCls}
          placeholder="The whole story in a paragraph — what it is, why it exists, how it went"
        />
      </Field>

      <Field label="My role">
        <textarea
          rows={2}
          value={value.role}
          onChange={(e) => set("role", e.target.value)}
          className={inputCls}
          placeholder="e.g. Sole developer — API design, mobile client, and client handoff"
        />
      </Field>

      <Field label="The problem">
        <textarea
          rows={3}
          value={value.problem}
          onChange={(e) => set("problem", e.target.value)}
          className={inputCls}
          placeholder="What needed solving, and for whom"
        />
      </Field>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-ink text-xs font-medium">Process steps</p>
            <p className="text-faint text-xs mt-0.5">
              Rendered numbered, in this order.
            </p>
          </div>
          <button
            type="button"
            onClick={() => addSection()}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            + Add step
          </button>
        </div>

        {suggestedSteps.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-faint text-xs">Common for this type:</span>
            {suggestedSteps.map((candidate) => (
              <button
                key={candidate.heading}
                type="button"
                onClick={() => addSection(candidate.heading)}
                title={candidate.hint}
                className="px-2.5 py-1 border border-rule-soft text-ink text-xs hover:border-accent transition-colors"
              >
                + {candidate.heading}
              </button>
            ))}
          </div>
        )}

        {value.sections.length === 0 && (
          <p className="text-faint text-xs">
            No steps yet. Add one per phase — research, design, build, ship,
            whatever the process actually was.
          </p>
        )}

        {value.sections.map((section, index) => (
          <div
            key={`case-section-${index}`}
            className="border border-rule-soft rounded-lg p-3 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-body text-xs font-medium">
                Step {String(index + 1).padStart(2, "0")}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveSection(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move step ${index + 1} up`}
                  className={buttonVariants({ variant: "ghost", size: "xs" })}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(index, 1)}
                  disabled={index === value.sections.length - 1}
                  aria-label={`Move step ${index + 1} down`}
                  className={buttonVariants({ variant: "ghost", size: "xs" })}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeSection(index)}
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  Remove
                </button>
              </div>
            </div>

            <Field label="Heading" required>
              <input
                value={section.heading}
                onChange={(e) => setSectionField(index, "heading", e.target.value)}
                className={inputCls}
                placeholder="e.g. Shadowing a shift to find the real workflow"
              />
            </Field>

            <Field label="What happened" required>
              <textarea
                rows={4}
                value={section.body}
                onChange={(e) => setSectionField(index, "body", e.target.value)}
                className={inputCls}
                placeholder="What you did in this phase, what you found, what changed because of it"
              />
            </Field>

            <StepMedia
              value={section.media}
              onChange={(media) => setSectionMedia(index, media)}
            />
          </div>
        ))}

        {/* A step needs both halves to be stored — the save silently drops
            half-typed ones, so say so before the save does it. */}
        {value.sections.some(
          (section) => !section.heading.trim() || !section.body.trim()
        ) && (
          <p className="text-[#B4770B] text-xs">
            Steps missing a heading or a body won't be saved.
          </p>
        )}
      </div>

      <Field label="What came out of it (one per line)">
        <textarea
          rows={3}
          value={value.outcomes}
          onChange={(e) => set("outcomes", e.target.value)}
          className={inputCls}
          placeholder={"Shipped to the client and in daily use\nCut shift handover from 20 minutes to 5"}
        />
      </Field>

      <Field label="What I'd carry forward (one per line)">
        <textarea
          rows={3}
          value={value.lessons}
          onChange={(e) => set("lessons", e.target.value)}
          className={inputCls}
          placeholder={"Ship the schema before the screens\nWatch someone use it before adding a setting"}
        />
      </Field>
    </section>
  );
}

/**
 * A step's images, in order.
 *
 * A gallery rather than the single image this used to hold, because the steps
 * that most want pictures — sketching, wireframes, iteration — are exactly the
 * ones with a sequence to show. One image per step forced those into separate
 * steps that weren't separate phases of anything.
 */
function StepMedia({
  value,
  onChange,
}: {
  value: MediaFormState[];
  onChange: (next: MediaFormState[]) => void;
}) {
  const setItem = (index: number, patch: Partial<MediaFormState>) =>
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-body text-xs">
          Images for this step{" "}
          <span className="text-faint">({value.length})</span>
        </p>
        <button
          type="button"
          onClick={() => onChange([...value, { ...EMPTY_MEDIA }])}
          className={buttonVariants({ variant: "ghost", size: "xs" })}
        >
          + Add image
        </button>
      </div>

      {value.map((item, index) => (
        <div
          key={`step-media-${index}`}
          className="grid grid-cols-1 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)_auto] gap-2 items-end"
        >
          <label className="block">
            <span className="sr-only">Image {index + 1} source</span>
            <input
              value={item.src}
              onChange={(e) => setItem(index, { src: e.target.value })}
              className={inputCls}
              placeholder="/assets/sketch.png or https://..."
            />
          </label>
          <label className="block">
            <span className="sr-only">Image {index + 1} caption</span>
            <input
              value={item.alt}
              onChange={(e) => setItem(index, { alt: e.target.value })}
              className={inputCls}
              placeholder="Caption — doubles as alt text"
            />
          </label>
          <div className="flex items-center gap-1 pb-0.5">
            <button
              type="button"
              onClick={() => move(index, -1)}
              disabled={index === 0}
              aria-label={`Move image ${index + 1} left`}
              className={buttonVariants({ variant: "ghost", size: "xs" })}
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => move(index, 1)}
              disabled={index === value.length - 1}
              aria-label={`Move image ${index + 1} right`}
              className={buttonVariants({ variant: "ghost", size: "xs" })}
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
              aria-label={`Remove image ${index + 1}`}
              className={buttonVariants({ variant: "ghost", size: "xs" })}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 bg-white border border-rule rounded-lg text-sm text-ink placeholder-faint focus:outline-none focus:border-accent transition-colors";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-body text-xs mb-1.5">
        {label}
        {required && <span className="text-accent ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default CaseStudyFields;

import type { DetailFormState } from "../../../hooks/useProjectFormState";
import type { ProjectType } from "../../../types";
import { PROJECT_TEMPLATES } from "./projectTemplates";
import { buttonVariants } from "@/components/ui/button";

/**
 * The short-facts editor: an open-ended list of label/value pairs.
 *
 * This replaced the two hardcoded blocks that used to sit here — "Research
 * metadata" and "Practice learning context" — which between them cost seven
 * columns in the schema and served two of five project types. Anything they
 * did, a row here does, for any type, with no code change.
 *
 * The key stays hidden unless asked for. It's what the citation line and the
 * revision-trail block search by, so it matters, but an admin adding "Engine"
 * to a game build shouldn't have to know that.
 */
interface DetailsFieldsProps {
  value: DetailFormState[];
  projectType: ProjectType;
  onChange: (next: DetailFormState[]) => void;
}

function DetailsFields({ value, projectType, onChange }: DetailsFieldsProps) {
  const template = PROJECT_TEMPLATES[projectType];

  const setRow = (index: number, patch: Partial<DetailFormState>) =>
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const addRow = () =>
    onChange([...value, { key: "", label: "", value: "", kind: "text" }]);

  const removeRow = (index: number) =>
    onChange(value.filter((_, i) => i !== index));

  const moveRow = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  /**
   * Adds only the template facts this project doesn't already carry, so
   * applying it twice — or after typing one by hand — never duplicates a row.
   */
  const suggested = template.details.filter(
    (candidate) =>
      !value.some(
        (row) => row.key.trim().toLowerCase() === candidate.key.toLowerCase()
      )
  );

  const addSuggested = (key: string) => {
    const candidate = template.details.find((d) => d.key === key);
    if (!candidate) return;
    onChange([
      ...value,
      {
        key: candidate.key,
        label: candidate.label,
        value: "",
        kind: candidate.kind ?? "text",
      },
    ]);
  };

  const hintFor = (row: DetailFormState) =>
    template.details.find(
      (d) => d.key.toLowerCase() === row.key.trim().toLowerCase()
    )?.hint ?? "Value";

  return (
    <section className="border border-rule rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-ink text-sm font-medium">Details</h3>
          <p className="text-faint text-xs mt-1">
            Short named facts — venue, engine, medium, dimensions. Shown as a
            list on the project page. Add whatever this project needs.
          </p>
        </div>
        <button
          type="button"
          onClick={addRow}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          + Add detail
        </button>
      </div>

      {suggested.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-faint text-xs">Common for this type:</span>
          {suggested.map((candidate) => (
            <button
              key={candidate.key}
              type="button"
              onClick={() => addSuggested(candidate.key)}
              className="px-2.5 py-1 border border-rule-soft text-ink text-xs hover:border-accent transition-colors"
            >
              + {candidate.label}
            </button>
          ))}
        </div>
      )}

      {value.length === 0 && (
        <p className="text-faint text-xs">
          No details yet. These are one-line facts — the long-form write-up
          belongs in the case study below.
        </p>
      )}

      {value.map((row, index) => (
        <div
          key={`detail-${index}`}
          className="border border-rule-soft rounded-lg p-3 space-y-2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] gap-2 items-end">
            <label className="block">
              <span className="block text-body text-xs mb-1.5">Label</span>
              <input
                value={row.label}
                onChange={(e) => setRow(index, { label: e.target.value })}
                className={inputCls}
                placeholder="e.g. Engine"
              />
            </label>

            <label className="block">
              <span className="block text-body text-xs mb-1.5">
                {hintFor(row) === "Value" ? "Value" : `Value — ${hintFor(row)}`}
              </span>
              <input
                value={row.value}
                onChange={(e) => setRow(index, { value: e.target.value })}
                className={inputCls}
                type={row.kind === "url" ? "url" : "text"}
                placeholder={hintFor(row)}
              />
            </label>

            <div className="flex items-center gap-1 pb-0.5">
              <button
                type="button"
                onClick={() => moveRow(index, -1)}
                disabled={index === 0}
                aria-label={`Move ${row.label || "detail"} up`}
                className={buttonVariants({ variant: "ghost", size: "xs" })}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveRow(index, 1)}
                disabled={index === value.length - 1}
                aria-label={`Move ${row.label || "detail"} down`}
                className={buttonVariants({ variant: "ghost", size: "xs" })}
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeRow(index)}
                aria-label={`Remove ${row.label || "detail"}`}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Remove
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2">
              <span className="text-faint text-xs">Renders as</span>
              <select
                value={row.kind}
                onChange={(e) =>
                  setRow(index, {
                    kind: e.target.value as DetailFormState["kind"],
                  })
                }
                className="px-2 py-1 bg-white border border-rule rounded text-xs text-ink"
              >
                <option value="text">Text</option>
                <option value="url">Link</option>
                <option value="date">Date</option>
              </select>
            </label>

            {/* Only worth showing once there's a label to disagree with. */}
            {row.label.trim() && (
              <label className="flex items-center gap-2">
                <span className="text-faint text-xs">Key</span>
                <input
                  value={row.key}
                  onChange={(e) => setRow(index, { key: e.target.value })}
                  className="px-2 py-1 bg-white border border-rule rounded text-xs text-ink font-mono w-40"
                  placeholder={row.label
                    .trim()
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "")}
                />
              </label>
            )}
          </div>
        </div>
      ))}

      {value.some((row) => row.label.trim() && !row.value.trim()) && (
        <p className="text-[#B4770B] text-xs">
          Details with no value won't be saved.
        </p>
      )}
    </section>
  );
}

const inputCls =
  "w-full px-3 py-2 bg-white border border-rule rounded-lg text-sm text-ink placeholder-faint focus:outline-none focus:border-accent transition-colors";

export default DetailsFields;

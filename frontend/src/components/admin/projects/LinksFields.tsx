import type { LinkFormState } from "../../../hooks/useProjectFormState";
import { EMPTY_LINK } from "../../../hooks/useProjectFormState";
import type { ProjectType } from "../../../types";
import { CARD_COPY } from "../../project/cardCopy";
import { LINK_KIND_LABELS } from "../../../lib/projectLinks";
import { buttonVariants } from "@/components/ui/button";

/**
 * The outbound links editor.
 *
 * This replaced three fixed inputs — demo, GitHub, related research — which
 * meant a fourth destination cost a schema migration. `kind` is a free string:
 * the select offers the three the UI styles and labels by name, and "Custom"
 * lets anything else through with a label of its own.
 */
interface LinksFieldsProps {
  value: LinkFormState[];
  projectType: ProjectType;
  onChange: (next: LinkFormState[]) => void;
}

const KNOWN_KINDS = ["demo", "github", "research"] as const;

function LinksFields({ value, projectType, onChange }: LinksFieldsProps) {
  const { demoLabel } = CARD_COPY[projectType];

  const setRow = (index: number, patch: Partial<LinkFormState>) =>
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  /** What this row will actually render as, so the admin sees it before saving. */
  const defaultLabelFor = (kind: string) =>
    kind === "demo" ? demoLabel : (LINK_KIND_LABELS[kind] ?? "");

  return (
    <section className="border border-rule rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-ink text-sm font-medium">Links</h3>
          <p className="text-faint text-xs mt-1">
            Where this project points outside the site, in the order they show.
            The demo is styled as the primary action.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...value, { ...EMPTY_LINK }])}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          + Add link
        </button>
      </div>

      {value.length === 0 && (
        <p className="text-faint text-xs">No links yet.</p>
      )}

      {value.map((row, index) => {
        const isKnown = (KNOWN_KINDS as readonly string[]).includes(row.kind);
        const fallbackLabel = defaultLabelFor(row.kind);

        return (
          <div
            key={`link-${index}`}
            className="border border-rule-soft rounded-lg p-3 space-y-2"
          >
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] gap-2 items-end">
              <label className="block">
                <span className="block text-body text-xs mb-1.5">Kind</span>
                <select
                  value={isKnown ? row.kind : "custom"}
                  onChange={(e) =>
                    setRow(index, {
                      kind: e.target.value === "custom" ? "" : e.target.value,
                    })
                  }
                  className={inputCls}
                >
                  <option value="demo">Demo — {demoLabel}</option>
                  <option value="github">GitHub — View source</option>
                  <option value="research">Research — Related research</option>
                  <option value="custom">Custom…</option>
                </select>
              </label>

              <label className="block">
                <span className="block text-body text-xs mb-1.5">URL</span>
                <input
                  value={row.url}
                  onChange={(e) => setRow(index, { url: e.target.value })}
                  className={inputCls}
                  type="url"
                  placeholder="https://…"
                />
              </label>

              <div className="flex items-center gap-1 pb-0.5">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move link ${index + 1} up`}
                  className={buttonVariants({ variant: "ghost", size: "xs" })}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === value.length - 1}
                  aria-label={`Move link ${index + 1} down`}
                  className={buttonVariants({ variant: "ghost", size: "xs" })}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  aria-label={`Remove link ${index + 1}`}
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Only asked for when the select can't name it. */}
              {!isKnown && (
                <label className="block">
                  <span className="block text-body text-xs mb-1.5">
                    Custom kind
                  </span>
                  <input
                    value={row.kind}
                    onChange={(e) => setRow(index, { kind: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. itch, steam, figma"
                  />
                </label>
              )}

              <label className="block">
                <span className="block text-body text-xs mb-1.5">
                  Button text {fallbackLabel && "(optional)"}
                </span>
                <input
                  value={row.label}
                  onChange={(e) => setRow(index, { label: e.target.value })}
                  className={inputCls}
                  placeholder={fallbackLabel || "e.g. Play on itch.io"}
                />
              </label>
            </div>

            {!row.kind.trim() && row.url.trim() && (
              <p className="text-[#B4770B] text-xs">
                Give this link a kind, or it won't be saved.
              </p>
            )}
          </div>
        );
      })}
    </section>
  );
}

const inputCls =
  "w-full px-3 py-2 bg-white border border-rule rounded-lg text-sm text-ink placeholder-faint focus:outline-none focus:border-accent transition-colors";

export default LinksFields;

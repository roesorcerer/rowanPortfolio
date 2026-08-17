import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  /** Tags already in use elsewhere — the whole point is to reuse a spelling. */
  suggestions: string[];
  placeholder?: string;
  id?: string;
}

/**
 * Chip editor for `category`. Suggestions come from tags already on other
 * projects, which is what stops "Web App" / "Web app" / "webapp" from
 * accumulating as three different tags.
 */
function TagInput({
  value,
  onChange,
  suggestions,
  placeholder = "Add a tag…",
  id,
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  const selectedKeys = useMemo(
    () => new Set(value.map((tag) => tag.toLowerCase())),
    [value]
  );

  const matches = useMemo(() => {
    const query = draft.trim().toLowerCase();
    return suggestions
      .filter((tag) => !selectedKeys.has(tag.toLowerCase()))
      .filter((tag) => (query ? tag.toLowerCase().includes(query) : true))
      .slice(0, 6);
  }, [suggestions, selectedKeys, draft]);

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag) return;
    // Reuse the existing casing when the tag already exists somewhere else.
    const canonical =
      suggestions.find((s) => s.toLowerCase() === tag.toLowerCase()) ?? tag;
    if (!selectedKeys.has(canonical.toLowerCase())) {
      onChange([...value, canonical]);
    }
    setDraft("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      // Enter would otherwise submit the whole project form.
      e.preventDefault();
      addTag(draft);
      return;
    }
    if (e.key === "Backspace" && draft === "" && value.length > 0) {
      removeTag(value[value.length - 1]!);
    }
  }

  return (
    <div>
      <div className="w-full px-2 py-1.5 bg-white border border-rule rounded-lg focus-within:border-accent transition-colors flex flex-wrap items-center gap-1.5">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent-soft text-accent-dark text-xs"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
              className="text-accent-dark/60 hover:text-accent-dark leading-none"
            >
              ×
            </button>
          </span>
        ))}

        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(draft)}
          className="flex-1 min-w-[8rem] px-1 py-0.5 text-sm text-ink placeholder-faint bg-transparent focus:outline-none"
          placeholder={value.length === 0 ? placeholder : ""}
        />
      </div>

      {matches.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {matches.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className={cn(
                "px-2 py-0.5 rounded-md border border-rule text-faint text-xs",
                "hover:border-accent hover:text-accent-dark transition-colors"
              )}
            >
              + {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default TagInput;

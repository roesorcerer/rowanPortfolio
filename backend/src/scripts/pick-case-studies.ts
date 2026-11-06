import type { CaseStudyEntry } from "./data/case-studies";

// Reads `--only <name>` from the command line and returns the case studies to
// seed. Without `--only`, every entry is returned. The name is matched against
// each entry's `name`, ignoring case, and part of a name is enough:
//
//   npm run seed:case-studies -- --only bug --dry   -> just "Bug Cup Fill"
//
// It throws instead of returning an empty list, so a typo stops the script
// rather than quietly doing nothing.

export function pickCaseStudies(
  entries: CaseStudyEntry[],
  argv: string[]
): CaseStudyEntry[] {
  const flagIndex = argv.indexOf("--only");
  if (flagIndex === -1) return entries;

  const wanted = argv[flagIndex + 1];
  if (!wanted || wanted.startsWith("--")) {
    throw new Error('--only needs a name after it, e.g. "--only bug"');
  }

  const picked = entries.filter((entry) =>
    entry.name.toLowerCase().includes(wanted.toLowerCase())
  );

  if (picked.length === 0) {
    const names = entries.map((entry) => `"${entry.name}"`).join(", ");
    throw new Error(`--only "${wanted}" matches no case study. Names: ${names}`);
  }

  return picked;
}

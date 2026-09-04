// Field-length limits, shared by Zod request validators and Mongoose schemas
// so a single change keeps both layers in agreement. If a value lives here, no
// other file should re-declare it — Zod and Mongoose both import from here.

export const LIMITS = {
  user: {
    nameMax: 100,
    passwordMin: 8,
    passwordMax: 128,
  },
  project: {
    titleMax: 200,
    devTimeMax: 60,
    // Long enough for a real title, short enough to stay printable on a
    // resume next to the project name.
    slugMax: 120,
    caseStudyHeadingMax: 160,
    // A detail is a short named fact, not a paragraph. The caps are what
    // keeps `details` from becoming a second, unstructured case study.
    detailKeyMax: 48,
    detailLabelMax: 60,
    detailValueMax: 500,
    detailsMax: 24,
    linkLabelMax: 60,
    linkKindMax: 32,
    linksMax: 12,
    // Card blurb — one paragraph. The longest in the catalogue is ~1,350.
    descriptionMax: 4000,
    // A path ("/assets/x.png") or a URL. Deliberately far below what a
    // base64 `data:` URI needs: an image pasted inline would be stored in
    // Mongo and re-sent to every visitor on every project list, so it is
    // rejected here with a field error rather than silently accepted.
    // The longest real path in the catalogue is 76 characters.
    imageSrcMax: 512,
    // Long-form case-study prose.
    caseStudyProseMax: 4000,
    caseStudyBodyMax: 8000,
    caseStudySectionsMax: 20,
    caseStudyListItemMax: 500,
    caseStudyListMax: 20,
    sectionMediaMax: 12,
    mediaMax: 20,
  },
  contact: {
    nameMax: 100,
    subjectMax: 200,
    messageMin: 10,
    messageMax: 5000,
  },
  event: {
    typeMax: 64,
    projectIdMax: 64,
    projectTitleMax: 256,
    projectTypeMax: 32,
    linkTypeMax: 32,
  },
  tracking: {
    referrerMax: 512,
    userAgentMax: 512,
    pathMax: 512,
  },
} as const;

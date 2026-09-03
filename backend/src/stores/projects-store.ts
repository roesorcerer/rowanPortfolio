import { ProjectModel, orderGroupKey } from "../models/project.model";
import { slugify } from "../utils/slug";
import type {
  CreateProjectInput,
  ProjectCaseStudy,
  ProjectRecord,
  UpdateProjectInput,
} from "../validators/project.validators";

/**
 * A project as the rest of the backend sees it: every validated field, plus the
 * identity and timestamps Mongo adds. Derived from the validators rather than
 * restated — this used to be a second full copy of the shape, and a third lived
 * one type below it.
 */
export type Project = ProjectRecord & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * The fields the Mongoose schema gives a `default:`.
 *
 * A raw document can genuinely lack these even though every write through the
 * model supplies them: `updateOne` does not apply schema defaults to paths it
 * does not touch, so a document last written by a migration script can be
 * missing an array the schema would have defaulted. One of the live records is
 * exactly that.
 */
type DefaultedField =
  | "category"
  | "media"
  | "links"
  | "collaborators"
  | "details"
  | "featured"
  | "status"
  | "order";

/**
 * The same thing straight out of Mongo, before `_id` is stringified and before
 * the defaulted fields are guaranteed. Kept as a distinct type so `toProject`
 * stays an explicit allowlist: spreading a lean document would carry `__v` and
 * anything else the collection happens to hold onto the wire.
 */
type ProjectDoc = Omit<Project, "_id" | DefaultedField> &
  Partial<Pick<Project, DefaultedField>> & { _id: unknown };

// The nested shapes, re-exported for callers that name them.
export type {
  ProjectCaseStudy as CaseStudy,
  ProjectCaseStudySection as CaseStudySection,
  ProjectDetail,
  ProjectLink,
  ProjectMedia as ProjectMediaItem,
} from "../validators/project.validators";

function toCategories(value: string[] | undefined): string[] {
  return (value ?? []).map((tag) => tag.trim()).filter(Boolean);
}

function toProject(doc: ProjectDoc): Project {
  return {
    _id: String(doc._id),
    slug: doc.slug,
    title: doc.title,
    category: toCategories(doc.category),
    description: doc.description,
    image: doc.image,
    // The defaults live here, not just in the schema — this is the boundary
    // that makes the wire contract's "always an array" promise true.
    media: doc.media ?? [],
    links: doc.links ?? [],
    developmentTime: doc.developmentTime,
    collaborators: doc.collaborators ?? [],
    featured: doc.featured ?? false,
    projectType: doc.projectType,
    researchStatus: doc.researchStatus,
    details: doc.details ?? [],
    caseStudy: doc.caseStudy,
    status: doc.status ?? "draft",
    order: doc.order ?? 0,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function isCastError(error: unknown): boolean {
  return (error as { name?: string })?.name === "CastError";
}

// `order` is scoped to a display group, so a single global sort can't be
// "correct" for every slice at once. Sorting featured-first, then by order,
// is the one arrangement that survives every filter the site applies:
//   - filter to featured  -> the featured group, contiguous, in its own order
//   - filter to a type    -> that type's promoted work first, then the rest
//                            of the group in its own order
const LIST_SORT = { featured: -1, order: 1 } as const;

/**
 * What the public is allowed to see.
 *
 * Asks for "published" rather than "not draft" deliberately: in Mongo a
 * document with no `status` field at all satisfies `$ne: "draft"`, so the
 * looser filter published records that `toProject` then reports as drafts.
 * Naming the wanted value keeps the query and the mapper telling one story,
 * and fails closed on anything unclassifiable.
 */
const PUBLISHED_ONLY = { status: "published" } as const;

/** Public read — drafts never leave the building. */
export async function list(): Promise<Project[]> {
  const docs = await ProjectModel.find(PUBLISHED_ONLY)
    .sort(LIST_SORT)
    .lean();
  return docs.map((d) => toProject(d as ProjectDoc));
}

/** Admin read — drafts included. */
export async function listAll(): Promise<Project[]> {
  const docs = await ProjectModel.find().sort(LIST_SORT).lean();
  return docs.map((d) => toProject(d as ProjectDoc));
}

export async function findById(id: string): Promise<Project | null> {
  try {
    const doc = await ProjectModel.findById(id).lean();
    return doc ? toProject(doc as ProjectDoc) : null;
  } catch (error) {
    if (isCastError(error)) return null;
    throw error;
  }
}

/**
 * Resolves the `/projects/:idOrSlug` path segment. A slug is tried first
 * because that's what a resume prints; an ObjectId still resolves so a link
 * pasted out of the admin list keeps working.
 *
 * `publishedOnly` is the public default — a draft case study is unfinished
 * writing, and unfinished writing shouldn't be one URL guess away.
 */
export async function findByIdOrSlug(
  idOrSlug: string,
  { publishedOnly = true }: { publishedOnly?: boolean } = {}
): Promise<Project | null> {
  const visibility = publishedOnly ? PUBLISHED_ONLY : {};

  const bySlug = await ProjectModel.findOne({ slug: idOrSlug, ...visibility }).lean();
  if (bySlug) return toProject(bySlug as ProjectDoc);

  if (isObjectId(idOrSlug)) {
    const byId = await ProjectModel.findOne({ _id: idOrSlug, ...visibility }).lean();
    if (byId) return toProject(byId as ProjectDoc);
  }

  return null;
}

function isObjectId(value: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(value);
}

/**
 * A case study with nothing written in it. The admin form always sends the
 * object — that's how clearing one is distinguishable from not touching it —
 * so the store is where "empty" turns back into "absent".
 */
function isEmptyCaseStudy(caseStudy: ProjectCaseStudy | undefined): boolean {
  if (!caseStudy) return true;

  return (
    !caseStudy.summary?.trim() &&
    !caseStudy.role?.trim() &&
    !caseStudy.problem?.trim() &&
    (caseStudy.sections?.length ?? 0) === 0 &&
    (caseStudy.outcomes?.length ?? 0) === 0 &&
    (caseStudy.lessons?.length ?? 0) === 0
  );
}

// Sibling routes under /api/projects that would shadow a same-named slug.
// A project called "All" gets "all-2" instead of a permalink that resolves to
// the admin list endpoint.
const RESERVED_SLUGS = new Set(["all", "reorder"]);

/**
 * The first free permalink at or after `slugify(base)`, disambiguating with a
 * numeric suffix rather than failing. Collisions are rare enough that the
 * loop is cheaper than a regex scan of every neighbouring slug.
 */
async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  // Only reachable from a title made entirely of punctuation or emoji.
  const root = slugify(base) || "project";

  for (let attempt = 1; ; attempt += 1) {
    const candidate = attempt === 1 ? root : `${root}-${attempt}`;
    if (RESERVED_SLUGS.has(candidate)) continue;

    const taken = await ProjectModel.findOne({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
      .select("_id")
      .lean();

    if (!taken) return candidate;
  }
}

// Where a new project lands when the caller doesn't pin an order: the end of
// its own display group, so it never silently jumps the queue in another one.
async function nextOrderInGroup(input: {
  featured?: boolean;
  projectType: Project["projectType"];
}): Promise<number> {
  const groupFilter =
    orderGroupKey(input) === "featured"
      ? { featured: true }
      : { featured: { $ne: true }, projectType: input.projectType };

  const last = await ProjectModel.findOne(groupFilter)
    .sort({ order: -1 })
    .select("order")
    .lean();

  return last ? (last.order ?? 0) + 1 : 0;
}

export async function create(input: CreateProjectInput): Promise<Project> {
  const order = input.order ?? (await nextOrderInGroup(input));
  const slug = await uniqueSlug(input.slug ?? input.title);
  const doc = await ProjectModel.create({
    ...input,
    caseStudy: isEmptyCaseStudy(input.caseStudy) ? undefined : input.caseStudy,
    slug,
    order,
  });
  return toProject(doc.toObject() as ProjectDoc);
}

/**
 * Rewrites a whole group's indices in one round-trip — position in `ids`
 * becomes the new `order`. Ids that don't exist are simply not matched.
 * Returns the number of documents actually moved.
 */
export async function reorder(ids: string[]): Promise<number> {
  try {
    const result = await ProjectModel.bulkWrite(
      ids.map((id, index) => ({
        updateOne: {
          filter: { _id: id },
          update: { $set: { order: index } },
        },
      }))
    );
    return result.modifiedCount ?? 0;
  } catch (error) {
    if (isCastError(error)) return 0;
    throw error;
  }
}

export async function update(
  id: string,
  patch: UpdateProjectInput
): Promise<Project | null> {
  try {
    const current = await ProjectModel.findById(id).lean();
    if (!current) return null;

    // Promoting a project, or retyping it, moves it into a different display
    // group where its old index means nothing and would collide with whatever
    // already sits there. Re-append instead, unless the caller pinned an order.
    const next = {
      featured: patch.featured ?? current.featured,
      projectType: patch.projectType ?? current.projectType,
    };
    const changedGroup = orderGroupKey(next) !== orderGroupKey(current);
    const order =
      patch.order ??
      (changedGroup ? await nextOrderInGroup(next) : undefined);

    // A retitled project keeps its permalink: the old one may already be
    // printed on a resume, and a link that dies on a rename is worse than a
    // slug that reads slightly stale. The slug moves only when sent explicitly.
    const slug =
      patch.slug !== undefined ? await uniqueSlug(patch.slug, id) : undefined;

    // An emptied case study is removed rather than stored as a husk, so
    // `caseStudy` is either real writing or absent — never an object of
    // blanks the render side has to see through.
    const clearCaseStudy =
      patch.caseStudy !== undefined && isEmptyCaseStudy(patch.caseStudy);

    const set: Record<string, unknown> = {
      ...patch,
      ...(order === undefined ? {} : { order }),
      ...(slug === undefined ? {} : { slug }),
    };
    if (clearCaseStudy) delete set.caseStudy;

    // Mongo rejects an empty $set, and a PUT of {} is a legal no-op request.
    const update = {
      ...(Object.keys(set).length > 0 ? { $set: set } : {}),
      ...(clearCaseStudy ? { $unset: { caseStudy: 1 } } : {}),
    };

    const doc = Object.keys(update).length === 0
      ? current
      : await ProjectModel.findByIdAndUpdate(id, update, {
          returnDocument: "after",
          runValidators: true,
        }).lean();
    return doc ? toProject(doc as ProjectDoc) : null;
  } catch (error) {
    if (isCastError(error)) return null;
    throw error;
  }
}

export async function remove(id: string): Promise<boolean> {
  try {
    const doc = await ProjectModel.findByIdAndDelete(id);
    return doc !== null;
  } catch (error) {
    if (isCastError(error)) return false;
    throw error;
  }
}

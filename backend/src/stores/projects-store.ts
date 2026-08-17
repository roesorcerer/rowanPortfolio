import { ProjectModel, orderGroupKey } from "../models/project.model";
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from "../validators/project.validators";

export type Project = {
  _id: string;
  title: string;
  category: string[];
  description: string;
  image: string;
  media?: {
    type: "image" | "video";
    src: string;
    alt?: string;
    poster?: string;
    caption?: string;
  }[];
  link?: string;
  githubLink?: string;
  relatedResearchLink?: string;
  developmentTime?: string;
  collaborators?: {
    name: string;
    role?: string;
    socialLink: string;
    socialLabel?: string;
  }[];
  technologies: string[];
  featured: boolean;
  projectType: "product" | "research" | "practice" | "gameDev" | "art";
  researchStatus?: "published" | "in-revision";
  researchVenue?: string;
  researchYear?: number;
  rejectedVenue?: string;
  improvedIntoTitle?: string;
  improvedIntoLink?: string;
  improvementSummary?: string;
  practicePurpose?: string;
  status: "draft" | "published";
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

type ProjectDoc = {
  _id: unknown;
  title: string;
  // Records written before category became an array still hold a bare string.
  category: string | string[];
  description: string;
  image: string;
  media?: {
    type: "image" | "video";
    src: string;
    alt?: string;
    poster?: string;
    caption?: string;
  }[];
  link?: string;
  githubLink?: string;
  relatedResearchLink?: string;
  developmentTime?: string;
  collaborators?: {
    name: string;
    role?: string;
    socialLink: string;
    socialLabel?: string;
  }[];
  technologies?: string[];
  featured?: boolean;
  projectType: Project["projectType"];
  researchStatus?: Project["researchStatus"];
  researchVenue?: string;
  researchYear?: number;
  rejectedVenue?: string;
  improvedIntoTitle?: string;
  improvedIntoLink?: string;
  improvementSummary?: string;
  practicePurpose?: string;
  status?: Project["status"];
  order?: number;
  createdAt: Date;
  updatedAt: Date;
};

function toCategories(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value.map((tag) => tag.trim()).filter(Boolean);
  const single = value?.trim();
  return single ? [single] : [];
}

function toProject(doc: ProjectDoc): Project {
  return {
    _id: String(doc._id),
    title: doc.title,
    category: toCategories(doc.category),
    description: doc.description,
    image: doc.image,
    media: doc.media ?? [],
    link: doc.link,
    githubLink: doc.githubLink,
    relatedResearchLink: doc.relatedResearchLink,
    developmentTime: doc.developmentTime,
    collaborators: doc.collaborators ?? [],
    technologies: doc.technologies ?? [],
    featured: doc.featured ?? false,
    projectType: doc.projectType,
    researchStatus: doc.researchStatus,
    researchVenue: doc.researchVenue,
    researchYear: doc.researchYear,
    rejectedVenue: doc.rejectedVenue,
    improvedIntoTitle: doc.improvedIntoTitle,
    improvedIntoLink: doc.improvedIntoLink,
    improvementSummary: doc.improvementSummary,
    practicePurpose: doc.practicePurpose,
    // Records predating `status` were live, so they read back as published.
    status: doc.status ?? "published",
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

/** Public read — drafts never leave the building. */
export async function list(): Promise<Project[]> {
  const docs = await ProjectModel.find({ status: { $ne: "draft" } })
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
  const doc = await ProjectModel.create({ ...input, order });
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

    const doc = await ProjectModel.findByIdAndUpdate(
      id,
      order === undefined ? patch : { ...patch, order },
      {
        returnDocument: "after",
        runValidators: true,
      }
    ).lean();
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

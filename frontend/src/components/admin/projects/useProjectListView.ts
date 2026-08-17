import { useMemo, useState } from "react";
import type { Project, ProjectType } from "../../../types";
import {
  FEATURED_GROUP,
  PROJECT_TYPES,
  collectTags,
  orderGroupKey,
  orderGroupLabel,
  searchHaystack,
  type OrderGroupKey,
} from "./projectTaxonomy";

// The whole admin list is derived from one array of projects. Search,
// chip filter, tag filter, grouping and sorting are all client-side, so
// nothing here needs a round-trip.

/** Single-select chip above the list. Types overlap with "featured" by design. */
export type ChipFilter = "all" | ProjectType | "featured" | "drafts";

export type GroupBy = "type" | "status" | "none";
export type SortBy = "order" | "updated" | "title";

export interface ProjectGroup {
  key: string;
  label: string;
  projects: Project[];
  /** Size of this group before search/filters — a partial group can't be reordered. */
  total: number;
  /**
   * True when every member of the underlying order group is on screen and in
   * manual order. Reordering a filtered subset would write indices for rows
   * you can't see, so drag is only offered when this holds.
   */
  reorderable: boolean;
}

export interface ChipCount {
  filter: ChipFilter;
  label: string;
  count: number;
}

const GROUP_ORDER: OrderGroupKey[] = [FEATURED_GROUP, ...PROJECT_TYPES];

export function useProjectListView(projects: Project[] | undefined) {
  const [search, setSearch] = useState("");
  const [chip, setChip] = useState<ChipFilter>("all");
  const [tags, setTags] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState<GroupBy>("type");
  const [sortBy, setSortBy] = useState<SortBy>("order");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const all = useMemo(() => projects ?? [], [projects]);

  const drafts = useMemo(
    () => all.filter((p) => p.status === "draft").length,
    [all]
  );

  const availableTags = useMemo(() => collectTags(all), [all]);

  const chipCounts = useMemo<ChipCount[]>(() => {
    const counts: ChipCount[] = [
      { filter: "all", label: "All", count: all.length },
    ];

    for (const type of PROJECT_TYPES) {
      const count = all.filter((p) => p.projectType === type).length;
      // Hide taxonomy you aren't using — the bar stays short.
      if (count > 0) counts.push({ filter: type, label: type, count });
    }

    const featured = all.filter((p) => p.featured).length;
    if (featured > 0) {
      counts.push({ filter: "featured", label: "Featured", count: featured });
    }
    if (drafts > 0) {
      counts.push({ filter: "drafts", label: "Drafts", count: drafts });
    }

    return counts;
  }, [all, drafts]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const tagKeys = tags.map((t) => t.toLowerCase());

    return all.filter((project) => {
      if (chip === "featured" && !project.featured) return false;
      if (chip === "drafts" && project.status !== "draft") return false;
      if (
        chip !== "all" &&
        chip !== "featured" &&
        chip !== "drafts" &&
        project.projectType !== chip
      ) {
        return false;
      }

      if (tagKeys.length > 0) {
        const own = (project.category ?? []).map((t) => t.toLowerCase());
        // OR across selected tags — narrowing by every tag at once is almost
        // never what you want with a handful of projects.
        if (!tagKeys.some((tag) => own.includes(tag))) return false;
      }

      if (query && !searchHaystack(project).includes(query)) return false;

      return true;
    });
  }, [all, chip, tags, search]);

  const groups = useMemo<ProjectGroup[]>(() => {
    const sorted = sortProjects(filtered, sortBy);

    if (groupBy === "none") {
      return [
        {
          key: "all",
          label: "All projects",
          projects: sorted,
          total: all.length,
          reorderable: false,
        },
      ];
    }

    if (groupBy === "status") {
      return (["draft", "published"] as const)
        .map((status) => ({
          key: status,
          label: status === "draft" ? "Drafts" : "Published",
          projects: sorted.filter((p) => p.status === status),
          total: all.filter((p) => p.status === status).length,
          // Status groups cut across order groups, so indices there are
          // meaningless — no drag.
          reorderable: false,
        }))
        .filter((group) => group.projects.length > 0);
    }

    // groupBy === "type": buckets match the backend's order scoping exactly,
    // which is what makes drag-to-reorder a single honest write.
    const totals = new Map<string, number>();
    for (const project of all) {
      const key = orderGroupKey(project);
      totals.set(key, (totals.get(key) ?? 0) + 1);
    }

    return GROUP_ORDER.map((key) => {
      const inGroup = sorted.filter((p) => orderGroupKey(p) === key);
      const total = totals.get(key) ?? 0;
      return {
        key,
        label: orderGroupLabel(key),
        projects: inGroup,
        total,
        reorderable: sortBy === "order" && inGroup.length === total && total > 1,
      };
    }).filter((group) => group.projects.length > 0);
  }, [filtered, all, groupBy, sortBy]);

  const isFiltered =
    search.trim() !== "" || chip !== "all" || tags.length > 0;

  return {
    // state
    search,
    setSearch,
    chip,
    setChip,
    tags,
    setTags,
    groupBy,
    setGroupBy,
    sortBy,
    setSortBy,
    collapsed,
    toggleCollapsed: (key: string) =>
      setCollapsed((prev) => ({ ...prev, [key]: !prev[key] })),
    // derived
    total: all.length,
    drafts,
    availableTags,
    chipCounts,
    groups,
    visibleCount: filtered.length,
    isFiltered,
    clearFilters: () => {
      setSearch("");
      setChip("all");
      setTags([]);
    },
  };
}

function sortProjects(projects: Project[], sortBy: SortBy): Project[] {
  const copy = [...projects];

  if (sortBy === "title") {
    return copy.sort((a, b) => a.title.localeCompare(b.title));
  }
  if (sortBy === "updated") {
    return copy.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }
  // "order" is only comparable within a group; grouping happens after this,
  // so a flat sort by order is the right input for every bucket.
  return copy.sort((a, b) => a.order - b.order);
}

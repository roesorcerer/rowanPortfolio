import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useProjects,
  useAllProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useReorderProjects,
} from "./useProjects";
import * as projectsApi from "../api/projects";
import type { Project, ProjectPayload } from "../types";

const project: Project = {
  _id: "p1",
  slug: "hello",
  title: "Hello",
  category: ["Web"],
  description: "",
  image: "/x.png",
  links: [],
  media: [],
  collaborators: [],
  details: [],
  order: 0,
  featured: false,
  projectType: "product",
  status: "published",
  createdAt: "",
  updatedAt: "",
};

const payload: ProjectPayload = {
  title: "x",
  category: ["x"],
  description: "x",
  image: "/x",
  links: [],
  projectType: "product",
  featured: false,
  status: "draft",
};

function wrapper() {
  // Fresh QueryClient per test so caches don't bleed between tests.
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  function Wrap({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  }
  return { qc, Wrap };
}

describe("useProjects + mutations", () => {
  it("useProjects fetches and exposes the list", async () => {
    vi.spyOn(projectsApi, "getProjects").mockResolvedValue([project]);
    const { Wrap } = wrapper();
    const { result } = renderHook(() => useProjects(), { wrapper: Wrap });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([project]);
  });

  it("useCreateProject invalidates the projects query on success", async () => {
    const created = { ...project, _id: "new" };
    vi.spyOn(projectsApi, "createProject").mockResolvedValue(created);
    const { qc, Wrap } = wrapper();
    // Seed the cache so we can observe invalidation.
    qc.setQueryData(["projects"], [project]);

    const { result } = renderHook(() => useCreateProject(), { wrapper: Wrap });
    await act(async () => {
      await result.current.mutateAsync(payload);
    });

    expect(projectsApi.createProject).toHaveBeenCalledTimes(1);
    const state = qc.getQueryState(["projects"]);
    expect(state?.isInvalidated).toBe(true);
  });

  it("useUpdateProject calls updateProject with id + payload", async () => {
    vi.spyOn(projectsApi, "updateProject").mockResolvedValue(project);
    const { Wrap } = wrapper();
    const { result } = renderHook(() => useUpdateProject(), { wrapper: Wrap });
    await act(async () => {
      await result.current.mutateAsync({ id: "p1", payload });
    });
    expect(projectsApi.updateProject).toHaveBeenCalledWith("p1", payload);
  });

  it("useDeleteProject invalidates the projects query on success", async () => {
    vi.spyOn(projectsApi, "deleteProject").mockResolvedValue();
    const { qc, Wrap } = wrapper();
    qc.setQueryData(["projects"], [project]);

    const { result } = renderHook(() => useDeleteProject(), { wrapper: Wrap });
    await act(async () => {
      await result.current.mutateAsync("p1");
    });

    expect(projectsApi.deleteProject).toHaveBeenCalledWith("p1");
    expect(qc.getQueryState(["projects"])?.isInvalidated).toBe(true);
  });

  it("useAllProjects reads the admin endpoint under its own key", async () => {
    const draft: Project = { ...project, _id: "p2", status: "draft" };
    vi.spyOn(projectsApi, "getAllProjects").mockResolvedValue([project, draft]);
    const { qc, Wrap } = wrapper();

    const { result } = renderHook(() => useAllProjects(), { wrapper: Wrap });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([project, draft]);
    // The public key must stay untouched, or a draft could leak into the site.
    expect(qc.getQueryData(["projects"])).toBeUndefined();
  });
});

describe("useReorderProjects", () => {
  const a: Project = { ...project, _id: "a", order: 0 };
  const b: Project = { ...project, _id: "b", order: 1 };
  const c: Project = { ...project, _id: "c", order: 2 };

  it("applies the new order to the admin cache before the request resolves", async () => {
    let resolveRequest: (value: { reordered: number }) => void = () => {};
    vi.spyOn(projectsApi, "reorderProjects").mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );

    const { qc, Wrap } = wrapper();
    qc.setQueryData(["projects", "admin"], [a, b, c]);

    const { result } = renderHook(() => useReorderProjects(), { wrapper: Wrap });
    act(() => {
      result.current.mutate(["c", "a", "b"]);
    });

    await waitFor(() => {
      const cached = qc.getQueryData<Project[]>(["projects", "admin"]);
      expect(cached?.map((p) => [p._id, p.order])).toEqual([
        ["a", 1],
        ["b", 2],
        ["c", 0],
      ]);
    });

    await act(async () => {
      resolveRequest({ reordered: 3 });
    });
    expect(projectsApi.reorderProjects).toHaveBeenCalledWith(["c", "a", "b"]);
  });

  it("rolls the cache back when the request fails", async () => {
    vi.spyOn(projectsApi, "reorderProjects").mockRejectedValue(new Error("nope"));
    const { qc, Wrap } = wrapper();
    qc.setQueryData(["projects", "admin"], [a, b, c]);

    const { result } = renderHook(() => useReorderProjects(), { wrapper: Wrap });
    await act(async () => {
      result.current.mutate(["c", "a", "b"]);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(qc.getQueryData<Project[]>(["projects", "admin"])).toEqual([a, b, c]);
  });
});

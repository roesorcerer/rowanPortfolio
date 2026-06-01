import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from "./useProjects";
import * as projectsApi from "../api/projects";
import type { Project } from "../types";

const project: Project = {
  _id: "p1",
  title: "Hello",
  category: "Web",
  description: "",
  image: "/x.png",
  technologies: [],
  order: 0,
  featured: false,
  projectType: "featured",
  createdAt: "",
  updatedAt: "",
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
      await result.current.mutateAsync({
        title: "x",
        category: "x",
        description: "x",
        image: "/x",
        technologies: [],
        projectType: "featured",
        featured: false,
        order: 0,
      });
    });

    expect(projectsApi.createProject).toHaveBeenCalledTimes(1);
    const state = qc.getQueryState(["projects"]);
    expect(state?.isInvalidated).toBe(true);
  });

  it("useUpdateProject calls updateProject with id + payload", async () => {
    vi.spyOn(projectsApi, "updateProject").mockResolvedValue(project);
    const { Wrap } = wrapper();
    const { result } = renderHook(() => useUpdateProject(), { wrapper: Wrap });
    const payload = {
      title: "x",
      category: "x",
      description: "x",
      image: "/x",
      technologies: [],
      projectType: "featured" as const,
      featured: false,
      order: 0,
    };
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
});

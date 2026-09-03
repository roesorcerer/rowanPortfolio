import { act, renderHook } from "@testing-library/react";
import {
  EMPTY_FORM,
  fromProject,
  toPayload,
  useProjectFormState,
} from "./useProjectFormState";
import type { Project } from "../types";

const project: Project = {
  _id: "p1",
  slug: "hello",
  title: "Hello",
  category: ["Web", "Mobile"],
  description: "A description",
  image: "/x.png",
  media: [
    {
      type: "image",
      src: "/assets/one.png",
      alt: "Main shot",
    },
    {
      type: "video",
      src: "https://example.com/demo.mp4",
      poster: "/assets/poster.png",
    },
  ],
  links: [
    { kind: "demo", url: "https://demo.example.com" },
    { kind: "github", url: "https://github.com/x/y" },
    { kind: "research", url: "https://doi.org/example", label: "The paper" },
  ],
  developmentTime: "3 weeks",
  collaborators: [
    {
      name: "Rowan",
      role: "Developer",
      socialLink: "https://linkedin.com/in/rowan",
      socialLabel: "LinkedIn",
    },
  ],
  details: [],
  order: 2,
  featured: true,
  projectType: "product",
  status: "published",
  createdAt: "",
  updatedAt: "",
};

describe("fromProject / toPayload", () => {
  it("fromProject carries links across, blanking the absent label", () => {
    const form = fromProject(project);
    expect(form.links).toEqual([
      { kind: "demo", url: "https://demo.example.com", label: "" },
      { kind: "github", url: "https://github.com/x/y", label: "" },
      { kind: "research", url: "https://doi.org/example", label: "The paper" },
    ]);
  });

  it("fromProject coerces missing optionals to empty strings", () => {
    const sparse: Project = {
      ...project,
      links: [],
      developmentTime: undefined,
      media: [],
      collaborators: [],
    };
    const form = fromProject(sparse);
    expect(form.links).toEqual([]);
    expect(form.developmentTime).toBe("");
    expect(form.media).toEqual([]);
    expect(form.collaborators).toEqual([]);
  });

  it("toPayload lowercases link kinds and drops rows with no URL", () => {
    const payload = toPayload({
      ...EMPTY_FORM,
      links: [
        { kind: "GitHub", url: " https://github.com/x/y ", label: "" },
        // Added then abandoned — not a link.
        { kind: "demo", url: "   ", label: "" },
        { kind: "itch", url: "https://x.itch.io/y", label: " Play on itch.io " },
      ],
    });
    expect(payload.links).toEqual([
      { kind: "github", url: "https://github.com/x/y", label: undefined },
      { kind: "itch", url: "https://x.itch.io/y", label: "Play on itch.io" },
    ]);
  });

  it("toPayload converts empty optional strings to undefined", () => {
    const payload = toPayload({ ...EMPTY_FORM, developmentTime: "" });
    expect(payload.developmentTime).toBeUndefined();
  });

  it("toPayload keeps valid media and collaborators and drops incomplete rows", () => {
    const payload = toPayload({
      ...EMPTY_FORM,
      media: [
        { type: "image", src: " /shot.png ", alt: " Shot ", poster: "", caption: "" },
        { type: "video", src: "", alt: "", poster: "", caption: "" },
      ],
      collaborators: [
        {
          name: " Rowan ",
          role: " Dev ",
          socialLink: " https://linkedin.com/in/rowan ",
          socialLabel: " LinkedIn ",
        },
        { name: "", role: "", socialLink: "", socialLabel: "" },
      ],
    });

    expect(payload.media).toEqual([
      { type: "image", src: "/shot.png", alt: "Shot", poster: undefined, caption: undefined },
    ]);
    expect(payload.collaborators).toEqual([
      {
        name: "Rowan",
        role: "Dev",
        socialLink: "https://linkedin.com/in/rowan",
        socialLabel: "LinkedIn",
      },
    ]);
  });
});

describe("useProjectFormState", () => {
  it("starts empty when no initial project", () => {
    const { result } = renderHook(() => useProjectFormState(null));
    expect(result.current.form).toEqual(EMPTY_FORM);
  });

  it("starts populated from the initial project", () => {
    const { result } = renderHook(() => useProjectFormState(project));
    expect(result.current.form.title).toBe("Hello");
    expect(result.current.form.links).toHaveLength(3);
  });

  it("setField updates one field without clobbering the rest", () => {
    const { result } = renderHook(() => useProjectFormState(project));
    act(() => result.current.setField("title", "Renamed"));
    expect(result.current.form.title).toBe("Renamed");
    expect(result.current.form.category).toEqual(["Web", "Mobile"]);
  });

  it("payload reflects the current form state", () => {
    const { result } = renderHook(() => useProjectFormState(project));
    act(() => result.current.setField("links", []));
    act(() => result.current.setField("category", ["Vue", "Pinia"]));
    expect(result.current.payload.links).toEqual([]);
    expect(result.current.payload.category).toEqual(["Vue", "Pinia"]);
  });
});

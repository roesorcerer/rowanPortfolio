import type { ImgHTMLAttributes } from "react";

// An <img> that offers the build's compressed copies when there are any.
//
// scripts/optimize-images.mjs writes AVIF and WebP copies of everything in
// public/assets at a few widths, and a manifest of what it wrote. For a src
// in that manifest this renders a <picture> with both formats in srcset,
// plus the original's width and height, so the browser reserves the space
// before the file arrives and the page doesn't jump (CLS). For anything
// else (an external URL, an image added through the admin since the last
// build, a dev server that never ran the script) it is a plain <img>, which
// is exactly what was there before.
//
// The manifest is read with import.meta.glob rather than imported, because
// it is a build output and gitignored: a glob that matches nothing is an
// empty object, so type-checking, tests and `npm start` work on a fresh
// checkout. The browser and server bundles are both built after the script
// runs, so they read the same manifest and the prerendered HTML hydrates.

export interface ImageEntry {
  width: number;
  height: number;
  widths: number[];
}

const found = import.meta.glob<{ default: Record<string, ImageEntry> }>(
  "../generated/images.json",
  { eager: true }
);
const MANIFEST: Record<string, ImageEntry> =
  Object.values(found)[0]?.default ?? {};

const FORMATS = ["avif", "webp"] as const;

/** The manifest entry for a stored image path, if the build optimized it. */
export function optimizedImage(src: string): ImageEntry | undefined {
  return MANIFEST[src];
}

export function srcSet(
  src: string,
  entry: Pick<ImageEntry, "widths">,
  format: string
): string {
  // Mirrors the script's naming: /assets/a/b.png -> /img/a/b-480.avif
  const base = src.replace(/^\/assets\//, "/img/").replace(/\.[^./]+$/, "");
  return entry.widths.map((w) => `${base}-${w}.${format} ${w}w`).join(", ");
}

type PictureProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "srcSet" | "width" | "height" | "loading" | "alt"
> & {
  src: string;
  /** Required, even if empty: an empty alt is how a decorative image says so. */
  alt: string;
  /**
   * How wide the image renders, as a sizes attribute, so the browser picks
   * the smallest copy that fills it. Defaults to the full viewport, which is
   * never wrong, only sometimes wasteful.
   */
  sizes?: string;
  /**
   * The page's largest image, the one that decides when it looks loaded
   * (LCP): fetched eagerly and ahead of other images. Everything else waits
   * until it nears the viewport.
   */
  priority?: boolean;
};

export default function Picture({
  src,
  alt,
  sizes = "100vw",
  priority = false,
  ...rest
}: PictureProps) {
  const entry = optimizedImage(src);
  const img = (
    <img
      {...rest}
      src={src}
      alt={alt}
      width={entry?.width}
      height={entry?.height}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "auto" : "async"}
      // Lowercase on purpose. React 18 knows the attribute only by its
      // camelCase name in the types and warns that it doesn't recognize it
      // on the element; React 19 renders it natively. Remove the spread
      // for a plain fetchPriority prop on upgrading.
      {...(priority ? { fetchpriority: "high" } : {})}
    />
  );
  if (!entry) return img;

  // display: contents (index.css), so the wrapper adds no box and every
  // existing `.thumb img`-style rule still sizes the image as before.
  return (
    <picture className="picture">
      {FORMATS.map((format) => (
        <source
          key={format}
          type={`image/${format}`}
          srcSet={srcSet(src, entry, format)}
          sizes={sizes}
        />
      ))}
      {img}
    </picture>
  );
}

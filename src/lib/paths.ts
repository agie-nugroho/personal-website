/**
 * Prefix a root-absolute path with Astro's configured `base`.
 *
 * GitHub Pages serves project sites from `/<repo>/`, so every link written as
 * "/work/…", "/#contact" or "/cv/…" would break. `BASE_URL` is the configured
 * base without a trailing slash ("/personal-website", or "" when none is set),
 * so join the two halves explicitly.
 */
const base = import.meta.env.BASE_URL.replace(/\/+$/, "");

export function withBase(path: string): string {
  return `${base}/${path.replace(/^\/+/, "")}`;
}

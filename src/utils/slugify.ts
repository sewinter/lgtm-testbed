/**
 * URL-safe slug generation utilities.
 *
 * Slugs are used for human-readable URL paths. They contain only
 * lowercase alphanumeric characters and hyphens.
 */

/**
 * Convert an arbitrary string into a URL-safe slug.
 * Strips non-alphanumeric characters and collapses runs of hyphens.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Check whether a string is already a valid slug.
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Generate a unique slug from a title and an ID.
 * Appends the first 8 characters of the ID for uniqueness.
 */
export function generateSlug(title: string, id: string): string {
  const base = slugify(title);
  const short = id.slice(0, 8);
  return `${base}-${short}`;
}

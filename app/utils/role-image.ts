/**
 * Resolves a role image URL to the local optimized WebP version.
 * Role images are pre-downloaded and optimized at build time
 * via `scripts/optimize-role-images.ts`.
 *
 * Extracts the role ID from the original GitHub URL and maps
 * it to `/roles/{id}.webp` in the public directory.
 */
export function resolveRoleImage(
  imageUrl: string | null | undefined,
): string | null {
  if (!imageUrl) return null

  // Extract role ID from URL like:
  // https://raw.githubusercontent.com/.../empath.png -> empath
  const match = imageUrl.match(/\/([^/]+)\.png$/)
  if (match) {
    return `/roles/${match[1]}.webp`
  }

  // Fallback: already a local path or unknown format
  if (imageUrl.startsWith('/roles/')) {
    return imageUrl
  }

  return imageUrl
}

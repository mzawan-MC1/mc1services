/**
 * Returns a right-sized, WebP rendition of an image URL for display.
 *
 * - Supabase Storage public objects are routed through the project's image
 *   transformation endpoint (resize + WebP), so browsers download a small
 *   rendition instead of the full-size original. Originals stay untouched.
 * - Unsplash URLs get their width/quality params capped.
 * - Anything else (external URLs, SVGs, GIFs, videos, data URIs) is returned
 *   unchanged.
 */
const SKIP_EXT = /\.(svg|gif|mp4|webm|ogg|mov)(\?|#|$)/i;

export function optimizeImageUrl(url, width = 800) {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (SKIP_EXT.test(url)) return url;

  // Supabase Storage: /storage/v1/object/public/... -> /storage/v1/render/image/public/...
  // resize=contain is REQUIRED: with width only, the transform otherwise keeps the
  // original height and center-crops the sides instead of scaling proportionally.
  if (url.includes('/storage/v1/object/public/')) {
    const base = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}width=${width}&quality=75&format=webp&resize=contain`;
  }

  // Unsplash CDN: cap the requested width/quality (fit=max = proportional scale).
  if (url.includes('images.unsplash.com')) {
    try {
      const u = new URL(url);
      u.searchParams.set('w', String(width));
      u.searchParams.set('q', '75');
      u.searchParams.set('fit', 'max');
      if (!u.searchParams.has('auto')) u.searchParams.set('auto', 'format');
      return u.toString();
    } catch {
      return url;
    }
  }

  return url;
}

export default optimizeImageUrl;

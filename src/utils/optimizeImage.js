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
  if (url.includes('/storage/v1/object/public/')) {
    const base = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}width=${width}&quality=75&format=webp`;
  }

  // Unsplash CDN: cap the requested width/quality.
  if (url.includes('images.unsplash.com')) {
    try {
      const u = new URL(url);
      u.searchParams.set('w', String(width));
      u.searchParams.set('q', '75');
      if (!u.searchParams.has('auto')) u.searchParams.set('auto', 'format');
      if (!u.searchParams.has('fit')) u.searchParams.set('fit', 'crop');
      return u.toString();
    } catch {
      return url;
    }
  }

  return url;
}

export default optimizeImageUrl;

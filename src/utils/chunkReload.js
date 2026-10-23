// Self-healing for stale-deploy chunk failures.
//
// Every deploy produces new content-hashed JS chunks. If a visitor's
// browser (or an edge cache) still holds the previous page shell, it
// asks for chunk files that no longer exist and the app crashes. The
// cure is one fresh page load, which revalidates the shell (served
// no-store) and picks up the matching chunks. Reload at most once per
// 15 seconds so a genuinely broken build never loops forever.

const KEY = 'mc1-chunk-reload-at';

export function isChunkLoadError(error) {
  const text = `${error?.name || ''} ${error?.message || error || ''}`;
  return /chunkloaderror|failed to fetch dynamically imported module|importing a module script failed|failed to load module script|preload/i.test(text);
}

export function reloadOnceForStaleChunks() {
  try {
    const last = Number(sessionStorage.getItem(KEY) || 0);
    if (Date.now() - last < 15000) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    // sessionStorage unavailable (rare) — still reload once per call site.
  }
  window.location.reload();
  return true;
}

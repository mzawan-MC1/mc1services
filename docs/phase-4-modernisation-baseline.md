# Phase 4 modernisation baseline

Recorded: 2026-09-09

This baseline was recorded before dependency, performance, SEO, accessibility, or visual modernisation changes. The results below were updated after the first local Phase 4 checkpoints. No final production package, deployment, database change, or live-site change was performed.

## Version-control foundation

- A local Git repository was initialised on branch `main`.
- Private GitHub remote: `https://github.com/mzawan-MC1/mc1services.git`
- Local `main` tracks `origin/main`; the initial remote commit was verified to match the local commit.
- Local baseline commit: `deb8baa chore: establish secured project baseline`.
- Local dependency checkpoint: `ae68ea4 fix: update vulnerable production dependencies`.
- `.env*`, `node_modules/`, `dist/`, `backups/`, `releases/`, and `.vercel/` are ignored.
- `.env.local` was confirmed ignored without reading or recording secret values.

## Urgent dependency findings

The initial `npm audit --omit=dev` reported 12 production-tree advisories: 1 critical, 7 high, 3 moderate, and 1 low.

- `jspdf` is directly used by the PDF editor and image-to-PDF tool. The installed 3.0.4 release is affected; the reported fix requires 4.2.1 or newer and therefore needs functional regression testing.
- `react-router-dom` and `react-router` are directly used throughout public and administrator navigation. The installed 7.10.1 release is affected; 7.18.3 is available within the declared version range.
- `i18next-http-backend` is a direct dependency but is not imported or used. Translations are bundled locally, so this package can be removed.
- Vulnerable transitive packages include `dompurify`, `fflate`, `lodash`, `nanoid`, `picomatch`, `postcss-selector-parser`, and `ws`.
- Targeted dependency updates were completed locally. The unused `i18next-http-backend` package was removed, jsPDF imports were migrated for version 4 compatibility, and `npm audit --omit=dev` now reports zero vulnerabilities.
- The jsPDF smoke test generated a valid in-memory PDF, and an isolated production build completed successfully. Temporary test output was removed.

## Performance and maintainability findings

- Public and administrator routes are now lazy-loaded from `src/pages/index.jsx`, while the home page and shared layout remain eager for a stable first render.
- The main JavaScript chunk fell from approximately 2.52 MB minified / 709 KB gzip to 874 KB minified / 259 KB gzip, a reduction of about 65%.
- An accessible loading state and an explicit 404 page were added.
- Local runtime checks passed for Home, Contact, Tools, Admin Login, an unknown route, and unauthenticated administrator-route redirection.
- Targeted lint for `src/pages/index.jsx` passed. The project-wide lint still reports 891 pre-existing issues (881 errors and 10 warnings), mainly unused imports and missing PropTypes; these remain tracked technical debt.
- `src/pages/AdminTaskDetailsPage.jsx` is approximately 97 KB of source and should be split later for maintainability.
- The router retains duplicate case variants for compatibility; the missing not-found route has now been addressed.

## SEO and link findings

- `index.html` references `/vite.svg`, but no such asset exists in `public`; the favicon request is broken.
- `public` contains only `.htaccess`; deployed static `robots.txt` and `sitemap.xml` files are not present in the repository.
- The initial HTML contains only a generic title and no description, canonical URL, Open Graph tags, or Twitter-card tags.
- Database-managed SEO is applied client-side after React and Supabase load. Social preview crawlers and non-JavaScript crawlers may therefore receive incomplete metadata.
- The administrator SEO screen downloads `robots.txt` and `sitemap.xml` to the browser but does not publish them to the static hosting folder.
- Several example URLs exist as administrator field placeholders or demo-tool inputs; these should not be treated as confirmed public broken links without runtime content inspection.

### SEO foundation completed locally

- Replaced the broken `/vite.svg` reference with a version-controlled brand favicon.
- Added safe initial HTML description, robots, Open Graph, and Twitter-card metadata. Database-managed page SEO remains authoritative after the application loads.
- Added route-aware canonical URLs and `noindex, nofollow` defaults for administrator routes.
- Added version-controlled `robots.txt` and a valid `sitemap.xml` containing 18 confirmed public routes.
- Local HTTP and isolated production-build checks passed.

## Accessibility and mobile findings

- Static inspection found image elements without explicit alternative text in administrator task attachments and several multiline image components that require runtime verification.
- The application supports responsive Tailwind layouts, but a structured small-screen regression pass is still needed for navigation, forms, admin tables, task details, tools, and RTL Arabic layouts.
- Heading use is extensive and should be checked page-by-page for one clear primary heading and logical nesting.
- A proper not-found page and loading fallback will improve keyboard and screen-reader orientation when route lazy loading is introduced.

### Accessibility foundation completed locally

- Added missing alternative text to administrator attachment images.
- Added expanded-state and controlled-region relationships to contact FAQ buttons.
- Added accessible names and expanded-state relationships to desktop and mobile navigation controls.
- Source assertions report zero image elements missing an `alt` attribute, and the isolated production build passes.
- A full visual small-screen regression remains required before deploying the Phase 4 package.

## Recommended implementation order

1. Create a local baseline Git commit. Completed.
2. Apply targeted dependency security updates and run focused PDF, routing, authentication, admin, and production-build checks. Completed.
3. Introduce route-level lazy loading with a stable accessible loading fallback. Completed locally; deployment remains separately controlled.
4. Fix the favicon and add version-controlled static SEO files with safe defaults. Completed locally.
5. Improve initial metadata behavior and audit canonical/locale handling. Initial defaults completed; locale-specific review remains.
6. Perform public/admin mobile and accessibility regression checks, then address confirmed issues. Confirmed source issues corrected; visual small-screen regression remains.
7. Begin visual and business-content modernisation only after the technical foundation is stable.
## Phase 4 completion update

Recorded: 2026-09-09

- Administrator routes now share one persistent protected shell. Moving among Dashboard, Tasks, Portfolio, FAQ, Testimonials, Site Settings, SEO Settings, User Management, Role Management, and Profile no longer remounts the sidebar or repeats the administrator check.
- Nested legacy AdminRoute and AdminLayout wrappers remain compatible but bypass duplicate work inside the shared shell.
- Tools load their implementation only when opened. The unused Recharts dependency and chart wrapper were removed; the analytics view now uses a lightweight accessible CSS chart.
- Stable vendor chunking reduced the main JavaScript entry from approximately 882 KB / 261 KB gzip to 244 KB / 70 KB gzip. No generated chunk exceeds Vite's 500 KB warning threshold.
- Full npm audit and production-only npm audit --omit=dev both report zero vulnerabilities. The unused @flydotio/dockerfile development dependency was removed.
- Full-project lint improved from 822 errors and 10 warnings to zero errors and zero warnings. Unused imports and dead state were removed, real hook dependencies were corrected, ESM configuration was fixed, and markup issues were repaired.
- The FAQ editor's undefined direct Supabase reference was replaced with the existing dataLayer.faqs API, preserving the application's single database abstraction.
- A client-logo form state bug was corrected so the visible form closes after a successful save.
- Temporary production builds, public Tools rendering, and unauthenticated administrator-route redirection all pass locally. Temporary build output and browser tabs were removed.
- Signed-in administrator navigation must be smoke-tested after the package is deployed because authentication storage is origin-specific. No final dist, deployment, database mutation, or live-site change was performed for this update.

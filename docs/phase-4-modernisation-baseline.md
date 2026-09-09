# Phase 4 modernisation baseline

Recorded: 2026-09-09

This baseline was recorded before dependency, performance, SEO, accessibility, or visual modernisation changes. No production build, deployment, database change, or live-site change was performed.

## Version-control foundation

- A local Git repository was initialised on branch `main`.
- No remote is configured.
- No file has been staged or committed.
- `.env*`, `node_modules/`, `dist/`, `backups/`, `releases/`, and `.vercel/` are ignored.
- `.env.local` was confirmed ignored without reading or recording secret values.

## Urgent dependency findings

`npm audit --omit=dev` reported 12 production-tree advisories: 1 critical, 7 high, 3 moderate, and 1 low.

- `jspdf` is directly used by the PDF editor and image-to-PDF tool. The installed 3.0.4 release is affected; the reported fix requires 4.2.1 or newer and therefore needs functional regression testing.
- `react-router-dom` and `react-router` are directly used throughout public and administrator navigation. The installed 7.10.1 release is affected; 7.18.3 is available within the declared version range.
- `i18next-http-backend` is a direct dependency but is not imported or used. Translations are bundled locally, so this package can be removed.
- Vulnerable transitive packages include `dompurify`, `fflate`, `lodash`, `nanoid`, `picomatch`, `postcss-selector-parser`, and `ws`.
- A dry-run only was performed. No package or lockfile was changed.

## Performance and maintainability findings

- Every public page, administrator page, business tool, PDF tool, and route is eagerly imported by `src/pages/index.jsx`.
- The production main JavaScript chunk is approximately 2.48 MB minified and 697 KB gzip.
- Route-level lazy loading is the highest-value first performance change and should isolate administrator and specialist tool code from ordinary public-page visits.
- `src/pages/AdminTaskDetailsPage.jsx` is approximately 97 KB of source and should be split later for maintainability.
- The router generates duplicate case variants and has no explicit not-found route.

## SEO and link findings

- `index.html` references `/vite.svg`, but no such asset exists in `public`; the favicon request is broken.
- `public` contains only `.htaccess`; deployed static `robots.txt` and `sitemap.xml` files are not present in the repository.
- The initial HTML contains only a generic title and no description, canonical URL, Open Graph tags, or Twitter-card tags.
- Database-managed SEO is applied client-side after React and Supabase load. Social preview crawlers and non-JavaScript crawlers may therefore receive incomplete metadata.
- The administrator SEO screen downloads `robots.txt` and `sitemap.xml` to the browser but does not publish them to the static hosting folder.
- Several example URLs exist as administrator field placeholders or demo-tool inputs; these should not be treated as confirmed public broken links without runtime content inspection.

## Accessibility and mobile findings

- Static inspection found image elements without explicit alternative text in administrator task attachments and several multiline image components that require runtime verification.
- The application supports responsive Tailwind layouts, but a structured small-screen regression pass is still needed for navigation, forms, admin tables, task details, tools, and RTL Arabic layouts.
- Heading use is extensive and should be checked page-by-page for one clear primary heading and logical nesting.
- A proper not-found page and loading fallback will improve keyboard and screen-reader orientation when route lazy loading is introduced.

## Recommended implementation order

1. Create a local baseline Git commit.
2. Apply targeted dependency security updates and run focused PDF, routing, authentication, admin, and production-build checks.
3. Introduce route-level lazy loading with a stable accessible loading fallback.
4. Fix the favicon and add version-controlled static SEO files with safe defaults.
5. Improve initial metadata behavior and audit canonical/locale handling.
6. Perform public/admin mobile and accessibility regression checks, then address confirmed issues.
7. Begin visual and business-content modernisation only after the technical foundation is stable.

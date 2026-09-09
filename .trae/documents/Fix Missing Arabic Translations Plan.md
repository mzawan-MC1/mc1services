I will systematically audit and update the frontend codebase to ensure full Arabic language support.

### Phase 1: Translation Files Expansion
I will significantly expand `src/locales/en/common.json` and `src/locales/ar/common.json` to include missing keys for:
- **Tools Page:** Categories, tool titles, descriptions, FAQs, and "About" section.
- **Home Page:** Fallback text for Hero, Service pills, and other sections.
- **Portfolio Detail:** Labels for "Project Overview", "Challenges", "Solutions", "Results", "Tech Stack", "Gallery".
- **General UI:** Breadcrumbs, buttons ("Open Tool", "View Results"), and common labels.

### Phase 2: Component Updates
I will update the following key components to replace hardcoded strings with `t()` calls and `getLocalizedValue()`:

1.  **`src/pages/Tools.jsx`**:
    - Refactor `categories` and `toolsList` to use translation keys.
    - Translate all UI text (Hero, About, FAQs).

2.  **`src/components/home/HeroSection.jsx`**:
    - Implement `getLocalizedValue` to correctly display Arabic content from the database.
    - Use `t()` for fallback values (e.g., button text).

3.  **`src/pages/PortfolioDetail.jsx`**:
    - Use `getLocalizedValue` for dynamic fields (`title`, `description`, `challenges`, `solutions`, `results`).
    - Translate static labels.

4.  **`src/components/layout/Footer.jsx`**:
    - Ensure all links and copyright text are translated.

### Phase 3: Database Integration Check
- I have verified that the database schema supports `_ar` columns (`title_ar`, `description_ar`, etc.).
- I will ensure the frontend components (`PortfolioDetail`, `HeroSection`) correctly attempt to fetch these Arabic fields when the language is set to 'ar'.

### Verification
- I will ensure no hardcoded English text remains in the updated files.
- I will verify that `useTranslation` hook is correctly implemented to trigger re-renders on language change.

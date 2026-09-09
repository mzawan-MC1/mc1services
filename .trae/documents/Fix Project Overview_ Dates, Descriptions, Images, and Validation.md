## Plan to Audit and Fix Project Overview Interface

### 1. Fix Dates (Frontend & Backend)
*   **Problem:** `completion_date` is missing from the Admin Form and Detail View.
*   **Action:**
    *   **Backend:** Confirm `completion_date` column exists (it does in `portfolio` table).
    *   **Admin Edit:** Add a date input for `Completed Date` mapped to `completion_date` in `AdminPortfolioEdit.jsx`.
    *   **Detail Page:** In `PortfolioDetail.jsx`, display `Completed Date` alongside `Project Date`.

### 2. Fix Long Description (Frontend)
*   **Problem:** `long_description` is not rendered on the detail page.
*   **Action:**
    *   **Detail Page:** Add a section in `PortfolioDetail.jsx` to render `portfolio.long_description` (likely below the intro or in the details sidebar/main content).

### 3. Fix Gallery Images (Backend Binding & Frontend)
*   **Problem:** Gallery images uploaded but not appearing/editable.
*   **Action:**
    *   **Admin Edit:** The `GalleryUpload` component seems to work locally but we need to ensure `useEffect` in `AdminPortfolioEdit` correctly populates `formData.gallery_items` from the fetched `images` query.
    *   **Data Layer:** Verify `dataLayer.portfolio.getImages` returns the correct structure matching `GalleryUpload` expectations.
    *   **Bug Fix:** In `AdminPortfolioEdit.jsx`, `gallery_items` initialization inside `useEffect` maps `images` to `gallery_items`. I need to ensure `images` query actually returns data. The query key is `['portfolio-images', id]`. I will check if `setFormData` logic is robust.
    *   **Sync Issue:** `GalleryUpload` manages its own local state `items`. When `formData.gallery_items` changes from parent (fetch complete), `GalleryUpload` needs to react to it. Currently, `GalleryUpload` initializes state from `value` prop only on mount (`useState(value...)`). **This is a bug.** It won't update when `value` changes after fetch. I need to add a `useEffect` in `GalleryUpload` to sync local state with `value` prop.

### 4. Fix Main Image (Listing & Detail)
*   **Problem:** Listings show placeholder/wrong image.
*   **Action:**
    *   **Listing:** Update `PortfolioCard.jsx` to prioritize `portfolio.main_image_url` over `portfolio.image_url`.
    *   **Detail:** `PortfolioDetail.jsx` already uses `main_image_url`. I will double check.
    *   **Admin:** Ensure `FileUpload` binds to `main_image_url`.

### 5. Image Size Enforcement
*   **Problem:** No validation for image dimensions.
*   **Action:**
    *   **FileUpload:** Add props `minWidth`, `minHeight`, `maxWidth`, `maxHeight` (or `targetDimensions`). Add logic to load image into an `Image` object before upload, check dimensions, and reject if invalid.
    *   **GalleryUpload:** Pass similar constraints to the internal file handling.
    *   **UI:** Add helper text in `AdminPortfolioEdit` specifying "1200x800" for main and "1000x700" for gallery.

### 6. Data Consistency
*   **Action:** Verify the payload in `AdminPortfolioEdit` maps `completion_date` correctly.

## Step-by-Step Implementation

1.  **Update `GalleryUpload.jsx`**:
    *   Add `useEffect` to sync `items` when `value` prop changes.
    *   Add image dimension validation logic.
2.  **Update `FileUpload.jsx`**:
    *   Add image dimension validation logic.
3.  **Update `AdminPortfolioEdit.jsx`**:
    *   Add `Completed Date` input.
    *   Pass dimension props to `FileUpload` and `GalleryUpload`.
    *   Add helper text for dimensions.
    *   Ensure `completion_date` is in `formData` and `saveMutation`.
4.  **Update `PortfolioDetail.jsx`**:
    *   Render `long_description`.
    *   Render `completion_date`.
5.  **Update `PortfolioCard.jsx`**:
    *   Use `main_image_url` as primary source.

I will start by creating the todo list.
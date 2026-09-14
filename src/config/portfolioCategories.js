export const PORTFOLIO_CATEGORIES_SETTING_KEY = 'portfolio_categories';

export const DEFAULT_PORTFOLIO_CATEGORIES = [
  { value: 'web_development', label: 'Web Development', label_ar: 'تطوير الويب', is_active: true },
  { value: 'app_development', label: 'App Development', label_ar: 'تطوير التطبيقات', is_active: true },
  { value: 'digital_marketing', label: 'Digital Marketing', label_ar: 'التسويق الرقمي', is_active: true },
  { value: 'production', label: 'Production', label_ar: 'الإنتاج', is_active: true },
  { value: 'it_services', label: 'IT Services', label_ar: 'خدمات تقنية المعلومات', is_active: true },
  { value: 'development', label: 'Development', label_ar: 'التطوير', is_active: true },
  { value: 'apps', label: 'Apps', label_ar: 'التطبيقات', is_active: true },
  { value: 'marketing', label: 'Marketing', label_ar: 'التسويق', is_active: true },
  { value: 'branding', label: 'Branding', label_ar: 'الهوية التجارية', is_active: true },
  { value: 'creative', label: 'Creative', label_ar: 'الإبداع', is_active: true }
].map((category, index) => ({ ...category, display_order: index }));

export const toPortfolioCategoryKey = (value) => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

const cleanCategory = (category, index) => ({
  value: toPortfolioCategoryKey(category?.value),
  label: String(category?.label || '').trim(),
  label_ar: String(category?.label_ar || '').trim(),
  is_active: category?.is_active !== false,
  display_order: Number.isFinite(Number(category?.display_order)) ? Number(category.display_order) : index
});

export const normalizePortfolioCategories = (rawValue) => {
  try {
    const parsed = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_PORTFOLIO_CATEGORIES.map((category) => ({ ...category }));
    const seen = new Set();
    const normalized = parsed
      .map(cleanCategory)
      .filter((category) => {
        if (!category.value || !category.label || seen.has(category.value)) return false;
        seen.add(category.value);
        return true;
      })
      .sort((a, b) => a.display_order - b.display_order)
      .map((category, index) => ({ ...category, display_order: index }));
    return normalized.length ? normalized : DEFAULT_PORTFOLIO_CATEGORIES.map((category) => ({ ...category }));
  } catch {
    return DEFAULT_PORTFOLIO_CATEGORIES.map((category) => ({ ...category }));
  }
};

export const serializePortfolioCategories = (categories) => JSON.stringify(
  categories.map(cleanCategory).map((category, index) => ({ ...category, display_order: index }))
);

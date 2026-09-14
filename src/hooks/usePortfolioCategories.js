import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';

export const usePortfolioCategories = () => useQuery({
  queryKey: ['portfolio-categories'],
  queryFn: () => dataLayer.portfolioCategories.getAll(),
  staleTime: 5 * 60 * 1000
});

export const formatPortfolioCategoryKey = (value) => String(value || '')
  .split('_')
  .filter(Boolean)
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

export const getPortfolioCategoryLabel = (categories, value, language = 'en') => {
  const category = categories.find((item) => item.value === value);
  if (!category) return formatPortfolioCategoryKey(value);
  return language === 'ar' && category.label_ar ? category.label_ar : category.label;
};


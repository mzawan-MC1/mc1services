import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from './dataLayer';
import { useTranslation } from 'react-i18next';
import { getSeoDefaults } from '../config/seoDefaults';

const DEFAULT_OG_IMAGE = 'https://mc1services.com/og-cover.jpg';

const setMeta = (selector, attribute, value) => {
  let element = document.querySelector(selector);
  if (!value) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement('meta');
    const [name, key] = attribute;
    element.setAttribute(name, key);
    document.head.appendChild(element);
  }
  element.content = value;
};

export default function SEOHead({ pageIdentifier }) {
  const { i18n } = useTranslation();
  const { data: seoData, isFetched } = useQuery({
    queryKey: ['page-seo', pageIdentifier],
    queryFn: async () => {
      const results = await dataLayer.pageSEO.getByPage(pageIdentifier);
      return results[0] || null;
    },
    enabled: !!pageIdentifier
  });

  useEffect(() => {
    if (!isFetched) return;

    const isAr = i18n.language === 'ar';
    const defaults = getSeoDefaults(pageIdentifier);
    const getVal = (keyAr, keyEn) => {
      if (!seoData) return undefined;
      if (isAr && seoData[keyAr]) return seoData[keyAr];
      return seoData[keyEn];
    };

    const title = getVal('meta_title_ar', 'meta_title') || (isAr ? defaults.titleAr : defaults.title);
    const description = getVal('meta_description_ar', 'meta_description') || (isAr ? defaults.descriptionAr : defaults.description);
    const ogTitle = getVal('og_title_ar', 'og_title') || title;
    const ogDescription = getVal('og_description_ar', 'og_description') || description;

    document.title = title;
    setMeta('meta[name="description"]', ['name', 'description'], description);
    setMeta('meta[name="robots"]', ['name', 'robots'], seoData?.robots || 'index, follow');

    const keywords = getVal('meta_keywords_ar', 'meta_keywords');
    setMeta('meta[name="keywords"]', ['name', 'keywords'], keywords || '');

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = seoData?.canonical_url || new URL(window.location.pathname, window.location.origin).href;

    setMeta('meta[property="og:title"]', ['property', 'og:title'], ogTitle);
    setMeta('meta[property="og:description"]', ['property', 'og:description'], ogDescription);
    setMeta('meta[property="og:url"]', ['property', 'og:url'], canonical.href);
    const ogImage = getVal('og_image_ar', 'og_image') || DEFAULT_OG_IMAGE;
    setMeta('meta[property="og:image"]', ['property', 'og:image'], ogImage);
    setMeta('meta[name="twitter:image"]', ['name', 'twitter:image'], ogImage);
    setMeta('meta[name="twitter:card"]', ['name', 'twitter:card'], 'summary_large_image');
    setMeta('meta[name="twitter:title"]', ['name', 'twitter:title'], ogTitle);
    setMeta('meta[name="twitter:description"]', ['name', 'twitter:description'], ogDescription);
  }, [seoData, isFetched, i18n.language, pageIdentifier]);

  return null;
}
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from './dataLayer';
import { useTranslation } from 'react-i18next';

export default function SEOHead({ pageIdentifier }) {
  const { i18n } = useTranslation();
  const { data: seoData } = useQuery({
    queryKey: ['page-seo', pageIdentifier],
    queryFn: async () => {
      // Assuming pageIdentifier maps to page_path in our new schema
      const results = await dataLayer.pageSEO.getByPage(pageIdentifier);
      return results[0] || null;
    },
    enabled: !!pageIdentifier
  });

  useEffect(() => {
    if (!seoData) return;

    const isAr = i18n.language === 'ar';

    // Helper to get localized value with fallback
    const getVal = (keyAr, keyEn) => {
      if (isAr && seoData[keyAr]) return seoData[keyAr];
      return seoData[keyEn];
    };

    // Set title
    const title = getVal('meta_title_ar', 'meta_title');
    if (title) {
      document.title = title;
    }

    // Set meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    const desc = getVal('meta_description_ar', 'meta_description');
    if (desc) {
      metaDesc.content = desc;
    }

    // Set meta keywords
    const keywords = getVal('meta_keywords_ar', 'meta_keywords');
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.name = 'keywords';
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.content = keywords;
    }

    // Set canonical URL (usually same for both unless specified otherwise, keeping common for now)
    if (seoData.canonical_url) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = seoData.canonical_url;
    }

    // Set robots
    if (seoData.robots) {
      let robots = document.querySelector('meta[name="robots"]');
      if (!robots) {
        robots = document.createElement('meta');
        robots.name = 'robots';
        document.head.appendChild(robots);
      }
      robots.content = seoData.robots;
    }

    // Set Open Graph tags
    const ogTitle = getVal('og_title_ar', 'og_title');
    if (ogTitle) {
      let ogTitleElem = document.querySelector('meta[property="og:title"]');
      if (!ogTitleElem) {
        ogTitleElem = document.createElement('meta');
        ogTitleElem.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitleElem);
      }
      ogTitleElem.content = ogTitle;
    }

    const ogDesc = getVal('og_description_ar', 'og_description');
    if (ogDesc) {
      let ogDescElem = document.querySelector('meta[property="og:description"]');
      if (!ogDescElem) {
        ogDescElem = document.createElement('meta');
        ogDescElem.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescElem);
      }
      ogDescElem.content = ogDesc;
    }

    if (seoData.og_image) {
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      ogImage.content = seoData.og_image;
    }
  }, [seoData, i18n.language]);

  return null;
}
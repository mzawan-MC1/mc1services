import { useEffect } from 'react';

// Injects (or replaces) a JSON-LD script block identified by `id`.
export function useJsonLd(id, data) {
  useEffect(() => {
    if (!data) return;
    let el = document.querySelector(`script[data-jsonld="${id}"]`);
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.setAttribute('data-jsonld', id);
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
    return () => {
      // Remove on unmount so client-side navigation doesn't leave stale schema behind.
      el.remove();
    };
  }, [id, JSON.stringify(data)]);
}

const stripHtml = (s) => String(s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export function FaqJsonLd({ faqs }) {
  const data =
    faqs && faqs.length
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs
            .filter((f) => f && (f.question || f.q))
            .map((f) => ({
              '@type': 'Question',
              name: stripHtml(f.question || f.q),
              acceptedAnswer: { '@type': 'Answer', text: stripHtml(f.answer || f.a) },
            })),
        }
      : null;
  useJsonLd('faq', data);
  return null;
}

export function BreadcrumbJsonLd({ items }) {
  const data =
    items && items.length
      ? {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            ...(item.url ? { item: item.url } : {}),
          })),
        }
      : null;
  useJsonLd('breadcrumb', data);
  return null;
}

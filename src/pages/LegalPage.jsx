import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import SEOHead from '../components/SEOHead';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LegalPage({ slug, defaultTitle }) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['legal-page', slug],
    queryFn: async () => {
      const results = await dataLayer.legalPages.getBySlug(slug);
      return results[0] || null;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const title = isRTL ? (pageData?.title_ar || pageData?.title || defaultTitle) : (pageData?.title || defaultTitle);
  const content = isRTL ? (pageData?.content_ar || pageData?.content || '') : (pageData?.content || '');

  return (
    <>
      <SEOHead pageIdentifier={slug} />
      <div className="min-h-screen pt-24 pb-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 pb-6 border-b border-slate-100">
              {title}
            </h1>

            <div
              className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-700"
              dir={isRTL ? 'rtl' : 'ltr'}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </motion.div>
        </div>
      </div>
    </>
  );
}

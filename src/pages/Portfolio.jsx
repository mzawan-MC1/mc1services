import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { ArrowRight, FolderOpen, Loader2, RefreshCw } from 'lucide-react';
import PortfolioCard from '../components/ui/PortfolioCard';
import SEOHead from '../components/SEOHead';
import { useTranslation } from 'react-i18next';

export default function Portfolio() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { value: 'all', label: t('portfolio.categories.all', 'All Projects') },
    { value: 'web_development', label: t('portfolio.categories.web_development', 'Web Development') },
    { value: 'app_development', label: t('portfolio.categories.app_development', 'App Development') },
    { value: 'digital_marketing', label: t('portfolio.categories.digital_marketing', 'Digital Marketing') },
    { value: 'production', label: t('portfolio.categories.production', 'Production') },
    { value: 'it_services', label: t('portfolio.categories.it_services', 'IT Services') },
    { value: 'development', label: t('portfolio.categories.development', 'Development') },
    { value: 'apps', label: t('portfolio.categories.apps', 'Apps') },
    { value: 'marketing', label: t('portfolio.categories.marketing', 'Marketing') },
    { value: 'branding', label: t('portfolio.categories.branding', 'Branding') },
    { value: 'creative', label: t('portfolio.categories.creative', 'Creative') }
  ];

  const { data: portfolios = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['portfolios'],
    queryFn: () => dataLayer.portfolio.getPublished()
  });

  const availableCategories = portfolios.length === 0
    ? []
    : categories.filter((category) =>
        category.value === 'all' || portfolios.some((portfolio) => portfolio.category === category.value)
      );

  const filteredPortfolios = activeCategory === 'all'
    ? portfolios
    : portfolios.filter(p => p.category === activeCategory);

  return (
    <div>
      <SEOHead pageIdentifier="portfolio" />
      {/* Hero */}
      <section className="relative py-24 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-2 bg-white/10 rounded-full text-blue-300 text-sm font-medium mb-6">
              {t('portfolio.hero.subtitle', 'Our Portfolio')}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('portfolio.hero.title', 'Selected Work and Project Experience')}
            </h1>
            <p className="text-xl text-slate-300">
              {t('portfolio.hero.desc', 'Browse the projects that have been approved for public display across our technology, marketing, and creative services.')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {availableCategories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                  activeCategory === cat.value
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
          ) : isError ? (
            <div className="mx-auto max-w-xl rounded-2xl border border-red-100 bg-red-50 px-6 py-12 text-center">
              <RefreshCw className="mx-auto mb-4 h-10 w-10 text-red-500" />
              <h2 className="text-2xl font-bold text-slate-900">{t('portfolio.load_error', 'Portfolio temporarily unavailable')}</h2>
              <p className="mt-3 text-slate-600">{t('portfolio.load_error_description', 'We could not load our work right now. Please try again.')}</p>
              <button type="button" onClick={() => refetch()} className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-800">
                <RefreshCw className="h-4 w-4" />
                {t('portfolio.try_again', 'Try Again')}
              </button>
            </div>
          ) : filteredPortfolios.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-slate-50 px-6 py-12 text-center">
              <FolderOpen className="mx-auto mb-4 h-10 w-10 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-900">{t('portfolio.empty_title', 'Our project showcase is being updated')}</h2>
              <p className="mt-3 text-slate-600">{t('portfolio.empty_description', 'We are preparing selected work for publication. Tell us what you need and we will discuss relevant experience privately.')}</p>
              <Link to="/Contact" className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white shadow-sm transition hover:shadow-lg">
                {t('portfolio.start_project', 'Discuss Your Project')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredPortfolios.map((portfolio, i) => (
                  <motion.div
                    key={portfolio.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={i === 0 || i === 5 ? 'md:col-span-2 md:row-span-2' : ''}
                  >
                    <PortfolioCard portfolio={portfolio} index={i} masonry={i === 0 || i === 5} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

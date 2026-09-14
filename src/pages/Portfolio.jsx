import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { ArrowRight, FolderOpen, Layers3, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import PortfolioCard from '../components/ui/PortfolioCard';
import SEOHead from '../components/SEOHead';
import { useTranslation } from 'react-i18next';

export default function Portfolio() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const [activeType, setActiveType] = useState(searchParams.get('type') || 'all');
  const [activeIndustry, setActiveIndustry] = useState(searchParams.get('industry') || 'all');
  const [activeService, setActiveService] = useState(searchParams.get('service') || 'all');

  useEffect(() => {
    setActiveType(searchParams.get('type') || 'all');
    setActiveIndustry(searchParams.get('industry') || 'all');
    setActiveService(searchParams.get('service') || 'all');
  }, [searchParams]);

  const { data: portfolios = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['portfolios'],
    queryFn: () => dataLayer.portfolio.getPublished()
  });

  const { data: industries = [] } = useQuery({ queryKey: ['active-industries'], queryFn: () => dataLayer.industries.getActive() });
  const { data: services = [] } = useQuery({ queryKey: ['active-services'], queryFn: () => dataLayer.services.getActive() });
  const { data: industryLinks = [] } = useQuery({ queryKey: ['portfolio-industry-links'], queryFn: () => dataLayer.portfolioTaxonomy.getIndustryLinks() });
  const { data: serviceLinks = [] } = useQuery({ queryKey: ['portfolio-service-links'], queryFn: () => dataLayer.portfolioTaxonomy.getServiceLinks() });

  const selectedIndustryId = industries.find((industry) => industry.slug === activeIndustry)?.id;
  const industryProjectIds = new Set(industryLinks.filter((link) => !selectedIndustryId || link.industry_id === selectedIndustryId).map((link) => link.portfolio_id));
  const serviceProjectIds = new Set(serviceLinks.filter((link) => activeService === 'all' || link.service_id === activeService).map((link) => link.portfolio_id));
  const filteredPortfolios = portfolios
    .filter((portfolio) =>
      (activeType === 'all' || portfolio.project_type === activeType)
      && (activeIndustry === 'all' || industryProjectIds.has(portfolio.id))
      && (activeService === 'all' || serviceProjectIds.has(portfolio.id))
    )
    .sort((a, b) => {
      if (Boolean(a.is_featured) !== Boolean(b.is_featured)) return a.is_featured ? -1 : 1;
      return (a.featured_rank ?? 999) - (b.featured_rank ?? 999);
    });
  const featuredCount = portfolios.filter((portfolio) => portfolio.is_featured).length;
  const hasFilters = activeType !== 'all' || activeIndustry !== 'all' || activeService !== 'all';
  const localizedName = (record, key) => i18n.language === 'ar' ? record[`${key}_ar`] || record[key] : record[key];

  return (
    <div>
      <SEOHead pageIdentifier="portfolio" />
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 py-24 md:py-32">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-4xl text-center"
          >
            <span className="inline-block px-4 py-2 bg-white/10 rounded-full text-blue-300 text-sm font-medium mb-6">
              {t('portfolio.hero.subtitle', 'Our Portfolio')}
            </span>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl">
              {t('portfolio.hero.title', 'Business systems designed to do real work')}
            </h1>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-300 md:text-xl">
              {t('portfolio.hero.desc', 'Explore how MCS turns operational workflows into software, SaaS products, automation and measurable digital experiences.')}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur"><Layers3 className="h-4 w-4 text-blue-300" />{portfolios.length} {t('portfolio.published_projects', 'published projects')}</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur"><Sparkles className="h-4 w-4 text-purple-300" />{featuredCount} {t('portfolio.featured_case_studies', 'featured case studies')}</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur">{industries.length} {t('portfolio.industry_sectors', 'industry sectors')}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="bg-gradient-to-b from-white to-slate-50 py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">{t('portfolio.explore_work', 'Explore the work')}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">{t('portfolio.find_relevant_experience', 'Find the experience most relevant to your business')}</h2>
          </div>
          <div className="mb-5 flex flex-wrap justify-center gap-3">
            {[['all', 'All Work'], ['client_project', 'Client Projects'], ['mc1_product', 'MCS Products']].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setActiveType(value)}
                className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                  activeType === value
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mx-auto mb-12 grid max-w-4xl gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label><span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('portfolio.industry', 'Industry')}</span><select value={activeIndustry} onChange={(event) => setActiveIndustry(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"><option value="all">{t('portfolio.all_industries', 'All industries')}</option>{industries.map((industry) => <option key={industry.id} value={industry.slug}>{localizedName(industry, 'name')}</option>)}</select></label>
            <label><span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('portfolio.solution', 'Solution')}</span><select value={activeService} onChange={(event) => setActiveService(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"><option value="all">{t('portfolio.all_solutions', 'All solutions')}</option>{services.map((service) => <option key={service.id} value={service.id}>{localizedName(service, 'title')}</option>)}</select></label>
            <button type="button" disabled={!hasFilters} onClick={() => { setActiveType('all'); setActiveIndustry('all'); setActiveService('all'); }} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40">{t('portfolio.clear_filters', 'Clear')}</button>
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
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7"
            >
              <AnimatePresence mode="popLayout">
                {filteredPortfolios.map((portfolio, i) => (
                  <motion.div
                    key={portfolio.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={portfolio.is_featured && i < 2 ? 'sm:col-span-2 lg:col-span-1' : ''}
                  >
                    <PortfolioCard portfolio={portfolio} index={i} masonry={portfolio.is_featured && i < 2} />
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

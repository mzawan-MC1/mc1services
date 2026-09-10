import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowRight, Boxes, CheckCircle2, Clapperboard, CloudCog, Code, Code2,
  Loader2, Megaphone, PanelsTopLeft, RefreshCw, Server, Sparkles,
  Target, TrendingUp, Workflow, Zap
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { dataLayer } from '../components/dataLayer';
import PortfolioCard from '../components/ui/PortfolioCard';
import { getLocalizedValue } from '../utils';

const iconMap = {
  Boxes, Clapperboard, CloudCog, Code, Code2, Megaphone, PanelsTopLeft,
  Server, Sparkles, TrendingUp, Zap
};

const normaliseFeatures = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') return value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
  return [];
};

const getContactServiceValue = (service) => {
  const categoryMap = {
    development: 'custom_software',
    ai_automation: 'automation',
    application_development: 'app_development',
    saas_engineering: 'custom_software',
    marketing: 'digital_marketing',
    it_services: 'it_services',
    production: 'production'
  };
  return categoryMap[service?.category] || 'other';
};

const setMetaContent = (selector, attributeName, attributeValue, content) => {
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.content = content;
};

export default function SolutionDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const serviceQuery = useQuery({
    queryKey: ['service-by-slug', slug],
    queryFn: () => dataLayer.services.getBySlug(slug),
    enabled: Boolean(slug)
  });
  const service = serviceQuery.data;

  const relatedProjectsQuery = useQuery({
    queryKey: ['solution-projects', service?.id],
    queryFn: async () => {
      const [projects, links] = await Promise.all([
        dataLayer.portfolio.getPublished(),
        dataLayer.portfolioTaxonomy.getServiceLinks()
      ]);
      const projectIds = new Set(links.filter((link) => link.service_id === service.id).map((link) => link.portfolio_id));
      return projects
        .filter((project) => projectIds.has(project.id))
        .sort((a, b) => Number(Boolean(b.is_featured)) - Number(Boolean(a.is_featured)))
        .slice(0, 3);
    },
    enabled: Boolean(service?.id)
  });

  const faqsQuery = useQuery({
    queryKey: ['solution-faqs', service?.category],
    queryFn: () => dataLayer.faqs.getByCategory(service.category),
    enabled: Boolean(service?.category)
  });

  const localized = (key) => getLocalizedValue(service, key, i18n.language);
  const title = localized('title');
  const description = localized('description');
  const fullDescription = localized('full_description') || description;
  const category = localized('category') || service?.service_group;
  const features = normaliseFeatures(isArabic ? service?.features_ar || service?.features : service?.features);
  const ServiceIcon = iconMap[service?.icon] || Sparkles;
  const contactServiceValue = getContactServiceValue(service);
  const relatedProjects = relatedProjectsQuery.data || [];
  const faqs = (faqsQuery.data || []).filter((faq) => faq.is_active !== false).slice(0, 6);

  useEffect(() => {
    if (!service || !title) return;
    const metaDescription = description || fullDescription || t('solutions.meta_fallback', 'Practical technology and business solutions from MCS Consultancy.');
    document.title = `${title} | MCS Consultancy`;
    setMetaContent('meta[name="description"]', 'name', 'description', metaDescription);
    setMetaContent('meta[property="og:title"]', 'property', 'og:title', `${title} | MCS Consultancy`);
    setMetaContent('meta[property="og:description"]', 'property', 'og:description', metaDescription);
    if (service.image_url) setMetaContent('meta[property="og:image"]', 'property', 'og:image', service.image_url);
  }, [description, fullDescription, service, t, title]);

  if (serviceQuery.isLoading) {
    return <main className="flex min-h-[60vh] items-center justify-center" role="status"><Loader2 className="h-9 w-9 animate-spin text-blue-600" /><span className="sr-only">{t('common.loading', 'Loading')}</span></main>;
  }

  if (serviceQuery.isError) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-6 py-20 text-center">
        <div className="max-w-lg rounded-3xl border border-red-100 bg-red-50 p-10">
          <RefreshCw className="mx-auto h-10 w-10 text-red-500" />
          <h1 className="mt-5 text-3xl font-bold text-slate-950">{t('solutions.load_error', 'This solution is temporarily unavailable')}</h1>
          <button type="button" onClick={() => serviceQuery.refetch()} className="mt-6 rounded-full bg-slate-950 px-6 py-3 font-semibold text-white">{t('common.try_again', 'Try again')}</button>
        </div>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-6 py-20 text-center">
        <div className="max-w-lg">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue-600">404</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950">{t('solutions.not_found', 'Solution not found')}</h1>
          <p className="mt-4 text-slate-600">{t('solutions.not_found_description', 'This solution may have moved or is not currently published.')}</p>
          <Link to="/Portfolio" className="mt-7 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white">{t('solutions.explore_work', 'Explore our work')}<ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <section className="relative overflow-hidden bg-slate-950 py-20 text-white md:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(37,99,235,0.3),transparent_35%),radial-gradient(circle_at_85%_70%,rgba(147,51,234,0.24),transparent_34%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-2 text-sm text-slate-300">
              <Link to="/Home" className="hover:text-white">{t('nav.home', 'Home')}</Link><span>/</span><span>{t('nav.solutions', 'Solutions')}</span>
            </nav>
            {category && <p className="mb-5 text-sm font-bold uppercase tracking-[0.22em] text-cyan-300">{category}</p>}
            <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-7xl">{title}</h1>
            {description && <p className="mt-7 max-w-3xl text-lg leading-relaxed text-slate-300 md:text-xl">{description}</p>}
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to={`/Contact?service=${encodeURIComponent(contactServiceValue)}`} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3.5 font-semibold text-white shadow-lg transition hover:-translate-y-0.5">{t('solutions.discuss_project', 'Discuss your project')}<ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link>
              <Link to={`/Portfolio?service=${encodeURIComponent(service.id)}`} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/10">{t('solutions.view_work', 'View related work')}</Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.12 }} className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl sm:p-7">
            {service.image_url ? (
              <img src={service.image_url} alt="" className="aspect-[8/5] w-full rounded-[1.4rem] object-cover" />
            ) : (
              <div className="flex aspect-[8/5] items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-blue-600/40 via-cyan-400/10 to-purple-600/40">
                <ServiceIcon className="h-24 w-24 text-cyan-200" strokeWidth={1.25} />
              </div>
            )}
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4"><Workflow className="mb-3 h-5 w-5 text-cyan-300" /><span className="text-slate-200">{t('solutions.workflow_led', 'Workflow-led')}</span></div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4"><Target className="mb-3 h-5 w-5 text-purple-300" /><span className="text-slate-200">{t('solutions.outcome_focused', 'Outcome-focused')}</span></div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-600">{t('solutions.overview', 'Solution overview')}</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">{t('solutions.designed_around_business', 'Designed around your business, not a template')}</h2>
            <p className="mt-6 whitespace-pre-line text-lg leading-8 text-slate-600">{fullDescription}</p>
          </div>
          <div>
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.22em] text-slate-500">{t('solutions.capabilities', 'Capabilities')}</p>
            {features.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {features.map((feature, index) => (
                  <motion.div key={feature} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <CheckCircle2 className="h-6 w-6 text-blue-600" /><p className="mt-4 font-semibold leading-relaxed text-slate-900">{feature}</p>
                  </motion.div>
                ))}
              </div>
            ) : <p className="rounded-2xl bg-slate-50 p-6 text-slate-600">{t('solutions.capabilities_managed', 'Capabilities for this solution can be added at any time from the Services area in the admin panel.')}</p>}
          </div>
        </div>
      </section>

      {relatedProjects.length > 0 && (
        <section className="bg-slate-50 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div><p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-600">{t('solutions.related_experience', 'Related experience')}</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">{t('solutions.see_solution_in_action', 'See this solution in action')}</h2></div>
              <Link to={`/Portfolio?service=${encodeURIComponent(service.id)}`} className="inline-flex items-center gap-2 font-semibold text-blue-700">{t('solutions.view_all_work', 'View all related work')}<ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{relatedProjects.map((project, index) => <PortfolioCard key={project.id} portfolio={project} index={index} />)}</div>
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="bg-white py-20 md:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-bold uppercase tracking-[0.22em] text-blue-600">{t('solutions.faq', 'Frequently asked questions')}</p>
            <h2 className="mt-3 text-center text-3xl font-black text-slate-950 md:text-4xl">{t('solutions.questions_before_start', 'Questions before we start')}</h2>
            <div className="mt-10 space-y-4">
              {faqs.map((faq) => (
                <details key={faq.id} className="group rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <summary className="cursor-pointer list-none pr-8 font-bold text-slate-950 marker:hidden">{getLocalizedValue(faq, 'question', i18n.language)}</summary>
                  <p className="mt-4 whitespace-pre-line leading-7 text-slate-600">{getLocalizedValue(faq, 'answer', i18n.language)}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-slate-950 py-20 text-white">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-300">{t('solutions.next_step', 'Your next step')}</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">{t('solutions.turn_workflow_into_solution', 'Turn your workflow into a working solution')}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">{t('solutions.cta_description', 'Show us the process, bottleneck or opportunity. We will help you shape the practical next move.')}</p>
          <Link to={`/Contact?service=${encodeURIComponent(contactServiceValue)}`} className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-bold text-slate-950 transition hover:-translate-y-0.5">{t('solutions.start_conversation', 'Start a conversation')}<ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link>
        </div>
      </section>
    </main>
  );
}

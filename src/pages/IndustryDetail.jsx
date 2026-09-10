import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowRight, BriefcaseBusiness, Building2, Car, Clapperboard, Factory,
  Gamepad2, Globe2, Loader2, Newspaper, RefreshCw, Scale, Ship,
  Sparkles, UtensilsCrossed
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { dataLayer } from '../components/dataLayer';
import PortfolioCard from '../components/ui/PortfolioCard';
import { getLocalizedValue } from '../utils';

const iconMap = {
  BriefcaseBusiness, Building2, Car, Clapperboard, Factory, Gamepad2,
  Globe2, Newspaper, Scale, Ship, Sparkles, UtensilsCrossed
};

const setMetaContent = (selector, attributeName, attributeValue, content) => {
  let element = document.querySelector(selector);
  if (!content) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.content = content;
};

export default function IndustryDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();

  const industryQuery = useQuery({
    queryKey: ['industry-by-slug', slug],
    queryFn: () => dataLayer.industries.getBySlug(slug),
    enabled: Boolean(slug)
  });
  const industry = industryQuery.data;

  const experienceQuery = useQuery({
    queryKey: ['industry-experience', industry?.id],
    queryFn: async () => {
      const [projects, industryLinks, services, serviceLinks] = await Promise.all([
        dataLayer.portfolio.getPublished(),
        dataLayer.portfolioTaxonomy.getIndustryLinks(),
        dataLayer.services.getActive(),
        dataLayer.portfolioTaxonomy.getServiceLinks()
      ]);
      const projectIds = new Set(industryLinks.filter((link) => link.industry_id === industry.id).map((link) => link.portfolio_id));
      const relatedProjects = projects
        .filter((project) => projectIds.has(project.id))
        .sort((a, b) => Number(Boolean(b.is_featured)) - Number(Boolean(a.is_featured)));
      const serviceIds = new Set(serviceLinks.filter((link) => projectIds.has(link.portfolio_id)).map((link) => link.service_id));
      return {
        projects: relatedProjects,
        services: services.filter((service) => serviceIds.has(service.id))
      };
    },
    enabled: Boolean(industry?.id)
  });

  const name = getLocalizedValue(industry, 'name', i18n.language);
  const description = getLocalizedValue(industry, 'short_description', i18n.language);
  const IndustryIcon = iconMap[industry?.icon] || Building2;
  const projects = experienceQuery.data?.projects || [];
  const services = experienceQuery.data?.services || [];

  useEffect(() => {
    if (!industry || !name) return;
    const metaDescription = description || t('industries.meta_fallback', 'Explore MC1 experience and digital solutions for this industry.');
    document.title = `${name} Solutions | MCS Consultancy`;
    setMetaContent('meta[name="description"]', 'name', 'description', metaDescription);
    setMetaContent('meta[property="og:title"]', 'property', 'og:title', `${name} Solutions | MCS Consultancy`);
    setMetaContent('meta[property="og:description"]', 'property', 'og:description', metaDescription);
    setMetaContent('meta[property="og:image"]', 'property', 'og:image', industry.image_url);
  }, [description, industry, name, t]);

  if (industryQuery.isLoading) {
    return <main className="flex min-h-[60vh] items-center justify-center" role="status"><Loader2 className="h-9 w-9 animate-spin text-blue-600" /><span className="sr-only">{t('common.loading', 'Loading')}</span></main>;
  }

  if (industryQuery.isError) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-6 py-20 text-center">
        <div className="max-w-lg rounded-3xl border border-red-100 bg-red-50 p-10">
          <RefreshCw className="mx-auto h-10 w-10 text-red-500" />
          <h1 className="mt-5 text-3xl font-bold text-slate-950">{t('industries.load_error', 'This industry page is temporarily unavailable')}</h1>
          <button type="button" onClick={() => industryQuery.refetch()} className="mt-6 rounded-full bg-slate-950 px-6 py-3 font-semibold text-white">{t('common.try_again', 'Try again')}</button>
        </div>
      </main>
    );
  }

  if (!industry) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-6 py-20 text-center">
        <div className="max-w-lg">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue-600">404</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950">{t('industries.not_found', 'Industry not found')}</h1>
          <p className="mt-4 text-slate-600">{t('industries.not_found_description', 'This industry may have moved or is not currently published.')}</p>
          <Link to="/Portfolio" className="mt-7 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white">{t('industries.explore_work', 'Explore our work')}<ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <section className="relative min-h-[38rem] overflow-hidden bg-slate-950 text-white">
        {industry.image_url ? <img src={industry.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" /> : <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-950 to-purple-950" />}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/35" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(34,211,238,0.18),transparent_32%)]" />
        <div className="relative mx-auto flex min-h-[38rem] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
            <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-2 text-sm text-slate-300"><Link to="/Home" className="hover:text-white">{t('nav.home', 'Home')}</Link><span>/</span><span>{t('nav.industries', 'Industries')}</span></nav>
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur"><IndustryIcon className="h-8 w-8 text-cyan-200" /></span>
            <p className="mt-7 text-sm font-bold uppercase tracking-[0.22em] text-cyan-300">{t('industries.industry_experience', 'Industry experience')}</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">{name}</h1>
            {description && <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-200 md:text-xl">{description}</p>}
            <div className="mt-9 flex flex-wrap gap-3"><Link to={`/Portfolio?industry=${encodeURIComponent(industry.slug)}`} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-bold text-slate-950">{t('industries.view_projects', 'View industry projects')}<ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link><Link to="/Contact?service=other" className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-6 py-3.5 font-bold text-white backdrop-blur">{t('industries.discuss_workflow', 'Discuss your workflow')}</Link></div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl divide-y divide-slate-200 px-4 sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
          <div className="py-8 sm:px-8"><p className="text-4xl font-black text-slate-950">{projects.length}</p><p className="mt-1 text-sm font-semibold uppercase tracking-wider text-slate-500">{t('industries.connected_projects', 'Connected projects')}</p></div>
          <div className="py-8 sm:px-8"><p className="text-4xl font-black text-slate-950">{services.length}</p><p className="mt-1 text-sm font-semibold uppercase tracking-wider text-slate-500">{t('industries.connected_solutions', 'Connected solutions')}</p></div>
        </div>
      </section>

      {services.length > 0 && (
        <section className="bg-white py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl"><p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-600">{t('industries.relevant_capabilities', 'Relevant capabilities')}</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">{t('industries.solutions_for_sector', 'Solutions connected to this sector')}</h2></div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {services.slice(0, 6).map((service, index) => {
                const serviceName = getLocalizedValue(service, 'title', i18n.language);
                const serviceDescription = getLocalizedValue(service, 'description', i18n.language);
                return <motion.div key={service.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}><Link to={`/solutions/${service.slug}`} className="group block h-full rounded-3xl border border-slate-200 bg-slate-50 p-7 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-xl"><Sparkles className="h-7 w-7 text-blue-600" /><h3 className="mt-5 text-xl font-bold text-slate-950">{serviceName}</h3>{serviceDescription && <p className="mt-3 line-clamp-3 leading-7 text-slate-600">{serviceDescription}</p>}<span className="mt-6 inline-flex items-center gap-2 font-semibold text-blue-700">{t('industries.explore_solution', 'Explore solution')}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 rtl:rotate-180" /></span></Link></motion.div>;
              })}
            </div>
          </div>
        </section>
      )}

      <section className="bg-slate-50 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-600">{t('industries.proven_experience', 'Proven experience')}</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">{t('industries.related_work', 'Related work')}</h2></div>{projects.length > 0 && <Link to={`/Portfolio?industry=${encodeURIComponent(industry.slug)}`} className="inline-flex items-center gap-2 font-semibold text-blue-700">{t('industries.view_all_projects', 'View all projects')}<ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link>}</div>
          {projects.length > 0 ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{projects.slice(0, 6).map((project, index) => <PortfolioCard key={project.id} portfolio={project} index={index} />)}</div> : <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center"><BriefcaseBusiness className="mx-auto h-10 w-10 text-blue-600" /><h3 className="mt-4 text-2xl font-bold text-slate-950">{t('industries.private_experience', 'Relevant experience is available privately')}</h3><p className="mx-auto mt-3 max-w-xl text-slate-600">{t('industries.private_experience_description', 'Some industry work cannot be published. Contact us and we can discuss the most relevant experience for your requirements.')}</p><Link to="/Contact?service=other" className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 font-semibold text-white">{t('industries.contact_us', 'Contact us')}<ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link></div>}
        </div>
      </section>

      <section className="bg-slate-950 py-20 text-white"><div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8"><p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-300">{t('industries.your_operation', 'Your operation')}</p><h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">{t('industries.build_around_workflow', 'Let us build around the way your business works')}</h2><p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">{t('industries.cta_description', 'Bring us the workflow, bottleneck or growth objective. We will help turn it into a practical digital system.')}</p><Link to="/Contact?service=other" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-bold text-slate-950">{t('industries.start_conversation', 'Start a conversation')}<ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link></div></section>
    </main>
  );
}

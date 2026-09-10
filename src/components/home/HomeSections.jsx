import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createPageUrl, getLocalizedValue } from '../../utils';
import { dataLayer } from '../dataLayer';
import PortfolioCard from '../ui/PortfolioCard';
import ClientLogosSection from './ClientLogosSection';
import HeroSection from './HeroSection';
import ProcessSection from './ProcessSection';
import ServicesHighlight from './ServicesHighlight';
import StatsSection from './StatsSection';
import TestimonialsSlider from './TestimonialsSlider';
import VideoSection from './VideoSection';

const DEFAULT_SECTIONS = [
  ['hero', 10], ['clients', 20], ['video', 30], ['services', 40], ['products', 50],
  ['portfolio', 60], ['industries', 70], ['process', 80], ['stats', 90],
  ['testimonials', 100], ['cta', 110]
];

const resolveCmsLink = (href, fallback = 'Contact') => {
  const target = href || fallback;
  if (/^(https?:)?\/\//i.test(target) || target.startsWith('/')) return target;
  return createPageUrl(target);
};

function ProductsSection({ content }) {
  const { i18n } = useTranslation();
  const { data: products = [] } = useQuery({
    queryKey: ['mc1-products'],
    queryFn: async () => (await dataLayer.portfolio.getPublished()).filter((item) => item.project_type === 'mc1_product')
  });
  if (!products.length) return null;
  const loc = (key, fallback) => getLocalizedValue(content, key, i18n.language, false) || fallback;
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 py-24 text-white">
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-3xl"><span className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">{loc('subtitle', 'Built by MC1')}</span><h2 className="mt-3 text-3xl font-bold md:text-5xl">{loc('title', 'Products We Own and Operate')}</h2><p className="mt-4 text-lg text-slate-300">{loc('description', 'Platforms we continuously develop, operate and improve using the same standards we bring to client work.')}</p></div>
        <div className="grid gap-6 md:grid-cols-2">
          {products.map((product) => {
            const productTitle = getLocalizedValue(product, 'title', i18n.language) || product.title;
            const productHeadline = getLocalizedValue(product, 'headline', i18n.language) || getLocalizedValue(product, 'short_description', i18n.language);
            return <Link key={product.id} to={createPageUrl(`PortfolioDetail?id=${product.id}`)} className="group relative min-h-[28rem] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl shadow-blue-950/30">{product.main_image_url && <img loading="lazy" decoding="async" src={product.main_image_url} alt={productTitle} className="absolute inset-0 h-full w-full object-cover opacity-50 transition duration-700 group-hover:scale-105" />}<div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-blue-950/10" /><div className="absolute left-6 top-6 rounded-full border border-cyan-300/20 bg-slate-950/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200 backdrop-blur-md">MC1 Product</div><div className="absolute inset-x-0 bottom-0 p-7 md:p-9"><h3 className="mt-1 text-3xl font-bold md:text-4xl">{productTitle}</h3><p className="mt-3 max-w-xl text-slate-200">{productHeadline}</p>{product.technologies?.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{product.technologies.slice(0, 4).map((technology) => <span key={technology} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">{technology}</span>)}</div>}<span className="mt-6 inline-flex items-center gap-2 font-medium text-cyan-200">Explore product <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 rtl:-scale-x-100" /></span></div></Link>;
          })}
        </div>
      </div>
    </section>
  );
}

function FeaturedProjectsSection({ content }) {
  const { t, i18n } = useTranslation();
  const { data: portfolios = [] } = useQuery({ queryKey: ['featured-portfolios'], queryFn: async () => (await dataLayer.portfolio.getFeatured()).slice(0, 6) });
  if (!portfolios.length) return null;
  const loc = (key, fallback) => getLocalizedValue(content, key, i18n.language, false) || fallback;
  return <section className="bg-white py-24"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16 text-center"><span className="inline-block rounded-full bg-purple-50 px-4 py-1.5 text-sm font-medium text-purple-600">{loc('subtitle', t('home.our_work', 'Our Work'))}</span><h2 className="mt-4 text-3xl font-bold text-slate-900 md:text-5xl">{loc('title', t('home.featured_projects', 'Featured Case Studies'))}</h2><p className="mx-auto mt-4 max-w-2xl text-xl text-slate-600">{loc('description', t('home.explore_latest_work', 'See how MC1 turns complex workflows into practical digital systems.'))}</p></motion.div><div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">{portfolios.map((portfolio, index) => <PortfolioCard key={portfolio.id} portfolio={portfolio} index={index} />)}</div><div className="mt-12 text-center"><Link to={createPageUrl('Portfolio')} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-8 py-4 font-medium text-white transition hover:bg-slate-800">View all projects <ArrowRight className="h-5 w-5" /></Link></div></div></section>;
}

function IndustriesSection({ content }) {
  const { i18n } = useTranslation();
  const { data: industries = [] } = useQuery({ queryKey: ['active-industries'], queryFn: () => dataLayer.industries.getActive() });
  if (!industries.length) return null;
  const loc = (key, fallback) => getLocalizedValue(content, key, i18n.language, false) || fallback;
  return <section className="bg-slate-50 py-24"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div className="max-w-3xl"><span className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">{loc('subtitle', 'Industry Experience')}</span><h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-5xl">{loc('title', 'Built Around Real Operations')}</h2><p className="mt-4 text-lg text-slate-600">{loc('description', 'Industry knowledge connected to the systems and workflows we have delivered.')}</p></div><Link to="/Portfolio" className="inline-flex items-center gap-2 font-semibold text-blue-600">Explore all work <ArrowRight className="h-4 w-4 rtl:-scale-x-100" /></Link></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{industries.map((industry, index) => <Link key={industry.id} to={industry.slug ? `/industries/${industry.slug}` : `/Portfolio?industry=${industry.slug}`} className="group relative min-h-72 overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">{industry.image_url ? <img loading="lazy" decoding="async" src={industry.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-700 group-hover:scale-105" /> : <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-slate-900 to-purple-800" />}<div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-transparent" /><span className="absolute right-5 top-4 text-5xl font-black text-white/10">{String(index + 1).padStart(2, '0')}</span><div className="absolute inset-x-0 bottom-0 p-6"><h3 className="text-xl font-bold text-white">{i18n.language === 'ar' ? industry.name_ar || industry.name : industry.name}</h3><p className="mt-2 line-clamp-3 text-sm text-slate-300">{i18n.language === 'ar' ? industry.short_description_ar || industry.short_description : industry.short_description}</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-cyan-200">Explore industry <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 rtl:-scale-x-100" /></span></div></Link>)}</div></div></section>;
}

function FinalCta({ content }) {
  const { i18n } = useTranslation();
  const loc = (key, fallback) => getLocalizedValue(content, key, i18n.language, false) || fallback;
  return <section className="relative overflow-hidden bg-slate-950 py-24"><div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,.45),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(147,51,234,.4),transparent_35%)]" /><div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8"><span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">{loc('subtitle', 'Your workflow. Reimagined.')}</span><h2 className="mt-6 text-3xl font-bold text-white md:text-6xl">{loc('title', 'Tell Us Your Workflow')}</h2><p className="mx-auto mt-6 max-w-2xl text-xl text-slate-300">{loc('description', 'We will help you turn it into a secure, practical and scalable digital solution.')}</p><Link to={resolveCmsLink(content?.button_link)} className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-blue-700 shadow-xl transition hover:scale-[1.02]">{loc('button_text', 'Start Your Project')}<ArrowRight className="h-5 w-5 rtl:-scale-x-100" /></Link></div></section>;
}

export default function HomeSections() {
  const { data: records = [] } = useQuery({ queryKey: ['home-content'], queryFn: () => dataLayer.homeContent.getAll() });
  const byKey = Object.fromEntries(records.map((record) => [record.section_key, record]));
  const sections = DEFAULT_SECTIONS.map(([key, order]) => ({ key, order: byKey[key]?.display_order || order, visible: byKey[key]?.is_visible !== false, content: byKey[key] || {} })).filter((section) => section.visible).sort((a, b) => a.order - b.order);
  const components = {
    hero: () => <HeroSection />, clients: () => <ClientLogosSection />, video: () => <VideoSection />,
    services: () => <ServicesHighlight />, products: (content) => <ProductsSection content={content} />,
    portfolio: (content) => <FeaturedProjectsSection content={content} />, industries: (content) => <IndustriesSection content={content} />,
    process: () => <ProcessSection />, stats: () => <StatsSection />, testimonials: () => <TestimonialsSlider />,
    cta: (content) => <FinalCta content={content} />
  };
  return sections.map((section) => <div key={section.key} data-home-section={section.key} data-style={section.content.style_variant || 'default'}>{components[section.key]?.(section.content)}</div>);
}

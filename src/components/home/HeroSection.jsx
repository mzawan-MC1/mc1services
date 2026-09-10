import { Link } from 'react-router-dom';
import { createPageUrl, getLocalizedValue } from '../../utils';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../dataLayer';
import { ArrowRight, ArrowUpRight, BrainCircuit, Calendar, Layers3, Rocket, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export default function HeroSection() {
  const { t, i18n } = useTranslation();
  const { data: heroContent } = useQuery({
    queryKey: ['hero-content'],
    queryFn: async () => {
      const sections = await dataLayer.homeContent.getBySection('hero');
      return sections[0] || {};
    }
  });

  const { data: services = [] } = useQuery({
    queryKey: ['active-services'],
    queryFn: () => dataLayer.services.getActive()
  });
  const { data: projects = [] } = useQuery({
    queryKey: ['published-portfolios'],
    queryFn: () => dataLayer.portfolio.getPublished()
  });
  const { data: industries = [] } = useQuery({
    queryKey: ['active-industries'],
    queryFn: () => dataLayer.industries.getActive()
  });

  const getLoc = (key) => getLocalizedValue(heroContent, key, i18n.language, false);

  const title = getLoc('title') || t('home.hero_title_default', 'Practical Digital Solutions Built Around Your Business');
  const description = getLoc('description') || t('home.hero_desc_default', 'Websites, custom software, mobile apps, automation, digital marketing, and IT support delivered by one accountable team.');
  const buttonText = getLoc('button_text') || t('home.book_consultation', 'Book Consultation');
  const buttonLink = heroContent?.button_link || 'Contact';
  const buttonTextSecondary = getLoc('button_text_secondary') || t('home.view_work', 'Explore Our Services');
  const buttonLinkSecondary = heroContent?.button_link_secondary || 'DevelopmentServices';
  const showSecondaryButton = heroContent?.show_secondary_button !== false;
  const configuredHeight = heroContent?.section_height?.trim();
  const sectionHeight = configuredHeight || 'min-h-[760px]';
  const usesCssHeight = /^\d+(\.\d+)?(px|rem|vh|svh|dvh)$/i.test(sectionHeight);
  const sectionStyle = usesCssHeight ? { minHeight: sectionHeight } : undefined;
  const sectionHeightClass = usesCssHeight ? '' : sectionHeight;

  const resolveLink = (target, fallback) => {
    const value = target || fallback;
    if (/^(https?:)?\/\//i.test(value) || value.startsWith('/')) return value;
    return createPageUrl(value);
  };

  // Handle localized subtitle/service pills
  const subtitle = getLoc('subtitle') || t('home.future_ready', 'AI-enabled business solutions, built for real operations');
  const featuredServices = services.filter((service) => service.is_featured).concat(services.filter((service) => !service.is_featured)).slice(0, 5);
  const capabilityCards = [
    { icon: BrainCircuit, label: t('home.hero.ai', 'AI & automation'), value: featuredServices[0] ? (i18n.language === 'ar' ? featuredServices[0].title_ar || featuredServices[0].title : featuredServices[0].title) : t('home.pills.software', 'Intelligent systems') },
    { icon: Layers3, label: t('home.hero.delivery', 'Delivery experience'), value: projects.length ? `${projects.length}+ ${t('home.hero.published_projects', 'published projects')}` : t('home.hero.business_systems', 'Business systems') },
    { icon: ShieldCheck, label: t('home.hero.industry', 'Industry knowledge'), value: industries.length ? `${industries.length} ${t('home.hero.sectors', 'active sectors')}` : t('home.hero.secure_scale', 'Secure scale') }
  ];

  return (
    <section style={sectionStyle} className={`relative ${sectionHeightClass} flex items-center overflow-hidden bg-slate-900`}>
      {/* Animated Background */}
      <div className="absolute inset-0">
        {heroContent?.background_video ? (
          <video src={heroContent.background_video} poster={heroContent.background_image || undefined} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover opacity-35" />
        ) : heroContent?.background_image ? (
          <img src={heroContent.background_image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-pink-600/20" />
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-blue-500/30 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/30 rounded-full blur-[150px] translate-x-1/4 translate-y-1/4 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-200 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              {subtitle}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8 whitespace-pre-line text-4xl font-bold leading-[1.05] text-white md:text-6xl lg:text-7xl"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-10 max-w-2xl text-lg leading-relaxed text-slate-300 md:text-xl"
          >
            {description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Link to={resolveLink(buttonLink, 'Contact')}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-blue-500/25 transition-all">
                <Calendar className="w-5 h-5 mr-2" />
                {buttonText}
              </Button>
            </Link>
            {showSecondaryButton && buttonTextSecondary && (
              <Link to={resolveLink(buttonLinkSecondary, 'Portfolio')}>
                <Button size="lg" variant="outline" className="border-2 border-white/80 bg-white/10 text-white hover:bg-white/20 hover:border-white px-8 py-6 text-lg rounded-full backdrop-blur-sm shadow-lg transition-all">
                  {buttonTextSecondary}
                  <ArrowRight className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180" />
                </Button>
              </Link>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 flex flex-wrap gap-3"
          >
            {featuredServices.map((service) => (
              <Link key={service.id} to={resolveLink(service.page_url, 'DevelopmentServices')} className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur-sm transition hover:border-cyan-300/30 hover:bg-white/10 hover:text-white">
                {i18n.language === 'ar' ? service.title_ar || service.title : service.title}
                <ArrowUpRight className="h-3.5 w-3.5 opacity-50 transition group-hover:opacity-100 rtl:-scale-x-100" />
              </Link>
            ))}
          </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative hidden lg:block">
            <div className="absolute -inset-8 rounded-full bg-gradient-to-br from-cyan-400/20 via-blue-500/10 to-purple-500/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.07] p-5 shadow-2xl shadow-blue-950/40 backdrop-blur-xl">
              <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 text-sm text-slate-300"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />MC1 capability system</div>
                <Rocket className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="space-y-4">
                {capabilityCards.map((card, index) => (
                  <motion.div key={card.label} animate={{ y: [0, index % 2 ? 5 : -5, 0] }} transition={{ duration: 5 + index, repeat: Infinity }} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/45 p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600"><card.icon className="h-6 w-6 text-white" /></div>
                    <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">{card.label}</p><p className="mt-1 font-semibold text-white">{card.value}</p></div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs text-slate-400">
                <div className="rounded-xl bg-white/5 p-3"><strong className="block text-lg text-white">AI</strong>enabled</div>
                <div className="rounded-xl bg-white/5 p-3"><strong className="block text-lg text-white">ERP</strong>ready</div>
                <div className="rounded-xl bg-white/5 p-3"><strong className="block text-lg text-white">360°</strong>delivery</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

    </section>
  );
}

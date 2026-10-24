import { Link } from 'react-router-dom';
import { createPageUrl, getLocalizedValue } from '../../utils';
import { optimizeImageUrl } from '../../utils/optimizeImage';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../dataLayer';
import { ArrowRight, BarChart3, Building2, Calendar, ClipboardCheck, CreditCard, FileCheck2, FileText, Gavel, LayoutDashboard, ListChecks, Lock, Receipt, ShoppingCart, Sparkles, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

// Renders the CMS headline with one word in an animated gradient.
// The word wrapped in *asterisks* in the CMS wins; otherwise the
// longest word is accented, so the effect works with any title.
function AccentTitle({ title }) {
  const marked = title.match(/\*([^*]+)\*/);
  const clean = title.replace(/\*/g, '');
  let accent = marked ? marked[1].trim() : null;
  if (!accent) {
    const words = clean.split(/\s+/).filter(Boolean);
    accent = words.reduce((best, w) => {
      const len = w.replace(/[^A-Za-zÀ-ÿ]/g, '').length;
      return len > (best?.len || 0) ? { word: w, len } : best;
    }, null)?.word;
  }
  if (!accent) return clean;
  const idx = clean.indexOf(accent);
  if (idx === -1) return clean;
  return (
    <>
      {clean.slice(0, idx)}
      <span className="animate-shimmer bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">{accent}</span>
      {clean.slice(idx + accent.length)}
    </>
  );
}

const STAGE_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Building2, label: 'Companies' },
  { icon: FileText, label: 'Documents' },
  { icon: ListChecks, label: 'Tasks' },
  { icon: Receipt, label: 'Invoicing' },
  { icon: BarChart3, label: 'Reports' },
];

const STAGE_ACTIVITY = [
  { icon: FileCheck2, tile: 'from-teal-400 to-emerald-600', title: 'AI document processed', sub: 'Contract.pdf · ProFlow 360', time: '2m' },
  { icon: Gavel, tile: 'from-amber-400 to-orange-600', title: 'New bid placed', sub: 'Vehicle auction · Lane A', time: '14m' },
  { icon: ShoppingCart, tile: 'from-violet-400 to-purple-600', title: 'New order received', sub: 'Online store · Order #2481', time: '1h' },
];

function StageChip({ icon: Icon, tile, title, sub, className, delay }) {
  return (
    <div className={`animate-float-y absolute z-10 flex items-center gap-3 rounded-2xl border border-white/15 bg-slate-900/85 px-4 py-3 shadow-2xl shadow-blue-950/50 backdrop-blur-md ${className}`} style={{ animationDelay: delay }}>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tile}`}><Icon className="text-white" style={{ height: 18, width: 18 }} /></span>
      <span>
        <span className="block text-[13px] font-semibold leading-tight text-white">{title}</span>
        <span className="block text-[11px] leading-tight text-slate-400">{sub}</span>
      </span>
    </div>
  );
}

// The product stage: a hand-built miniature operations dashboard in a
// browser frame — razor sharp at any size, zero image weight, and the
// chart draws itself on load. Purely illustrative product UI.
function ProductStage({ t }) {
  return (
    <div className="relative">
      <div className="absolute -inset-8 rounded-full bg-gradient-to-br from-cyan-400/20 via-blue-500/10 to-purple-500/20 blur-3xl" />
      <div className="relative -rotate-1 transition-transform duration-500 hover:rotate-0">
        <div className="relative overflow-hidden rounded-[1.4rem] border border-white/15 bg-slate-950/85 shadow-2xl shadow-blue-950/50 backdrop-blur-xl">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
            <span className="mx-auto flex items-center gap-1.5 rounded-md bg-white/5 px-3 py-1 text-[11px] text-slate-400">
              <Lock className="h-3 w-3" /> proflow360.cloud
            </span>
            <span className="w-10" />
          </div>
          <div className="flex">
            {/* Mini sidebar */}
            <div className="hidden w-36 shrink-0 flex-col gap-1 border-e border-white/5 bg-white/[0.02] p-3 xl:flex">
              <div className="mb-2 flex items-center gap-2 px-1">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-purple-600 text-[10px] font-extrabold text-white">P</span>
                <span className="text-[11px] font-semibold text-white">ProFlow 360</span>
              </div>
              {STAGE_NAV.map((item) => (
                <span key={item.label} className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] ${item.active ? 'bg-blue-600 font-semibold text-white' : 'text-slate-400'}`}>
                  <item.icon className="h-3.5 w-3.5" /> {item.label}
                </span>
              ))}
            </div>
            {/* Dashboard body */}
            <div className="min-w-0 flex-1 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{t('home.hero.stage_title', 'Operations overview')}</p>
                  <p className="text-[11px] text-slate-400">{t('home.hero.stage_sub', 'Everything is on track today')}</p>
                </div>
                <div className="flex -space-x-1.5">
                  {['from-cyan-400 to-blue-600', 'from-amber-400 to-orange-600', 'from-violet-400 to-purple-600'].map((g) => (
                    <span key={g} className={`h-6 w-6 rounded-full border-2 border-slate-950 bg-gradient-to-br ${g}`} />
                  ))}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2.5">
                {[
                  { label: 'Documents', value: '12,480', delta: '+18%' },
                  { label: 'Workflows', value: '36', delta: 'Live' },
                  { label: 'On track', value: '98%', delta: '+4%' },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-xl bg-white/5 p-3">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">{kpi.label}</p>
                    <p className="mt-1 text-base font-bold leading-none text-white">{kpi.value}</p>
                    <p className="mt-1 text-[10px] font-medium text-emerald-400">{kpi.delta}</p>
                  </div>
                ))}
              </div>
              <div className="mt-2.5 rounded-xl bg-white/5 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-slate-300">Activity</p>
                  <span className="text-[10px] text-slate-500">Last 30 days</span>
                </div>
                <svg viewBox="0 0 300 90" className="mt-1 w-full" role="img" aria-label="Activity chart trending upward">
                  <defs>
                    <linearGradient id="heroChartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="heroChartStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                  </defs>
                  <path d="M0,70 C30,62 45,48 70,52 S110,30 135,36 S185,18 210,24 S260,10 300,14 L300,90 L0,90 Z" fill="url(#heroChartFill)" />
                  <path className="chart-draw" pathLength="1" d="M0,70 C30,62 45,48 70,52 S110,30 135,36 S185,18 210,24 S260,10 300,14" fill="none" stroke="url(#heroChartStroke)" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="mt-2.5 space-y-2">
                {STAGE_ACTIVITY.map((row) => (
                  <div key={row.title} className="flex items-center gap-2.5 rounded-lg bg-white/[0.03] px-3 py-2">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${row.tile}`}><row.icon className="h-3.5 w-3.5 text-white" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-medium text-slate-200">{row.title}</span>
                      <span className="block truncate text-[10px] text-slate-500">{row.sub}</span>
                    </span>
                    <span className="text-[10px] text-slate-500">{row.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <StageChip icon={CreditCard} tile="from-blue-500 to-blue-700" title={t('home.hero.chip_payment', 'Payment received')} sub={t('home.hero.chip_payment_sub', 'Invoice #1042 · Settled')} className="-top-7 end-2" delay="0s" />
      <StageChip icon={UserPlus} tile="from-violet-500 to-purple-700" title={t('home.hero.chip_lead', 'New lead captured')} sub={t('home.hero.chip_lead_sub', 'Website inquiry · Contact form')} className="top-[44%] -end-4" delay="1.4s" />
      <StageChip icon={ClipboardCheck} tile="from-teal-400 to-emerald-600" title={t('home.hero.chip_delivered', 'Project delivered')} sub={t('home.hero.chip_delivered_sub', 'On time · This week')} className="-bottom-8 start-4" delay="2.6s" />
    </div>
  );
}

export default function HeroSection() {
  const { t, i18n } = useTranslation();
  const { data: heroContent } = useQuery({
    queryKey: ['hero-content'],
    queryFn: async () => {
      const sections = await dataLayer.homeContent.getBySection('hero');
      return sections[0] || {};
    }
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

  const title = getLoc('title') || t('home.hero_title_default', 'Custom Software, Web & AI Solutions for UAE Businesses');
  const description = getLoc('description') || t('home.hero_desc_default', 'Websites, custom software, mobile apps, automation, digital marketing, and IT support — delivered by one accountable team in the UAE.');
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

  const subtitle = getLoc('subtitle') || t('home.future_ready', 'AI-enabled business solutions, built for real operations');
  const stats = [
    { value: '80+', label: t('home.hero.clients', 'Clients') },
    { value: projects.length ? String(projects.length) : '11', label: t('home.hero.case_studies', 'Case Studies') },
    { value: industries.length ? String(industries.length) : '9', label: t('home.hero.industries', 'Industries') },
  ];

  return (
    <section style={sectionStyle} className={`relative ${sectionHeightClass} flex items-center overflow-hidden bg-slate-900`}>
      {/* Animated Background */}
      <div className="absolute inset-0">
        {heroContent?.background_video ? (
          <video src={heroContent.background_video} poster={heroContent.background_image ? optimizeImageUrl(heroContent.background_image, 1200) : undefined} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover opacity-35" />
        ) : heroContent?.background_image ? (
          <img src={optimizeImageUrl(heroContent.background_image, 1920)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-pink-600/20" />
        {/* Glow orbs as layered radial gradients: same look as the old
            blur-[150px] divs, but with no filter repaint cost and no
            pulsing animation for the compositor to chase. */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(800px 800px at 0% 0%, rgba(59,130,246,0.30), transparent 65%), radial-gradient(700px 700px at 100% 100%, rgba(168,85,247,0.30), transparent 65%), radial-gradient(500px 500px at 50% 50%, rgba(236,72,153,0.18), transparent 65%)' }} />

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
            <AccentTitle title={title} />
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
            className="mt-12 border-t border-white/10 pt-8"
          >
            <div className="grid max-w-lg grid-cols-3 gap-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative hidden lg:block">
            <ProductStage t={t} />
          </motion.div>
        </div>
      </div>

    </section>
  );
}

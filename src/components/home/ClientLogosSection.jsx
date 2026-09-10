import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../dataLayer';
import { useTranslation } from 'react-i18next';
import { getLocalizedValue } from '../../utils';
import { ExternalLink } from 'lucide-react';

const getSafeWebsiteUrl = (value) => {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};

export default function ClientLogosSection() {
  const { t, i18n } = useTranslation();
  const reduceMotion = useReducedMotion();
  const { data: logos = [] } = useQuery({
    queryKey: ['client-logos'],
    queryFn: () => dataLayer.clientLogos.getAll()
  });
  const { data: sectionContent = {} } = useQuery({
    queryKey: ['home-section', 'clients'],
    queryFn: async () => (await dataLayer.homeContent.getBySection('clients'))[0] || {}
  });

  // Client names are trust signals, so only show entries managed in the CMS.
  const items = logos.filter((logo) => logo?.name);
  const [itemsPerView, setItemsPerView] = useState(7);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [activeLogoId, setActiveLogoId] = useState(null);

  useEffect(() => {
    const updateItemsPerView = () => setItemsPerView(window.innerWidth < 640 ? 2 : window.innerWidth < 1024 ? 4 : 7);
    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion || items.length <= itemsPerView) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 3200);
    return () => clearInterval(id);
  }, [items.length, itemsPerView, paused, reduceMotion]);

  const visible = useMemo(() => {
    if (items.length <= itemsPerView) return items;
    const arr = [];
    for (let i = 0; i < itemsPerView; i++) {
      arr.push(items[(index + i) % items.length]);
    }
    return arr;
  }, [items, index, itemsPerView]);

  if (items.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-slate-50 py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-9 text-center"
        >
          <p className="text-slate-500 font-medium">
            {getLocalizedValue(sectionContent, 'title', i18n.language, false) || (i18n.language === 'ar' ? 'موثوق به من قبل الشركات الرائدة' : t('home.trusted_by', 'Trusted by Leading Companies'))}
          </p>
        </motion.div>

        <div
          className="relative flex min-h-36 items-center justify-center gap-3 sm:gap-4 lg:gap-5"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => { setPaused(false); setActiveLogoId(null); }}
          onTouchStart={() => setPaused(true)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setPaused(false);
              setActiveLogoId(null);
            }
          }}
          aria-label={t('home.client_logos', 'Client websites')}
        >
          <AnimatePresence initial={false} mode="popLayout">
          {visible.map((logo, i) => {
            const itemId = logo.id || logo.name;
            const isActive = activeLogoId === itemId;
            const safeWebsiteUrl = getSafeWebsiteUrl(logo.website_url);
            const logoContent = logo.logo_url ? (
              <img
                src={logo.logo_url}
                alt={logo.name}
                loading="lazy"
                decoding="async"
                className={`relative z-10 max-h-14 w-full object-contain transition-[filter] duration-500 sm:max-h-16 ${isActive ? 'grayscale-0 brightness-110 saturate-150 contrast-110' : 'grayscale brightness-75 contrast-125'}`}
              />
            ) : (
              <span className="relative z-10 font-bold text-slate-700">{logo.name}</span>
            );
            return (
            <motion.div
              layout
              key={itemId}
              initial={{ opacity: 0, x: 18 }}
              animate={{
                opacity: activeLogoId ? (isActive ? 1 : 0.38) : 0.72,
                scale: isActive && !reduceMotion ? 1.16 : activeLogoId ? 0.96 : 1,
                y: isActive && !reduceMotion ? -5 : 0
              }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ layout: { type: 'spring', stiffness: 280, damping: 28 }, opacity: { duration: 0.28 }, delay: activeLogoId ? 0 : i * 0.025 }}
              onMouseEnter={() => setActiveLogoId(itemId)}
              onTouchStart={() => setActiveLogoId(itemId)}
              className={`relative flex h-28 min-w-0 flex-1 items-center justify-center rounded-2xl px-3 sm:px-5 ${isActive ? 'z-20' : 'z-0'}`}
            >
              {isActive && <motion.span layoutId="client-logo-spotlight" className="absolute inset-0 rounded-2xl border border-blue-100 bg-white shadow-[0_18px_55px_-22px_rgba(37,99,235,0.65)]" transition={{ type: 'spring', stiffness: 320, damping: 30 }} />}
              {safeWebsiteUrl ? (
                <a href={safeWebsiteUrl} target="_blank" rel="noopener noreferrer" onFocus={() => setActiveLogoId(itemId)} onBlur={() => setActiveLogoId(null)} aria-label={`${t('home.visit_company', 'Visit')} ${logo.name}`} className="relative z-10 flex h-full w-full items-center justify-center rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
                  {logoContent}
                  <span className={`absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-slate-950 px-3 py-1 text-[11px] font-semibold text-white shadow-lg transition duration-300 ${isActive ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`}>{logo.name}<ExternalLink className="h-3 w-3" /></span>
                </a>
              ) : <div className="relative z-10 flex h-full w-full items-center justify-center">{logoContent}</div>}
            </motion.div>
            );
          })}
          </AnimatePresence>
        </div>
        {items.length > itemsPerView && <p className="mt-4 text-center text-xs text-slate-400">{t('home.logo_interaction_hint', 'Hover or focus to explore. The showcase pauses while you interact.')}</p>}
      </div>
    </section>
  );
}

import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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
  const [paused, setPaused] = useState(false);

  // One full set per half; the track loops seamlessly at -50%. Repeat small
  // sets so a half is always wider than the screen.
  const half = useMemo(() => {
    if (items.length === 0) return [];
    const repeat = Math.max(1, Math.ceil(10 / items.length));
    return Array.from({ length: repeat }, () => items).flat();
  }, [items]);
  const sequence = useMemo(() => [...half, ...half], [half]);
  // ~2.2s of travel per logo: brisk, but each logo stays readable.
  const duration = Math.max(20, half.length * 2.2);

  if (items.length === 0) return null;

  const renderLogo = (logo, key, ariaHidden = false) => {
    const safeWebsiteUrl = getSafeWebsiteUrl(logo.website_url);
    const logoContent = logo.logo_url ? (
      <img
        src={logo.logo_url}
        alt={ariaHidden ? '' : logo.name}
        width={176}
        height={48}
        loading="eager"
        decoding="async"
        className="max-h-9 w-auto max-w-full object-contain grayscale brightness-75 contrast-125 transition duration-300 group-hover:grayscale-0 group-hover:brightness-100 group-hover:contrast-100 sm:max-h-11 lg:max-h-12"
      />
    ) : (
      <span className="font-bold text-slate-700">{logo.name}</span>
    );
    const cell = (
      <div className="group relative flex h-16 w-28 flex-none items-center justify-center px-3 sm:h-20 sm:w-36 sm:px-4 lg:w-44" aria-hidden={ariaHidden || undefined}>
        {safeWebsiteUrl ? (
          <a
            href={safeWebsiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={ariaHidden ? -1 : undefined}
            aria-label={`${t('home.visit_company', 'Visit')} ${logo.name}`}
            className="flex h-full w-full items-center justify-center rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            {logoContent}
            <span className="pointer-events-none absolute -bottom-1 left-1/2 flex -translate-x-1/2 translate-y-2 items-center gap-1 whitespace-nowrap rounded-full bg-slate-950 px-3 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">{logo.name}<ExternalLink className="h-3 w-3" /></span>
          </a>
        ) : logoContent}
      </div>
    );
    return <div key={key} className="flex-none">{cell}</div>;
  };

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
      </div>

      {reduceMotion ? (
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center px-4 sm:px-6 lg:px-8" aria-label={t('home.client_logos', 'Client websites')}>
          {items.map((logo, i) => renderLogo(logo, `static-${logo.id || logo.name}-${i}`))}
        </div>
      ) : (
        <div
          className={`relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] ${paused ? 'marquee-paused' : ''}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
          }}
          aria-label={t('home.client_logos', 'Client websites')}
        >
          <div className="marquee-track" style={{ '--marquee-duration': `${duration}s` }}>
            {sequence.map((logo, i) => renderLogo(logo, `mq-${logo.id || logo.name}-${i}`, i >= half.length))}
          </div>
        </div>
      )}
      {!reduceMotion && <p className="mt-4 text-center text-xs text-slate-400">{t('home.logo_interaction_hint', 'Hover or touch to pause the showcase.')}</p>}
    </section>
  );
}

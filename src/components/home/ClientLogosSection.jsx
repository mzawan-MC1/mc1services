import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../dataLayer';
import { useTranslation } from 'react-i18next';

export default function ClientLogosSection() {
  const { t, i18n } = useTranslation();
  const { data: logos = [] } = useQuery({
    queryKey: ['client-logos'],
    queryFn: () => dataLayer.clientLogos.getAll()
  });

  // Fallback logos if none in database
  const displayLogos = logos.length > 0 ? logos : [
    { name: 'TechCorp', logo_url: null },
    { name: 'InnovateLab', logo_url: null },
    { name: 'GrowthCo', logo_url: null },
    { name: 'FutureTech', logo_url: null },
    { name: 'DigitalFirst', logo_url: null },
    { name: 'CloudNine', logo_url: null }
  ];

  const items = displayLogos;
  const itemsPerView = 7;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length <= itemsPerView) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 3000);
    return () => clearInterval(id);
  }, [paused, items.length]);

  const visible = useMemo(() => {
    if (items.length <= itemsPerView) return items;
    const arr = [];
    for (let i = 0; i < itemsPerView; i++) {
      arr.push(items[(index + i) % items.length]);
    }
    return arr;
  }, [items, index]);

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-slate-500 font-medium">
            {i18n.language === 'ar' ? 'موثوق به من قبل الشركات الرائدة' : t('home.trusted_by', 'Trusted by Leading Companies')}
          </p>
        </motion.div>

        <div
          className="flex justify-center items-center gap-8 md:gap-16 overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
        >
          {visible.map((logo, i) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="grayscale hover:grayscale-0 transition-all duration-300"
            >
              <a href={logo.website_url || '#'} target={logo.website_url ? '_blank' : undefined} rel="noopener noreferrer">
                {logo.logo_url ? (
                  <img src={logo.logo_url} alt={logo.name} className="h-10 md:h-12 object-contain" />
                ) : (
                  <div className="h-10 md:h-12 px-6 bg-slate-200 rounded-lg flex items-center justify-center">
                    <span className="text-slate-500 font-semibold">{logo.name}</span>
                  </div>
                )}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { motion } from 'framer-motion';
import { ArrowUpRight, Building2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { getLocalizedValue } from '../../utils';

export default function PortfolioCard({ portfolio, index = 0, masonry = false }) {
  const { t, i18n } = useTranslation();

  const getLoc = (obj, key) => getLocalizedValue(obj, key, i18n.language);

  // We can use the translation keys we added to common.json
  const getCategoryLabel = (cat) => {
    return t(`portfolio.categories.${cat}`, cat);
  };

  const title = getLoc(portfolio, 'title');
  const description = getLoc(portfolio, 'short_description') || getLoc(portfolio, 'description');
  const headline = getLoc(portfolio, 'headline') || description;
  const clientName = portfolio.client_name; // Assuming client name is usually same, or we could add _ar if needed but usually names are proper nouns.
  const projectType = portfolio.project_type === 'mc1_product' ? t('portfolio.mc1_product', 'MC1 Product') : t('portfolio.client_project', 'Client Project');

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        to={createPageUrl(`PortfolioDetail?id=${portfolio.id}`)}
        className="group block h-full overflow-hidden rounded-[1.75rem] bg-slate-950 shadow-sm ring-1 ring-slate-900/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-950/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <div className={`relative ${masonry ? 'aspect-[4/3] md:aspect-square' : 'aspect-[4/3]'} overflow-hidden bg-slate-900`}>
          {portfolio.main_image_url || portfolio.image_url ? (
            <img
              src={portfolio.main_image_url || portfolio.image_url}
              alt={title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-4xl font-bold">{title?.[0]}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/10" />
          <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge className="border border-white/15 bg-slate-950/70 text-white backdrop-blur-md hover:bg-slate-950/70">{projectType}</Badge>
              {portfolio.is_featured && <Badge className="border border-blue-300/30 bg-blue-500/80 text-white backdrop-blur-md hover:bg-blue-500/80"><Sparkles className="mr-1 h-3 w-3" />{t('portfolio.featured', 'Featured')}</Badge>}
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-950 shadow-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"><ArrowUpRight className="h-5 w-5 rtl:-scale-x-100" /></span>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">{getCategoryLabel(portfolio.category)}</p>
            <h3 className="text-xl font-bold leading-tight text-white md:text-2xl">{title}</h3>
            {headline && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-200">{headline}</p>}
            {clientName && <p className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-300"><Building2 className="h-3.5 w-3.5" />{clientName}</p>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { motion } from 'framer-motion';
import { ArrowUpRight, Building2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { getLocalizedValue } from '../../utils';
import { getPortfolioCategoryLabel, usePortfolioCategories } from '../../hooks/usePortfolioCategories';

export default function PortfolioCard({ portfolio, index = 0, masonry = false }) {
  const { t, i18n } = useTranslation();
  const { data: portfolioCategories = [] } = usePortfolioCategories();

  const getLoc = (obj, key) => getLocalizedValue(obj, key, i18n.language);

  const title = getLoc(portfolio, 'title');
  const description = getLoc(portfolio, 'short_description') || getLoc(portfolio, 'description');
  const headline = getLoc(portfolio, 'headline') || description;
  const clientName = portfolio.client_name; // Assuming client name is usually same, or we could add _ar if needed but usually names are proper nouns.
  const projectType = portfolio.project_type === 'mc1_product' ? t('portfolio.mc1_product', 'MCS Product') : t('portfolio.client_project', 'Client Project');

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        to={createPageUrl(`PortfolioDetail?id=${portfolio.id}`)}
        className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-sm ring-1 ring-slate-200 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-blue-950/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <div className={`relative ${masonry ? 'aspect-[4/3]' : 'aspect-[16/10]'} overflow-hidden bg-slate-900`}>
          {portfolio.main_image_url || portfolio.image_url ? (
            <img
              src={portfolio.main_image_url || portfolio.image_url}
              alt={title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-4xl font-bold">{title?.[0]}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-slate-950/10" />
          <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge className="border border-white/15 bg-slate-950/70 text-white backdrop-blur-md hover:bg-slate-950/70">{projectType}</Badge>
              {portfolio.is_featured && <Badge className="border border-blue-300/30 bg-blue-500/80 text-white backdrop-blur-md hover:bg-blue-500/80"><Sparkles className="mr-1 h-3 w-3" />{t('portfolio.featured', 'Featured')}</Badge>}
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-950 shadow-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"><ArrowUpRight className="h-5 w-5 rtl:-scale-x-100" /></span>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5 md:p-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">{getPortfolioCategoryLabel(portfolioCategories, portfolio.category, i18n.language)}</p>
          <h3 className="line-clamp-2 text-xl font-bold leading-tight text-slate-950 md:text-2xl">{title}</h3>
          {headline && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">{headline}</p>}
          {clientName && <p className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500"><Building2 className="h-3.5 w-3.5 text-blue-500" />{clientName}</p>}
        </div>
      </Link>
    </motion.div>
  );
}

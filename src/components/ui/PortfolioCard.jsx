import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
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
  const description = getLoc(portfolio, 'description') || getLoc(portfolio, 'short_description');
  const clientName = portfolio.client_name; // Assuming client name is usually same, or we could add _ar if needed but usually names are proper nouns.

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        to={createPageUrl(`PortfolioDetail?id=${portfolio.id}`)}
        className="group block h-full overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300"
      >
        <div className={`relative ${masonry ? 'aspect-square' : 'aspect-[4/3]'} overflow-hidden bg-slate-100`}>
          {portfolio.main_image_url || portfolio.image_url ? (
            <img
              src={portfolio.main_image_url || portfolio.image_url}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-4xl font-bold">{title?.[0]}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 right-4 rtl:right-auto rtl:left-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-slate-900 rtl:-scale-x-100" />
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <Badge variant="secondary" className="mb-3 bg-blue-50 text-blue-600 hover:bg-blue-50">
            {getCategoryLabel(portfolio.category)}
          </Badge>
          <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition">
            {title}
          </h3>
          <p className="text-slate-600 line-clamp-2">
            {description}
          </p>
          {clientName && (
            <p className="text-sm text-slate-400 mt-3">
              {t('portfolio.client', 'Client')}: {clientName}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

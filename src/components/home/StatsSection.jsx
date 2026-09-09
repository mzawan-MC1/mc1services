import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../dataLayer';
import { Briefcase, Users, Cpu, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const STAT_ICONS = { Briefcase, Users, Cpu, Calendar };
const FALLBACK_ICONS = [Briefcase, Users, Cpu, Calendar];

export default function StatsSection() {
  const { i18n } = useTranslation();

  const { data: statsContent = [] } = useQuery({
    queryKey: ['stats-section'],
    queryFn: async () => {
      const sections = await dataLayer.homeContent.getBySection('stats');
      const stats = sections[0]?.content_data?.stats;
      return Array.isArray(stats) ? stats : [];
    }
  });

  const verifiedStats = statsContent
    .filter((stat) => stat?.value && (stat?.label || stat?.label_ar))
    .map((stat, index) => ({
      ...stat,
      icon: STAT_ICONS[stat.icon] || FALLBACK_ICONS[index % FALLBACK_ICONS.length]
    }));

  if (verifiedStats.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {verifiedStats.map((stat, i) => (
            <motion.div
              key={`${stat.label}-${stat.value}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <p className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</p>
              <p className="text-slate-400">{i18n.language === 'ar' ? stat.label_ar || stat.label : stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

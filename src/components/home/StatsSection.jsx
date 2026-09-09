import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../dataLayer';
import { Briefcase, Users, Cpu, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function StatsSection() {
  const { t, i18n } = useTranslation();

  const stats = [
    { icon: Briefcase, value: '200+', label: i18n.language==='ar' ? 'مشروعًا مُنجزًا' : t('home.stats.projects', 'Projects Delivered') },
    { icon: Users, value: '80+', label: i18n.language==='ar' ? 'عملاء سعداء' : t('home.stats.clients', 'Happy Clients') },
    { icon: Cpu, value: '50+', label: i18n.language==='ar' ? 'تقنيات' : t('home.stats.technologies', 'Technologies') },
    { icon: Calendar, value: '10+', label: i18n.language==='ar' ? 'سنوات خبرة' : t('home.stats.experience', 'Years Experience') }
  ];

  const { data: statsContent } = useQuery({
    queryKey: ['stats-section'],
    queryFn: async () => {
      const sections = await dataLayer.homeContent.getBySection('stats');
      if (sections[0]?.content_data?.stats) {
        return sections[0].content_data.stats;
      }
      return stats;
    },
    initialData: stats
  });

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {statsContent.map((stat, i) => (
            <motion.div
              key={stat.label}
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
              <p className="text-slate-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

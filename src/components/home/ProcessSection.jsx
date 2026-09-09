import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../dataLayer';
import { Search, Palette, Code, Rocket } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLocalizedValue } from '../../utils';

export default function ProcessSection() {
  const { t, i18n } = useTranslation();

  const steps = [
    {
      icon: Search,
      title: t('home.process.steps.discovery.title', 'Discover'),
      description: t('home.process.steps.discovery.desc', 'We dive deep into your business goals, audience, and challenges to craft the perfect strategy.'),
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Palette,
      title: t('home.process.steps.design.title', 'Design'),
      description: t('home.process.steps.design.desc', 'Our creative team designs stunning, user-centered experiences that captivate and convert.'),
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Code,
      title: t('home.process.steps.develop.title', 'Develop'),
      description: t('home.process.steps.develop.desc', 'We build robust, scalable solutions using cutting-edge technologies and best practices.'),
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Rocket,
      title: t('home.process.steps.deliver.title', 'Deliver'),
      description: t('home.process.steps.deliver.desc', 'Launch with confidence. We ensure smooth deployment and provide ongoing support.'),
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const { data: processContent } = useQuery({
    queryKey: ['process-section'],
    queryFn: async () => {
      const sections = await dataLayer.homeContent.getBySection('process');
      return sections[0] || {};
    }
  });

  const getLoc = (obj, key) => getLocalizedValue(obj, key, i18n.language, false);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-4">
            {getLoc(processContent, 'subtitle') || t('home.process.subtitle', 'Our Process')}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
            {getLoc(processContent, 'title') || t('home.process.title', 'How We Work')}
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {getLoc(processContent, 'description') || t('home.process.desc', 'A clear four-step process that turns business needs into practical digital solutions')}
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 -translate-y-1/2" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-8 text-center relative z-10 border border-slate-100 hover:shadow-xl transition-shadow">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {i + 1}
                  </div>

                  <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

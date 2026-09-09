import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl, getLocalizedValue } from '../../utils';
import { motion } from 'framer-motion';

import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../dataLayer';
import { Code, Megaphone, Server, Zap, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ServicesHighlight() {
  const { t, i18n } = useTranslation();

  const highlights = [
    {
      icon: Code,
      title: t('home.services_highlight.software.title', 'Software Development'),
      description: t('home.services_highlight.software.desc', 'Custom web apps, mobile applications, and enterprise software built with cutting-edge technologies.'),
      features: [
        t('home.services_highlight.software.features.web', 'Web Applications'),
        t('home.services_highlight.software.features.mobile', 'Mobile Apps'),
        t('home.services_highlight.software.features.custom', 'Custom Software'),
        t('home.services_highlight.software.features.api', 'API Development')
      ],
      href: 'DevelopmentServices',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Megaphone,
      title: t('home.services_highlight.marketing.title', 'Digital Marketing'),
      description: t('home.services_highlight.marketing.desc', 'Data-driven marketing strategies that amplify your brand and drive measurable growth.'),
      features: [
        t('home.services_highlight.marketing.features.seo', 'SEO & SEM'),
        t('home.services_highlight.marketing.features.social', 'Social Media'),
        t('home.services_highlight.marketing.features.content', 'Content Marketing'),
        t('home.services_highlight.marketing.features.paid', 'Paid Advertising')
      ],
      href: 'MarketingServices',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Zap,
      title: t('home.services_highlight.automation.title', 'Automation'),
      description: t('home.services_highlight.automation.desc', 'Streamline your business and marketing with intelligent automation solutions.'),
      features: [
        t('home.services_highlight.automation.features.process', 'Business Process'),
        t('home.services_highlight.automation.features.marketing', 'Marketing Automation'),
        t('home.services_highlight.automation.features.crm', 'CRM Workflows'),
        t('home.services_highlight.automation.features.ai', 'AI Integration')
      ],
      href: 'Automation',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: Server,
      title: t('home.services_highlight.it.title', 'IT Solutions'),
      description: t('home.services_highlight.it.desc', 'Comprehensive IT infrastructure, cloud services, and managed solutions for your business.'),
      features: [
        t('home.services_highlight.it.features.cloud', 'Cloud Services'),
        t('home.services_highlight.it.features.devops', 'DevOps'),
        t('home.services_highlight.it.features.consulting', 'IT Consulting'),
        t('home.services_highlight.it.features.security', 'Cybersecurity')
      ],
      href: 'ITServices',
      color: 'from-green-500 to-teal-500'
    }
  ];

  const { data: servicesContent } = useQuery({
    queryKey: ['services-section'],
    queryFn: async () => {
      const sections = await dataLayer.homeContent.getBySection('services');
      return sections[0] || {};
    }
  });

  const getLoc = (obj, key) => getLocalizedValue(obj, key, i18n.language, false);

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-4">
            {getLoc(servicesContent, 'subtitle') || t('home.services_highlight.subtitle', 'What We Do')}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
            {getLoc(servicesContent, 'title') || t('home.services_highlight.title', 'Our Core Services')}
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {getLoc(servicesContent, 'description') || t('home.services_highlight.desc', 'End-to-end digital solutions tailored to your business needs')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={createPageUrl(item.href)}
                className="group block h-full bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition">
                  {item.title}
                </h3>

                <p className="text-slate-600 mb-6 leading-relaxed">
                  {item.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {item.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-slate-600">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-2 text-blue-600 font-medium">
                  <span>{t('common.learn_more', 'Learn More')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform rtl:rotate-180 rtl:group-hover:-translate-x-2" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
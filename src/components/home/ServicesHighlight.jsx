import { Link } from 'react-router-dom';
import { createPageUrl, getLocalizedValue } from '../../utils';
import { motion } from 'framer-motion';

import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../dataLayer';
import { ArrowRight, Boxes, Clapperboard, CloudCog, Code, Code2, Megaphone, PanelsTopLeft, Server, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ServicesHighlight() {
  const { t, i18n } = useTranslation();

  const { data: managedServices = [] } = useQuery({
    queryKey: ['active-services'],
    queryFn: () => dataLayer.services.getActive()
  });

  const fallbackHighlights = [
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
  const iconMap = { Boxes, Clapperboard, CloudCog, Code, Code2, Megaphone, PanelsTopLeft, Server, Sparkles, TrendingUp, Zap };
  const colors = ['from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-amber-500 to-orange-500', 'from-green-500 to-teal-500'];
  const legacyRouteBySlug = {
    'web-development': 'WebDevelopment',
    'app-development': 'AppDevelopment',
    'mobile-app-development': 'AppDevelopment',
    'digital-marketing': 'DigitalMarketing',
    automation: 'Automation',
    production: 'Production',
    'it-services': 'ITServices',
    'professional-services': 'ITServices'
  };
  const desktopCardSpans = [
    'core-service-span-18', 'core-service-span-12',
    'core-service-span-12', 'core-service-span-18',
    'core-service-span-10', 'core-service-span-10', 'core-service-span-10'
  ];
  const highlights = managedServices.length
    ? managedServices.filter((service) => !service.parent_id).slice(0, 7).map((service, index) => ({
        icon: iconMap[service.icon] || Code,
        title: i18n.language === 'ar' ? service.title_ar || service.title : service.title,
        description: i18n.language === 'ar' ? service.description_ar || service.description : service.description,
        features: i18n.language === 'ar' ? service.features_ar || service.features || [] : service.features || [],
        href: service.slug ? `/solutions/${service.slug}` : service.page_url || legacyRouteBySlug[service.slug] || 'DevelopmentServices',
        color: colors[index % colors.length]
      }))
    : fallbackHighlights;

  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(37,99,235,0.22),transparent_32%),radial-gradient(circle_at_85%_70%,rgba(147,51,234,0.18),transparent_30%)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-1.5 text-sm font-medium text-cyan-200 mb-4">
            {getLoc(servicesContent, 'subtitle') || t('home.services_highlight.subtitle', 'What We Do')}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            {getLoc(servicesContent, 'title') || t('home.services_highlight.title', 'Our Core Services')}
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            {getLoc(servicesContent, 'description') || t('home.services_highlight.desc', 'End-to-end digital solutions tailored to your business needs')}
          </p>
        </motion.div>

        <div className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-[repeat(30,minmax(0,1fr))]">
          {highlights.map((item, i) => {
            const isWideCard = i === 0 || i === 3;
            return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`h-full ${desktopCardSpans[i] || 'core-service-span-10'}`}
            >
              <Link
                to={item.href?.startsWith('/') ? item.href : createPageUrl(item.href)}
                className={`group relative flex h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.1] hover:shadow-2xl hover:shadow-blue-950/40 ${isWideCard ? 'lg:p-10' : ''}`}
              >
                {isWideCard && <><div className={`pointer-events-none absolute -bottom-20 -right-16 h-64 w-64 rounded-full bg-gradient-to-br ${item.color} opacity-15 blur-3xl transition duration-500 group-hover:opacity-25`} /><item.icon className="pointer-events-none absolute -bottom-8 right-8 h-48 w-48 text-white/[0.035] transition duration-500 group-hover:-translate-y-2 group-hover:text-white/[0.07]" strokeWidth={0.8} /></>}
                <span className="absolute right-6 top-5 text-5xl font-black text-white/[0.04]">{String(i + 1).padStart(2, '0')}</span>
                <div className={`relative w-full ${isWideCard ? 'lg:grid lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-x-8' : ''}`}>
                  <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>

                  <div className="flex h-full flex-col">
                    <h3 className={`font-bold text-white mb-3 group-hover:text-cyan-200 transition ${isWideCard ? 'text-2xl lg:text-3xl' : 'text-2xl'}`}>
                      {item.title}
                    </h3>

                    <p className="text-slate-300 mb-6 leading-relaxed">
                      {item.description}
                    </p>

                    <ul className={`space-y-2 mb-6 ${isWideCard ? 'sm:grid sm:grid-cols-2 sm:gap-x-6 sm:space-y-0 sm:[&>li]:mb-2' : ''}`}>
                      {item.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                          <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto flex items-center gap-2 pt-2 text-cyan-300 font-medium">
                      <span>{t('common.learn_more', 'Learn More')}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform rtl:rotate-180 rtl:group-hover:-translate-x-2" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

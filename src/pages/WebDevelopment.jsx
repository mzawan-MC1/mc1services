import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import {
  Globe, Code, Palette, Smartphone, Zap, Shield, ArrowRight, Database
} from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';
import PortfolioCard from '../components/ui/PortfolioCard';
import SEOHead from '../components/SEOHead';
import { useTranslation } from 'react-i18next';
import { getLocalizedValue } from '../utils';

export default function WebDevelopment() {
  const { t, i18n } = useTranslation();

  const features = [
    { icon: Code, title: t('services_page.web_development.features.custom_dev.title', 'Custom Development'), desc: t('services_page.web_development.features.custom_dev.desc', 'Tailored solutions built from scratch to match your unique requirements.') },
    { icon: Palette, title: t('services_page.web_development.features.ui_ux.title', 'UI/UX Design'), desc: t('services_page.web_development.features.ui_ux.desc', 'Beautiful, intuitive interfaces that delight users and drive conversions.') },
    { icon: Smartphone, title: t('services_page.web_development.features.responsive.title', 'Responsive Design'), desc: t('services_page.web_development.features.responsive.desc', 'Seamless experience across all devices, from desktop to mobile.') },
    { icon: Zap, title: t('services_page.web_development.features.performance.title', 'Performance'), desc: t('services_page.web_development.features.performance.desc', 'Lightning-fast load times and optimized performance for better rankings.') },
    { icon: Shield, title: t('services_page.web_development.features.security.title', 'Security'), desc: t('services_page.web_development.features.security.desc', 'Enterprise-grade security measures to protect your data and users.') },
    { icon: Database, title: t('services_page.web_development.features.cms.title', 'CMS Integration'), desc: t('services_page.web_development.features.cms.desc', 'Easy content management with popular platforms like WordPress.') }
  ];

  const process = [
    { step: '01', title: t('services_page.web_development.process.discovery.title', 'Discovery'), desc: t('services_page.web_development.process.discovery.desc', 'Understanding your goals, audience, and requirements.') },
    { step: '02', title: t('services_page.web_development.process.design.title', 'Design'), desc: t('services_page.web_development.process.design.desc', 'Creating wireframes and visual designs for approval.') },
    { step: '03', title: t('services_page.web_development.process.development.title', 'Development'), desc: t('services_page.web_development.process.development.desc', 'Building your website with clean, maintainable code.') },
    { step: '04', title: t('services_page.web_development.process.launch.title', 'Launch'), desc: t('services_page.web_development.process.launch.desc', 'Testing, optimization, and deployment to production.') }
  ];

  const { data: portfolios = [] } = useQuery({
    queryKey: ['web-portfolios'],
    queryFn: async () => {
      const all = await dataLayer.portfolio.getPublished();
      return all.filter(p => p.category === 'web_development').slice(0, 3);
    }
  });

  // Fetch page specific content if available in DB, otherwise use static translations
  const { data: pageContent } = useQuery({
    queryKey: ['service-content', 'web-development'],
    queryFn: () => dataLayer.servicePageContent.getBySlug('web-development')
  });

  const getLoc = (obj, key) => getLocalizedValue(obj, key, i18n.language);

  return (
    <div>
      <SEOHead pageIdentifier="web-development" />
      {/* Hero */}
      <section className="relative py-24 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[150px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {getLoc(pageContent, 'hero_title') || t('services_page.web_development.title', 'Web Development')}
              </h1>
              <p className="text-xl text-slate-300 mb-8">
                {getLoc(pageContent, 'hero_description') || t('services_page.web_development.description', 'We create stunning, high-performance websites and web applications that help your business stand out and succeed online.')}
              </p>
              <Link
                to={createPageUrl('Contact?service=web_development')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-medium hover:shadow-lg transition-all"
              >
                {getLoc(pageContent, 'cta_text') || t('services_page.hero.cta', 'Start Your Project')}
                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block"
            >
              <img
                src="https://images.unsplash.com/photo-1547658719-da2b51169166?w=800"
                alt={t('alt.web_development', 'Web Development')}
                className="rounded-3xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label={t('services_page.sections.what_we_offer', 'What We Offer')}
            title={t('services_page.web_development.comprehensive_solutions', 'Comprehensive Web Solutions')}
            description={t('services_page.web_development.solutions_desc', 'From simple landing pages to complex web applications, we have the expertise to bring your vision to life.')}
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-lg transition"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label={t('services_page.sections.process', 'Our Process')}
            title={t('services_page.sections.how_we_work', 'How We Work')}
            description={t('services_page.sections.process_desc', 'A clear delivery process that keeps scope, progress, and decisions visible.')}
          />
          <div className="grid md:grid-cols-4 gap-8">
            {process.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className="text-6xl font-bold text-blue-100 mb-4">{item.step}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
                {i < process.length - 1 && (
                  <div className="hidden md:block absolute top-8 right-0 w-1/2 h-0.5 bg-blue-100 translate-x-1/2 rtl:-translate-x-1/2 rtl:left-0 rtl:right-auto" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio */}
      {portfolios.length > 0 && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label={t('services_page.sections.our_work', 'Our Work')}
              title={t('services_page.sections.recent_work', 'Web Development Projects')}
              description={t('services_page.web_development.recent_work', 'See some of our recent web development work.')}
            />
            <div className="grid md:grid-cols-3 gap-8">
              {portfolios.map((p, i) => (
                <PortfolioCard key={p.id} portfolio={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('services_page.web_development.cta_title', 'Ready to Build Your Website?')}
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            {t('services_page.cta.lets_create', "Let's create something amazing together.")}
          </p>
          <Link
            to={createPageUrl('Contact?service=web_development')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-medium hover:shadow-lg transition-all"
          >
            {t('services_page.cta.get_in_touch', 'Get In Touch')}
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </Link>
        </div>
      </section>
    </div>
  );
}

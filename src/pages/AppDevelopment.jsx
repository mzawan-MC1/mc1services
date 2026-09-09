import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import {
  Smartphone, Layers, Cpu, Cloud, Lock, Rocket,
  ArrowRight, CheckCircle
} from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';
import PortfolioCard from '../components/ui/PortfolioCard';
import SEOHead from '../components/SEOHead';
import { useTranslation } from 'react-i18next';

export default function AppDevelopment() {
  const { t } = useTranslation();

  const services = [
    { icon: Smartphone, title: t('services_page.app_development.services.ios.title', 'iOS Development'), desc: t('services_page.app_development.services.ios.desc', 'Native iOS apps with Swift for iPhone and iPad.') },
    { icon: Layers, title: t('services_page.app_development.services.android.title', 'Android Development'), desc: t('services_page.app_development.services.android.desc', 'Native Android apps with Kotlin for all devices.') },
    { icon: Cpu, title: t('services_page.app_development.services.cross_platform.title', 'Cross-Platform'), desc: t('services_page.app_development.services.cross_platform.desc', 'React Native & Flutter for cost-effective multi-platform apps.') },
    { icon: Cloud, title: t('services_page.app_development.services.backend.title', 'Backend & APIs'), desc: t('services_page.app_development.services.backend.desc', 'Scalable backend systems to power your mobile app.') },
    { icon: Lock, title: t('services_page.app_development.services.security.title', 'App Security'), desc: t('services_page.app_development.services.security.desc', 'Enterprise-grade security for sensitive data.') },
    { icon: Rocket, title: t('services_page.app_development.services.launch.title', 'App Store Launch'), desc: t('services_page.app_development.services.launch.desc', 'Complete submission and launch support.') }
  ];

  const { data: portfolios = [] } = useQuery({
    queryKey: ['app-portfolios'],
    queryFn: async () => {
      const all = await dataLayer.portfolio.getPublished();
      return all.filter(p => p.category === 'app_development').slice(0, 3);
    }
  });

  return (
    <div>
      <SEOHead pageIdentifier="app-development" />
      {/* Hero */}
      <section className="relative py-24 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[150px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {t('services_page.app_development.title', 'App Development')}
              </h1>
              <p className="text-xl text-slate-300 mb-8">
                {t('services_page.app_development.description', 'Transform your ideas into powerful mobile applications that users love. Native and cross-platform solutions for iOS and Android.')}
              </p>
              <Link
                to={createPageUrl('Contact')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-medium hover:shadow-lg transition-all"
              >
                {t('services_page.app_development.cta', 'Start Your App')}
                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block"
            >
              <img
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800"
                alt="App Development"
                className="rounded-3xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label={t('services_page.sections.what_we_offer', 'Our Services')}
            title={t('services_page.app_development.services_title', 'Mobile App Solutions')}
            description={t('services_page.app_development.services_desc', 'End-to-end mobile app development services for startups and enterprises.')}
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-lg transition"
              >
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h3>
                <p className="text-slate-600">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Mobile */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.img
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              src="https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800"
              alt={t('alt.mobile_apps', 'Mobile apps')}
              className="rounded-3xl shadow-xl"
            />
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionHeader
                label={t('services_page.sections.why_choose_us', 'Why Mobile')}
                title={t('services_page.app_development.why_mobile.title', 'Reach Your Customers Anywhere')}
                centered={false}
              />
              <div className="space-y-4">
                {(t('services_page.app_development.why_mobile.list', { returnObjects: true }) || [
                  'Over 6 billion smartphone users worldwide',
                  'Users spend 90% of mobile time in apps',
                  'Higher engagement than mobile websites',
                  'Push notifications for direct communication',
                  'Offline functionality capabilities'
                ]).map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      {portfolios.length > 0 && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label={t('services_page.sections.our_work', 'Our Work')}
              title={t('services_page.app_development.title', 'App Development Projects')}
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
      <section className="py-24 bg-gradient-to-br from-purple-900 to-pink-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('services_page.app_development.cta_title', 'Ready to Build Your App?')}
          </h2>
          <p className="text-xl text-purple-200 mb-8">
            {t('services_page.app_development.cta_desc', "Let's turn your idea into reality.")}
          </p>
          <Link
            to={createPageUrl('Contact')}
            className="inline-flex items-center gap-2 bg-white text-purple-900 px-8 py-4 rounded-full font-medium hover:shadow-lg transition-all"
          >
            {t('services_page.app_development.cta_button', 'Get In Touch')}
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </Link>
        </div>
      </section>
    </div>
  );
}

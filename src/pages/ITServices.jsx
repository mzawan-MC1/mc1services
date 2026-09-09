import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import {
  Server, Shield, Cloud, Headphones, Settings, Users,
  ArrowRight, CheckCircle
} from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';
import PortfolioCard from '../components/ui/PortfolioCard';
import SEOHead from '../components/SEOHead';
import { useTranslation } from 'react-i18next';

export default function ITServices() {
  const { t } = useTranslation();

  const services = [
    { icon: Cloud, title: t('services_page.it_services.services.cloud.title', 'Cloud Services'), desc: t('services_page.it_services.services.cloud.desc', 'AWS, Azure, and Google Cloud solutions and migration.') },
    { icon: Shield, title: t('services_page.it_services.services.security.title', 'Cybersecurity'), desc: t('services_page.it_services.services.security.desc', 'Protect your business with comprehensive security solutions.') },
    { icon: Server, title: t('services_page.it_services.services.infrastructure.title', 'Infrastructure'), desc: t('services_page.it_services.services.infrastructure.desc', 'Network design, implementation, and management.') },
    { icon: Headphones, title: t('services_page.it_services.services.support.title', 'IT Support'), desc: t('services_page.it_services.services.support.desc', 'Flexible technical support and helpdesk services.') },
    { icon: Settings, title: t('services_page.it_services.services.managed.title', 'Managed Services'), desc: t('services_page.it_services.services.managed.desc', 'Complete IT management so you can focus on business.') },
    { icon: Users, title: t('services_page.it_services.services.consulting.title', 'IT Consulting'), desc: t('services_page.it_services.services.consulting.desc', 'Strategic technology planning and guidance.') }
  ];

  const benefits = t('services_page.it_services.benefits', { returnObjects: true }) || [
    'Reduce operational friction and avoidable costs',
    'Monitoring and support matched to your needs',
    'Enterprise-grade security',
    'Scalable infrastructure',
    'Dedicated account management',
    'Industry compliance expertise'
  ];

  const { data: portfolios = [] } = useQuery({
    queryKey: ['it-portfolios'],
    queryFn: async () => {
      const all = await dataLayer.portfolio.getPublished();
      return all.filter(p => p.category === 'it_services').slice(0, 3);
    }
  });

  return (
    <div>
      <SEOHead pageIdentifier="it-services" />
      {/* Hero */}
      <section className="relative py-24 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[150px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Server className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {t('services_page.it_services.hero_title', 'IT & Professional Services')}
              </h1>
              <p className="text-xl text-slate-300 mb-8">
                {t('services_page.it_services.hero_desc', 'Comprehensive IT solutions to streamline your operations, enhance security, and drive business growth.')}
              </p>
              <Link
                to={createPageUrl('Contact?service=it_services')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 rounded-full font-medium hover:shadow-lg transition-all"
              >
                {t('services_page.it_services.cta', 'Get IT Support')}
                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block"
            >
              <img
                src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800"
                alt={t('alt.it_services', 'IT Services')}
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
            title={t('services_page.it_services.services_title', 'Enterprise IT Solutions')}
            description={t('services_page.it_services.services_desc', 'End-to-end IT services tailored to your business needs.')}
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
                <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-cyan-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h3>
                <p className="text-slate-600">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.img
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800"
              alt={t('alt.it_team', 'IT team')}
              className="rounded-3xl shadow-xl"
            />
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionHeader
                label={t('services_page.sections.why_choose_us', 'Why Choose Us')}
                title={t('services_page.it_services.why_choose_title', 'Partner With IT Experts')}
                centered={false}
              />
              <div className="space-y-4">
                {benefits.map((item, i) => (
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
              label={t('services_page.sections.our_work', 'Case Studies')}
              title={t('services_page.it_services.case_studies_title', 'IT Project Success Stories')}
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
      <section className="py-24 bg-gradient-to-br from-cyan-900 to-blue-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('services_page.it_services.cta_title', 'Need IT Support?')}
          </h2>
          <p className="text-xl text-cyan-200 mb-8">
            {t('services_page.it_services.cta_desc', "Let's optimize your IT infrastructure together.")}
          </p>
          <Link
            to={createPageUrl('Contact?service=it_services')}
            className="inline-flex items-center gap-2 bg-white text-cyan-900 px-8 py-4 rounded-full font-medium hover:shadow-lg transition-all"
          >
            {t('services_page.it_services.cta_button', 'Contact Us')}
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </Link>
        </div>
      </section>
    </div>
  );
}

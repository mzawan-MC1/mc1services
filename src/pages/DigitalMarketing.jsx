import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import {
  Users, Target, BarChart, Share2, Search,
  ArrowRight, Mail, Megaphone
} from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';
import PortfolioCard from '../components/ui/PortfolioCard';
import SEOHead from '../components/SEOHead';
import { useTranslation } from 'react-i18next';

export default function DigitalMarketing() {
  const { t } = useTranslation();

  const services = [
    {
      icon: Search,
      title: t('services_page.digital_marketing.services.seo.title', 'SEO Optimization'),
      desc: t('services_page.digital_marketing.services.seo.desc', 'Rank higher on search engines and drive organic traffic.'),
      features: t('services_page.digital_marketing.services.seo.features', { returnObjects: true }) || ['On-Page SEO', 'Technical SEO', 'Keyword Research', 'Link Building']
    },
    {
      icon: Share2,
      title: t('services_page.digital_marketing.services.social.title', 'Social Media'),
      desc: t('services_page.digital_marketing.services.social.desc', 'Engage your audience across all major social platforms.'),
      features: t('services_page.digital_marketing.services.social.features', { returnObjects: true }) || ['Content Strategy', 'Community Management', 'Paid Advertising', 'Influencer Marketing']
    },
    {
      icon: Target,
      title: t('services_page.digital_marketing.services.ppc.title', 'PPC Advertising'),
      desc: t('services_page.digital_marketing.services.ppc.desc', 'Targeted campaigns that deliver immediate results.'),
      features: t('services_page.digital_marketing.services.ppc.features', { returnObjects: true }) || ['Google Ads', 'Facebook Ads', 'LinkedIn Ads', 'Retargeting']
    },
    {
      icon: Mail,
      title: t('services_page.digital_marketing.services.email.title', 'Email Marketing'),
      desc: t('services_page.digital_marketing.services.email.desc', 'Nurture leads and drive conversions with personalized campaigns.'),
      features: t('services_page.digital_marketing.services.email.features', { returnObjects: true }) || ['Campaign Management', 'Automation', 'List Building', 'Analytics']
    },
    {
      icon: Users,
      title: t('services_page.digital_marketing.services.content.title', 'Content Marketing'),
      desc: t('services_page.digital_marketing.services.content.desc', 'Valuable content that attracts and retains customers.'),
      features: t('services_page.digital_marketing.services.content.features', { returnObjects: true }) || ['Blog Writing', 'Video Content', 'Infographics', 'E-books']
    },
    {
      icon: BarChart,
      title: t('services_page.digital_marketing.services.analytics.title', 'Analytics & Reporting'),
      desc: t('services_page.digital_marketing.services.analytics.desc', 'Data-driven insights to optimize your marketing ROI.'),
      features: t('services_page.digital_marketing.services.analytics.features', { returnObjects: true }) || ['Custom Dashboards', 'Performance Tracking', 'Conversion Analysis', 'Competitor Analysis']
    }
  ];

  const { data: portfolios = [] } = useQuery({
    queryKey: ['marketing-portfolios'],
    queryFn: async () => {
      const all = await dataLayer.portfolio.getAll();
      return all.filter(p => p.category === 'marketing' && p.status === 'published')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3);
    }
  });

  return (
    <div>
      <SEOHead pageIdentifier="digital-marketing" />
      {/* Hero */}
      <section className="relative py-24 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-500/20 rounded-full blur-[150px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Megaphone className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {t('services_page.digital_marketing.hero_title', 'Digital Marketing')}
              </h1>
              <p className="text-xl text-slate-300 mb-8">
                {t('services_page.digital_marketing.hero_desc', 'Data-driven marketing strategies that amplify your brand, attract qualified leads, and maximize your ROI.')}
              </p>
              <Link
                to={createPageUrl('Contact?service=digital_marketing')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-full font-medium hover:shadow-lg transition-all"
              >
                {t('services_page.digital_marketing.cta', 'Grow Your Business')}
                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block"
            >
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"
                alt={t('alt.digital_marketing', 'Digital Marketing')}
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
            title={t('services_page.digital_marketing.services_title', 'Complete Marketing Solutions')}
            description={t('services_page.digital_marketing.services_desc', 'Full-funnel marketing strategies tailored to your business goals.')}
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
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h3>
                <p className="text-slate-600">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio */}
      {portfolios.length > 0 && (
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              label={t('services_page.sections.our_work', 'Case Studies')}
              title={t('services_page.digital_marketing.case_studies_title', 'Marketing Success Stories')}
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
      <section className="py-24 bg-gradient-to-br from-green-900 to-emerald-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('services_page.digital_marketing.cta_title', 'Ready to Grow Your Business?')}
          </h2>
          <p className="text-xl text-green-200 mb-8">
            {t('services_page.digital_marketing.cta_desc', "Let's create a marketing strategy that delivers results.")}
          </p>
          <Link
            to={createPageUrl('Contact?service=digital_marketing')}
            className="inline-flex items-center gap-2 bg-white text-green-900 px-8 py-4 rounded-full font-medium hover:shadow-lg transition-all"
          >
            {t('services_page.digital_marketing.cta_button', 'Get Started')}
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </Link>
        </div>
      </section>
    </div>
  );
}

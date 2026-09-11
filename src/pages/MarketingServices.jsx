import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { Users, Target, BarChart, Share2, Search,
  ArrowRight, Check, ChevronDown, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PortfolioCard from '../components/ui/PortfolioCard';
import SEOHead from '../components/SEOHead';
import { useTranslation } from 'react-i18next';
import { getLocalizedValue } from '../utils';
import { getLocalizedFaqQuestion } from '../utils/faqMapping';

export default function MarketingServices() {
  const { t, i18n } = useTranslation();
  const [openFaq, setOpenFaq] = useState(null);

  const services = [
    {
      icon: Search,
      title: t('services_page.marketing_services.services.seo.title', 'SEO Optimization'),
      description: t('services_page.marketing_services.services.seo.desc', 'Rank higher on search engines and drive organic traffic.'),
      features: t('services_page.marketing_services.services.seo.features', { returnObjects: true }) || ['On-Page SEO', 'Technical SEO', 'Keyword Research', 'Link Building']
    },
    {
      icon: Share2,
      title: t('services_page.marketing_services.services.social.title', 'Social Media'),
      description: t('services_page.marketing_services.services.social.desc', 'Engage your audience across all major social platforms.'),
      features: t('services_page.marketing_services.services.social.features', { returnObjects: true }) || ['Content Strategy', 'Community Management', 'Paid Advertising', 'Influencer Marketing']
    },
    {
      icon: Target,
      title: t('services_page.marketing_services.services.ppc.title', 'PPC Advertising'),
      description: t('services_page.marketing_services.services.ppc.desc', 'Targeted campaigns that deliver immediate results.'),
      features: t('services_page.marketing_services.services.ppc.features', { returnObjects: true }) || ['Google Ads', 'Facebook Ads', 'LinkedIn Ads', 'Retargeting']
    },
    {
      icon: Mail,
      title: t('services_page.marketing_services.services.email.title', 'Email Marketing'),
      description: t('services_page.marketing_services.services.email.desc', 'Nurture leads and drive conversions with personalized campaigns.'),
      features: t('services_page.marketing_services.services.email.features', { returnObjects: true }) || ['Campaign Management', 'Automation', 'List Building', 'Analytics']
    },
    {
      icon: Users,
      title: t('services_page.marketing_services.services.content.title', 'Content Marketing'),
      description: t('services_page.marketing_services.services.content.desc', 'Valuable content that attracts and retains customers.'),
      features: t('services_page.marketing_services.services.content.features', { returnObjects: true }) || ['Blog Writing', 'Video Content', 'Infographics', 'E-books']
    },
    {
      icon: BarChart,
      title: t('services_page.marketing_services.services.analytics.title', 'Analytics & Reporting'),
      description: t('services_page.marketing_services.services.analytics.desc', 'Data-driven insights to optimize your marketing ROI.'),
      features: t('services_page.marketing_services.services.analytics.features', { returnObjects: true }) || ['Custom Dashboards', 'Performance Tracking', 'Conversion Analysis', 'Competitor Analysis']
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

  const { data: plans = [] } = useQuery({
    queryKey: ['marketing-plans'],
    queryFn: async () => {
      const all = await dataLayer.pricingPlans.getAll();
      return all.filter(p => p.category === 'marketing');
    }
  });

  const { data: faqs = [] } = useQuery({
    queryKey: ['marketing-faqs'],
    queryFn: async () => {
      const all = await dataLayer.faqs.getAll();
      return all.filter(f => f.category === 'marketing');
    }
  });

  const defaultFaqs = [
    { question: 'How long before I see results?', answer: 'Timing depends on the channel, starting position, budget, competition and offer. We define measurable goals and a suitable reporting schedule before launch.' },
    { question: 'What platforms do you manage?', answer: 'We manage Meta (Facebook/Instagram), Google, TikTok, Snapchat, LinkedIn, Twitter, and more.' },
    { question: 'Do you handle content creation?', answer: 'Yes, we offer full content creation including copywriting, graphics, photography, and video production.' },
    { question: 'How do you measure success?', answer: 'We track KPIs like traffic, conversions, ROAS, engagement rates, and provide detailed analytics reports.' }
  ];

  const displayFaqs = faqs.length > 0 ? faqs : defaultFaqs;
  const getLoc = (obj, key) => getLocalizedValue(obj, key, i18n.language);

  return (
    <div>
      <SEOHead pageIdentifier="marketing-services" />
      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="bg-white/10 text-purple-300 border-0 mb-6 text-sm py-1.5 px-4">
              {t('services_page.marketing_services.hero_badge', 'Marketing Services')}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {t('services_page.marketing_services.hero_title', 'Grow Your Brand')}
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t('services_page.marketing_services.hero_title_highlight', 'With Data-Driven Marketing')}
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              {t('services_page.marketing_services.hero_desc', 'Strategic marketing campaigns that amplify your brand, engage your audience, and drive measurable growth.')}
            </p>
            <Link to={createPageUrl('Contact?service=digital_marketing')}>
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-full">
                {t('services_page.marketing_services.cta_button', 'Discuss Your Marketing Goals')}
                <ArrowRight className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t('services_page.marketing_services.services_title', 'Our Marketing Services')}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('services_page.marketing_services.services_desc', 'Full-spectrum marketing solutions to grow your business')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-xl hover:border-purple-100 transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{service.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{service.description}</p>
                <ul className="space-y-1">
                  {service.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-500">
                      <Check className="w-3 h-3 text-purple-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      {plans.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('services_page.marketing_services.pricing_title', 'Marketing Packages')}</h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-2xl p-8 ${plan.is_popular ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white' : 'bg-white border border-slate-200'}`}
                >
                  {plan.is_popular && <Badge className="bg-white/20 text-white border-0 mb-4">{t('common.most_popular')}</Badge>}
                  <h3 className={`text-2xl font-bold mb-2 ${plan.is_popular ? 'text-white' : 'text-slate-900'}`}>{getLoc(plan, 'name') || plan.name}</h3>
                  <div className="mb-4">
                    <span className={`text-4xl font-bold ${plan.is_popular ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                    <span className={plan.is_popular ? 'text-purple-100' : 'text-slate-500'}>{getLoc(plan, 'billing_period') || plan.billing_period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {(plan.features_ar && i18n.language === 'ar' ? plan.features_ar : plan.features)?.map((f, j) => (
                      <li key={j} className="flex items-center gap-2">
                        <Check className={`w-4 h-4 ${plan.is_popular ? 'text-purple-200' : 'text-purple-500'}`} />
                        <span className={plan.is_popular ? 'text-purple-100' : 'text-slate-600'}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={createPageUrl('Contact?service=digital_marketing')}>
                    <Button className={`w-full ${plan.is_popular ? 'bg-white text-purple-600 hover:bg-purple-50' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
                      {plan.cta_text || t('common.get_started', 'Get Started')}
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Portfolio */}
      {portfolios.length > 0 && (
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('services_page.marketing_services.portfolio_title', 'Marketing Case Studies')}</h2>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-8">
              {portfolios.map((p, i) => (
                <PortfolioCard key={p.id} portfolio={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('services_page.marketing_services.faq_title', 'Frequently Asked Questions')}</h2>
          </motion.div>

          <div className="space-y-4">
            {displayFaqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="border border-slate-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-slate-900">{getLocalizedFaqQuestion(faq, i18n.language, t)}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-slate-600">{getLoc(faq, 'answer') || faq.answer}</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t('services_page.marketing_services.cta_title', 'Ready to Grow Your Business?')}</h2>
          <p className="text-xl text-purple-100 mb-8">{t('services_page.marketing_services.cta_desc', "Let's create a marketing strategy that drives results.")}</p>
          <Link to={createPageUrl('Contact?service=digital_marketing')}>
            <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-6 text-lg rounded-full">
              {t('services_page.marketing_services.cta_final_button', 'Discuss Your Marketing')}
              <ArrowRight className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import {
  Globe, Smartphone, Code, Monitor, Plug, Palette, Cloud, Database,
  ArrowRight, Check, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PortfolioCard from '../components/ui/PortfolioCard';
import { useTranslation } from 'react-i18next';
import { getLocalizedValue } from '../utils';
import SEOHead from '../components/SEOHead';

export default function DevelopmentServices() {
  const { t, i18n } = useTranslation();
  const [openFaq, setOpenFaq] = useState(null);

  const services = [
    {
      icon: Globe,
      key: 'website_development',
      features: t('services_page.development_services.services_list.website_development.features', { returnObjects: true }) || ['Responsive Design', 'CMS Integration', 'E-commerce', 'Performance Optimization']
    },
    {
      icon: Smartphone,
      key: 'mobile_app_development',
      features: t('services_page.development_services.services_list.mobile_app_development.features', { returnObjects: true }) || ['iOS Development', 'Android Development', 'React Native', 'Flutter']
    },
    {
      icon: Code,
      key: 'custom_software',
      features: t('services_page.development_services.services_list.custom_software.features', { returnObjects: true }) || ['Enterprise Solutions', 'SaaS Products', 'Process Automation', 'Legacy Modernization']
    },
    {
      icon: Monitor,
      key: 'computer_applications',
      features: t('services_page.development_services.services_list.computer_applications.features', { returnObjects: true }) || ['Cross-Platform', 'Electron Apps', 'Native Desktop', 'Productivity Tools']
    },
    {
      icon: Plug,
      key: 'api_integrations',
      features: t('services_page.development_services.services_list.api_integrations.features', { returnObjects: true }) || ['RESTful APIs', 'GraphQL', 'Payment Gateways', 'CRM Integration']
    },
    {
      icon: Palette,
      key: 'ui_ux_design',
      features: t('services_page.development_services.services_list.ui_ux_design.features', { returnObjects: true }) || ['User Research', 'Wireframing', 'Prototyping', 'Design Systems']
    },
    {
      icon: Cloud,
      key: 'devops_cloud',
      features: t('services_page.development_services.services_list.devops_cloud.features', { returnObjects: true }) || ['AWS/Azure/GCP', 'CI/CD Pipelines', 'Docker/Kubernetes', 'Monitoring']
    },
    {
      icon: Database,
      key: 'backend_frontend',
      features: t('services_page.development_services.services_list.backend_frontend.features', { returnObjects: true }) || ['React/Vue/Angular', 'Node.js/Python', 'PostgreSQL/MongoDB', 'Microservices']
    }
  ];

  const processSteps = [
    { key: 'discovery' },
    { key: 'planning' },
    { key: 'design' },
    { key: 'development' },
    { key: 'testing' },
    { key: 'deployment' }
  ];

  const { data: portfolios = [] } = useQuery({
    queryKey: ['dev-portfolios'],
    queryFn: async () => {
        const all = await dataLayer.portfolio.getAll();
        return all.filter(p => p.category === 'development' && p.status === 'published')
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 3);
    }
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['dev-plans'],
    queryFn: async () => {
        const all = await dataLayer.pricingPlans.getAll();
        return all.filter(p => p.category === 'development');
    }
  });

  const { data: faqs = [] } = useQuery({
    queryKey: ['dev-faqs'],
    queryFn: async () => {
        const all = await dataLayer.faqs.getAll();
        return all.filter(f => f.category === 'development').sort((a,b) => (a.display_order||0)-(b.display_order||0));
    }
  });

  const defaultFaqs = [
    { question: t('services_page.development_services.faqs.timeline.q', 'How long does a typical project take?'), answer: t('services_page.development_services.faqs.timeline.a', 'The schedule depends on scope, integrations, content readiness and review requirements. We agree a realistic delivery plan after discovery.') },
    { question: t('services_page.development_services.faqs.tech.q', 'What technologies do you use?'), answer: t('services_page.development_services.faqs.tech.a', 'We use modern tech stacks including React, Node.js, Python, AWS, and more based on project requirements.') },
    { question: t('services_page.development_services.faqs.support.q', 'Do you provide ongoing support?'), answer: t('services_page.development_services.faqs.support.a', 'Yes, we offer maintenance packages and ongoing support for all projects we deliver.') },
    { question: t('services_page.development_services.faqs.communication.q', 'How do you handle project communication?'), answer: t('services_page.development_services.faqs.communication.a', 'We agree communication channels, review points and progress updates that suit the project and your team.') }
  ];

  const displayFaqs = faqs.length > 0 ? faqs : defaultFaqs;
  const getLoc = (obj, key) => getLocalizedValue(obj, key, i18n.language);

  return (
    <div>
      <SEOHead pageIdentifier="development-services" />
      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="bg-white/10 text-blue-300 border-0 mb-6 text-sm py-1.5 px-4">
              {t('services_page.development_services.hero_badge', 'Development Services')}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {t('services_page.development_services.hero_title', 'Build Your Digital')}
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {t('services_page.development_services.hero_title_highlight', 'Future With Us')}
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              {t('services_page.development_services.hero_desc', 'From websites to enterprise software, we deliver cutting-edge solutions that drive business growth.')}
            </p>
            <Link to={createPageUrl('Contact?service=custom_software')}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-6 text-lg rounded-full">
                {t('services_page.development_services.start_project', 'Start Your Project')}
                <ArrowRight className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180" />
              </Button>
            </Link>
            <div className="mt-16">
              <img
                src="https://images.unsplash.com/photo-1547658719-da2b51169166?w=800"
                alt={t('alt.web_development', 'Web Development')}
                className="rounded-3xl shadow-2xl mx-auto"
              />
            </div>
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
              {t('services_page.development_services.services_title', 'Our Development Services')}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('services_page.development_services.services_desc', 'Comprehensive solutions for all your software development needs')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{t(`services_page.development_services.services_list.${service.key}.title`)}</h3>
                <p className="text-slate-600 text-sm mb-4">{t(`services_page.development_services.services_list.${service.key}.desc`)}</p>
                <ul className="space-y-1">
                  {service.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-500">
                      <Check className="w-3 h-3 text-blue-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t('services_page.development_services.process_title', 'Our Development Process')}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-6 gap-4">
            {processSteps.map((step, i) => (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold">
                  {i + 1}
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{t(`services_page.development_services.process_steps.${step.key}.title`)}</h3>
                <p className="text-sm text-slate-600">{t(`services_page.development_services.process_steps.${step.key}.desc`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                {t('services_page.development_services.pricing_title', 'Pricing Plans')}
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-2xl p-8 ${plan.is_popular ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white' : 'bg-white border border-slate-200'}`}
                >
                  {plan.is_popular && <Badge className="bg-white/20 text-white border-0 mb-4">Most Popular</Badge>}
                  <h3 className={`text-2xl font-bold mb-2 ${plan.is_popular ? 'text-white' : 'text-slate-900'}`}>{getLoc(plan, 'title') || plan.name}</h3>
                  <div className="mb-4">
                    <span className={`text-4xl font-bold ${plan.is_popular ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                    <span className={plan.is_popular ? 'text-blue-100' : 'text-slate-500'}>{getLoc(plan, 'period') || plan.billing_period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {(plan.features_ar && i18n.language === 'ar' ? plan.features_ar : plan.features)?.map((f, j) => (
                      <li key={j} className="flex items-center gap-2">
                        <Check className={`w-4 h-4 ${plan.is_popular ? 'text-blue-200' : 'text-blue-500'}`} />
                        <span className={plan.is_popular ? 'text-blue-100' : 'text-slate-600'}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={createPageUrl('Contact?service=custom_software')}>
                    <Button className={`w-full ${plan.is_popular ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                      {plan.cta_text || t('common.get_started', 'Get Started')}
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          {plans.length === 0 && (
            <p className="text-center text-slate-500">{t('services_page.development_services.pricing_contact', 'Contact us for custom pricing tailored to your project.')}</p>
          )}
        </div>
      </section>

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
              <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('services_page.development_services.recent_projects', 'Recent Development Projects')}</h2>
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
      <section className={`py-24 bg-white ${i18n.language === 'ar' ? 'text-right' : ''}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('services_page.development_services.faq_title', 'Frequently Asked Questions')}</h2>
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
                  <span className="font-medium text-slate-900">{getLoc(faq, 'question') || faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-slate-600">
                    {getLoc(faq, 'answer') || faq.answer}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t('services_page.development_services.cta_title', 'Ready to Build Something Amazing?')}</h2>
          <p className="text-xl text-blue-100 mb-8">{t('services_page.development_services.cta_desc', "Let's discuss your project and create a custom solution.")}</p>
          <Link to={createPageUrl('Contact?service=custom_software')}>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg rounded-full">
              {t('services_page.development_services.get_quote', 'Request a Project Estimate')}
              <ArrowRight className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

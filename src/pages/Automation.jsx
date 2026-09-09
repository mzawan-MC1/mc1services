import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import {
  Zap, Bot, Mail, Users, BarChart3, Workflow, Clock, Target,
  ArrowRight, Check, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SEOHead from '../components/SEOHead';
import { useTranslation } from 'react-i18next';

export default function Automation() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState(null);

  const services = [
    {
      icon: Workflow,
      title: t('services_page.automation.services.process.title', 'Business Process Automation'),
      description: t('services_page.automation.services.process.desc', 'Automate repetitive tasks and streamline your operations.'),
      features: t('services_page.automation.services.process.features', { returnObjects: true }) || ['Workflow Automation', 'Document Processing', 'Data Entry Automation', 'Approval Workflows']
    },
    {
      icon: Mail,
      title: t('services_page.automation.services.email.title', 'Email Marketing Automation'),
      description: t('services_page.automation.services.email.desc', 'Automated email campaigns that nurture leads and drive conversions.'),
      features: t('services_page.automation.services.email.features', { returnObjects: true }) || ['Drip Campaigns', 'Behavioral Triggers', 'A/B Testing', 'Personalization']
    },
    {
      icon: Users,
      title: t('services_page.automation.services.crm.title', 'CRM Automation'),
      description: t('services_page.automation.services.crm.desc', 'Automate your customer relationship management for better engagement.'),
      features: t('services_page.automation.services.crm.features', { returnObjects: true }) || ['Lead Scoring', 'Contact Management', 'Sales Pipeline', 'Follow-up Automation']
    },
    {
      icon: BarChart3,
      title: t('services_page.automation.services.analytics.title', 'Marketing Analytics'),
      description: t('services_page.automation.services.analytics.desc', 'Automated reporting and insights for data-driven decisions.'),
      features: t('services_page.automation.services.analytics.features', { returnObjects: true }) || ['Automated Reports', 'Dashboard Creation', 'ROI Tracking', 'Performance Alerts']
    },
    {
      icon: Bot,
      title: t('services_page.automation.services.ai.title', 'AI & Chatbots'),
      description: t('services_page.automation.services.ai.desc', 'Intelligent automation powered by artificial intelligence.'),
      features: t('services_page.automation.services.ai.features', { returnObjects: true }) || ['Customer Support Bots', 'Lead Qualification', 'FAQ Automation', 'Consistent Availability']
    },
    {
      icon: Target,
      title: t('services_page.automation.services.social.title', 'Social Media Automation'),
      description: t('services_page.automation.services.social.desc', 'Schedule and automate your social media presence.'),
      features: t('services_page.automation.services.social.features', { returnObjects: true }) || ['Post Scheduling', 'Content Calendar', 'Auto-responses', 'Analytics Integration']
    },
    {
      icon: Clock,
      title: t('services_page.automation.services.task.title', 'Task & Project Automation'),
      description: t('services_page.automation.services.task.desc', 'Automate project workflows and team collaboration.'),
      features: t('services_page.automation.services.task.features', { returnObjects: true }) || ['Task Assignment', 'Deadline Reminders', 'Status Updates', 'Team Notifications']
    },
    {
      icon: Zap,
      title: t('services_page.automation.services.integration.title', 'Integration Automation'),
      description: t('services_page.automation.services.integration.desc', 'Connect your tools and automate data flow between systems.'),
      features: t('services_page.automation.services.integration.features', { returnObjects: true }) || ['Zapier/Make', 'API Integrations', 'Data Sync', 'Multi-platform']
    }
  ];

  const faqs = [
    { question: t('services_page.automation.faqs.what.q', 'What can be automated in my business?'), answer: t('services_page.automation.faqs.what.a', 'Almost any repetitive task can be automated...') },
    { question: t('services_page.automation.faqs.time.q', 'How long does it take to implement automation?'), answer: t('services_page.automation.faqs.time.a', 'Simple automations can be set up in days...') },
    { question: t('services_page.automation.faqs.employees.q', 'Will automation replace my employees?'), answer: t('services_page.automation.faqs.employees.a', 'No, automation is designed to augment your team...') },
    { question: t('services_page.automation.faqs.tools.q', 'What tools do you use for automation?'), answer: t('services_page.automation.faqs.tools.a', 'We work with leading platforms like HubSpot, Salesforce...') }
  ];

  return (
    <div>
      <SEOHead pageIdentifier="automation" />
      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-br from-slate-900 via-amber-900/20 to-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/20 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="bg-white/10 text-amber-300 border-0 mb-6 text-sm py-1.5 px-4">
              {t('services_page.automation.hero_badge', 'Automation Services')}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {t('services_page.automation.hero_title', 'Automate Your Business &')}
              <span className="block bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                {t('services_page.automation.hero_title_highlight', 'Marketing Operations')}
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              {t('services_page.automation.hero_desc', 'Save time, reduce costs, and scale your operations with intelligent automation solutions.')}
            </p>
            <Link to={createPageUrl('Contact?service=automation')}>
              <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-6 text-lg rounded-full">
                {t('services_page.automation.cta', 'Get Started')}
                <ArrowRight className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t('services_page.automation.services_title', 'Automation Solutions')}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('services_page.automation.services_desc', 'Comprehensive automation services for business and marketing')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-xl hover:border-amber-100 transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{service.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{service.description}</p>
                <ul className="space-y-1">
                  {service.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-500">
                      <Check className="w-3 h-3 text-amber-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t('services_page.automation.how_it_works.title', 'How We Implement Automation')}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', key: 'audit' },
              { step: '02', key: 'strategy' },
              { step: '03', key: 'implement' },
              { step: '04', key: 'optimize' }
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {t(`services_page.automation.how_it_works.steps.${item.key}.title`)}
                </h3>
                <p className="text-slate-600">
                  {t(`services_page.automation.how_it_works.steps.${item.key}.desc`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              {t('services_page.automation.faq_title', 'Frequently Asked Questions')}
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-slate-900">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-slate-600">
                    {faq.answer}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-amber-500 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('services_page.automation.cta_title', 'Ready to Automate Your Business?')}
          </h2>
          <p className="text-xl text-amber-100 mb-8">
            {t('services_page.automation.cta_desc', 'Tell us about your current workflow and the bottlenecks you want to remove.')}
          </p>
          <Link to={createPageUrl('Contact?service=automation')}>
            <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-6 text-lg rounded-full">
              {t('services_page.automation.cta_button', 'Discuss Automation')}
              <ArrowRight className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

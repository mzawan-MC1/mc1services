import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { 
  Video, Camera, Mic, Music, Film, Play, 
  ArrowRight, CheckCircle 
} from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';
import PortfolioCard from '../components/ui/PortfolioCard';
import SEOHead from '../components/SEOHead';
import { useTranslation } from 'react-i18next';

export default function Production() {
  const { t } = useTranslation();

  const services = [
    {
      icon: Video,
      title: t('services_page.production.services.video.title', 'Video Production'),
      description: t('services_page.production.services.video.desc', 'High-quality corporate videos, commercials, and social content.'),
      features: t('services_page.production.services.video.features', { returnObjects: true }) || ['Commercials', 'Corporate Videos', 'Event Coverage', 'Drone Footage']
    },
    {
      icon: Camera,
      title: t('services_page.production.services.photography.title', 'Professional Photography'),
      description: t('services_page.production.services.photography.desc', 'Stunning photography for products, events, and corporate needs.'),
      features: t('services_page.production.services.photography.features', { returnObjects: true }) || ['Product Photography', 'Corporate Headshots', 'Event Photography', 'Architecture']
    },
    {
      icon: Mic,
      title: t('services_page.production.services.audio.title', 'Audio Production'),
      description: t('services_page.production.services.audio.desc', 'Crystal clear audio for podcasts, voiceovers, and sound design.'),
      features: t('services_page.production.services.audio.features', { returnObjects: true }) || ['Podcast Production', 'Voiceovers', 'Sound Design', 'Mixing & Mastering']
    },
    {
      icon: Film,
      title: t('services_page.production.services.animation.title', 'Animation & Motion'),
      description: t('services_page.production.services.animation.desc', 'Engaging 2D/3D animation and motion graphics.'),
      features: t('services_page.production.services.animation.features', { returnObjects: true }) || ['2D Animation', '3D Modeling', 'Motion Graphics', 'Explainer Videos']
    }
  ];

  const { data: portfolios = [] } = useQuery({
    queryKey: ['prod-portfolios'],
    queryFn: async () => {
      const all = await dataLayer.portfolio.getAll();
      return all.filter(p => p.category === 'production' && p.status === 'published')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3);
    }
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['prod-plans'],
    queryFn: async () => {
      const all = await dataLayer.pricingPlans.getAll();
      return all.filter(p => p.category === 'production');
    }
  });

  return (
    <div>
      <SEOHead pageIdentifier="production" />
      {/* Hero */}
      <section className="relative py-24 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-[150px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {t('services_page.production.hero_title', 'Production Services')}
              </h1>
              <p className="text-xl text-slate-300 mb-8">
                {t('services_page.production.hero_desc', 'Bring your stories to life with professional video, photography, and audio production services.')}
              </p>
              <Link
                to={createPageUrl('Contact')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-full font-medium hover:shadow-lg transition-all"
              >
                {t('services_page.production.cta', 'Start Your Project')}
                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block relative"
            >
              <img
                src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800"
                alt={t('alt.video_production', 'Video Production')}
                className="rounded-3xl shadow-2xl"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition">
                  <Play className="w-8 h-8 text-orange-600 ml-1 rtl:mr-1 rtl:ml-0" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label={t('services_page.sections.what_we_offer', 'Our Services')}
            title={t('services_page.production.services_title', 'Creative Production')}
            description={t('services_page.production.services_desc', 'Full-service production capabilities for all your creative needs.')}
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
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h3>
                <p className="text-slate-600">{service.description}</p>
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
              label={t('services_page.sections.our_work', 'Our Work')}
              title={t('services_page.production.portfolio_title', 'Production Portfolio')}
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
      <section className="py-24 bg-gradient-to-br from-orange-900 to-red-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('services_page.production.cta_title', 'Ready to Tell Your Story?')}
          </h2>
          <p className="text-xl text-orange-200 mb-8">
            {t('services_page.production.cta_desc', "Let's create compelling content together.")}
          </p>
          <Link
            to={createPageUrl('Contact')}
            className="inline-flex items-center gap-2 bg-white text-orange-900 px-8 py-4 rounded-full font-medium hover:shadow-lg transition-all"
          >
            {t('services_page.production.cta_button', 'Get In Touch')}
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </Link>
        </div>
      </section>
    </div>
  );
}
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { ArrowRight } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { useTranslation } from 'react-i18next';

import HeroSection from '../components/home/HeroSection';
import ProcessSection from '../components/home/ProcessSection';
import ServicesHighlight from '../components/home/ServicesHighlight';
import StatsSection from '../components/home/StatsSection';
import ClientLogosSection from '../components/home/ClientLogosSection';
import VideoSection from '../components/home/VideoSection';
import TestimonialsSlider from '../components/home/TestimonialsSlider';
import PortfolioCard from '../components/ui/PortfolioCard';

export default function Home() {
  const { t } = useTranslation();
  const { data: portfolios = [] } = useQuery({
    queryKey: ['featured-portfolios'],
    queryFn: async () => {
      const featured = await dataLayer.portfolio.getFeatured();
      return featured.slice(0, 6);
    }
  });

  return (
    <div>
      <SEOHead pageIdentifier="home" />
      <HeroSection />
      <ClientLogosSection />
      <VideoSection />
      <ProcessSection />
      <ServicesHighlight />
      <StatsSection />

      {/* Featured Projects */}
      {portfolios.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-1.5 bg-purple-50 text-purple-600 rounded-full text-sm font-medium mb-4">
                {t('home.our_work', 'Our Work')}
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                {t('home.featured_projects', 'Featured Projects')}
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                {t('home.explore_latest_work', 'Explore our latest work and see how we\'ve helped businesses achieve their goals')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolios.map((portfolio, i) => (
                <PortfolioCard key={portfolio.id} portfolio={portfolio} index={i} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to={createPageUrl('Portfolio')}
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-medium hover:bg-slate-800 transition"
              >
                {t('home.view_all_projects', 'View All Projects')}
                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <TestimonialsSlider />

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              {t('home.ready_to_transform', 'Ready to Transform Your Business?')}
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              {t('home.lets_discuss', 'Let\'s discuss how we can help you achieve your digital goals with our comprehensive solutions.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={createPageUrl('Contact')}
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-full font-medium hover:shadow-xl transition-all"
              >
                {t('home.book_consultation', 'Book a Consultation')}
              </Link>
              <Link
                to={createPageUrl('DevelopmentServices')}
                className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-full font-medium hover:bg-white/10 transition"
              >
                {t('home.explore_services', 'Explore Services')}
                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { createPageUrl, getLocalizedValue } from '../../utils';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../dataLayer';
import { ArrowRight, Calendar, Rocket, Code, Megaphone, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export default function HeroSection() {
  const { t, i18n } = useTranslation();
  const { data: heroContent } = useQuery({
    queryKey: ['hero-content'],
    queryFn: async () => {
      const sections = await dataLayer.homeContent.getBySection('hero');
      return sections[0] || {};
    }
  });

  const getLoc = (key) => getLocalizedValue(heroContent, key, i18n.language, false);

  const title = getLoc('title') || t('home.hero_title_default', 'Practical Digital Solutions Built Around Your Business');
  const description = getLoc('description') || t('home.hero_desc_default', 'Websites, custom software, mobile apps, automation, digital marketing, and IT support delivered by one accountable team.');
  const buttonText = getLoc('button_text') || t('home.book_consultation', 'Book Consultation');
  const buttonLink = heroContent?.button_link || 'Contact';
  const buttonTextSecondary = getLoc('button_text_secondary') || t('home.view_work', 'Explore Our Services');
  const buttonLinkSecondary = heroContent?.button_link_secondary || 'DevelopmentServices';
  const showSecondaryButton = heroContent?.show_secondary_button !== false;
  const sectionHeight = heroContent?.section_height || 'min-h-screen';

  // Handle localized subtitle/service pills
  const subtitle = getLoc('subtitle');
  const servicePills = subtitle
    ? subtitle.split(',')
    : [
        t('home.pills.software', 'Software Development'),
        t('home.pills.marketing', 'Digital Marketing'),
        t('home.pills.it', 'IT Solutions'),
        t('home.pills.mobile', 'Mobile Apps'),
        t('home.pills.cloud', 'Cloud Services')
      ];

  return (
    <section className={`relative ${sectionHeight} flex items-center overflow-hidden bg-slate-900`}>
      {/* Animated Background */}
      <div className="absolute inset-0">
        {heroContent?.background_video ? (
          <video src={heroContent.background_video} poster={heroContent.background_image || undefined} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover opacity-35" />
        ) : heroContent?.background_image ? (
          <img src={heroContent.background_image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-pink-600/20" />
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-blue-500/30 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/30 rounded-full blur-[150px] translate-x-1/4 translate-y-1/4 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Floating Icons */}
      <motion.div
        className="absolute top-1/4 left-[10%] hidden lg:block"
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-xl">
          <Code className="w-8 h-8 text-white" />
        </div>
      </motion.div>

      <motion.div
        className="absolute top-1/3 right-[15%] hidden lg:block"
        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      >
        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
          <Megaphone className="w-7 h-7 text-white" />
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-1/3 left-[20%] hidden lg:block"
        animate={{ y: [0, -15, 0], rotate: [0, -3, 0] }}
        transition={{ duration: 7, repeat: Infinity, delay: 2 }}
      >
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-400 rounded-xl flex items-center justify-center shadow-xl">
          <Smartphone className="w-6 h-6 text-white" />
        </div>
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-blue-300 text-sm font-medium mb-8 border border-white/10">
              <Rocket className="w-4 h-4" />
              {t('home.future_ready', 'Technology, Marketing & Automation Partner')}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight"
            dangerouslySetInnerHTML={{ __html: title }}
          />

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            {description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to={createPageUrl(buttonLink)}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-blue-500/25 transition-all">
                <Calendar className="w-5 h-5 mr-2" />
                {buttonText}
              </Button>
            </Link>
            {showSecondaryButton && buttonTextSecondary && (
              <Link to={createPageUrl(buttonLinkSecondary)}>
                <Button size="lg" variant="outline" className="border-2 border-white/80 bg-white/10 text-white hover:bg-white/20 hover:border-white px-8 py-6 text-lg rounded-full backdrop-blur-sm shadow-lg transition-all">
                  {buttonTextSecondary}
                  <ArrowRight className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180" />
                </Button>
              </Link>
            )}
          </motion.div>

          {/* Service Pills */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 mt-16"
          >
            {servicePills.map((service) => (
              <span
                key={service}
                className="px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full text-sm text-slate-300 border border-white/10"
              >
                {service.trim()}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

    </section>
  );
}

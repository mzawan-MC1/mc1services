import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl, getLocalizedValue } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import {
  ArrowLeft, ExternalLink, Calendar, Building2, Loader2,
  ChevronLeft, ChevronRight, X, ZoomIn, Play, Target, Lightbulb, Trophy, Quote,
  CheckCircle2, Layers3, Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

export default function PortfolioDetail() {
  const { t, i18n } = useTranslation();
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const getLoc = (obj, key) => getLocalizedValue(obj, key, i18n.language);

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['portfolio', id],
    queryFn: () => dataLayer.portfolio.getById(id)
  });

  const { data: gallery = [] } = useQuery({
    queryKey: ['portfolio-images', id],
    queryFn: () => dataLayer.portfolio.getImages(id),
    enabled: !!id
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['portfolio-testimonial', portfolio?.client_name],
    queryFn: () => dataLayer.testimonials.filter({ company: portfolio?.client_name }),
    enabled: !!portfolio?.client_name
  });

  const testimonial = testimonials[0];

  const { data: industries = [] } = useQuery({ queryKey: ['active-industries'], queryFn: () => dataLayer.industries.getActive() });
  const { data: services = [] } = useQuery({ queryKey: ['active-services'], queryFn: () => dataLayer.services.getActive() });
  const { data: industryLinks = [] } = useQuery({ queryKey: ['portfolio-industry-links'], queryFn: () => dataLayer.portfolioTaxonomy.getIndustryLinks() });
  const { data: serviceLinks = [] } = useQuery({ queryKey: ['portfolio-service-links'], queryFn: () => dataLayer.portfolioTaxonomy.getServiceLinks() });
  const relatedIndustryIds = new Set(industryLinks.filter((link) => link.portfolio_id === id).map((link) => link.industry_id));
  const relatedServiceIds = new Set(serviceLinks.filter((link) => link.portfolio_id === id).map((link) => link.service_id));
  const relatedIndustries = industries.filter((industry) => relatedIndustryIds.has(industry.id));
  const relatedServices = services.filter((service) => relatedServiceIds.has(service.id));

  // Combine main image, gallery images, and videos for the slider
  const allMedia = useMemo(() => portfolio ? [
    ...(portfolio.main_image_url ? [{ type: 'image', url: portfolio.main_image_url }] : []),
    ...gallery.map((media) => ({
      type: media.media_type || (/\.(mp4|webm|ogg)(\?|$)/i.test(media.image_url) ? 'video' : 'image'),
      url: media.image_url,
      poster: media.poster_url,
      alt: (i18n.language === 'ar' ? media.alt_text_ar || media.alt_text : media.alt_text) || (i18n.language === 'ar' ? portfolio.title_ar || portfolio.title : portfolio.title)
    }))
  ] : [], [portfolio, gallery, i18n.language]);

  const getEmbedUrl = (url) => {
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  const isEmbedVideo = (url) => {
    return url.includes('youtube') || url.includes('youtu.be') || url.includes('vimeo');
  };

  useEffect(() => {
    if (allMedia.length <= 1) return;
    if (allMedia[currentSlide]?.type === 'video') return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % allMedia.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [allMedia, currentSlide]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % allMedia.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  const openLightbox = (index) => { setLightboxIndex(index); setLightboxOpen(true); };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('portfolio.detail.project_not_found', 'Project Not Found')}</h2>
          <Link to={createPageUrl('Portfolio')} className="text-blue-600 hover:underline">{t('portfolio.detail.back_to_portfolio', 'Back to Portfolio')}</Link>
        </div>
      </div>
    );
  }

  const headline = getLoc(portfolio, 'headline') || getLoc(portfolio, 'short_description');
  const projectTypeLabel = portfolio.project_type === 'mc1_product'
    ? t('portfolio.mc1_product', 'MC1 Product')
    : t('portfolio.client_project', 'Client Project');
  const galleryOffset = portfolio.main_image_url ? 1 : 0;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 py-24 md:py-32">
        <div className="absolute inset-0">
          {portfolio.main_image_url && <img src={portfolio.main_image_url} alt="" className="h-full w-full scale-105 object-cover opacity-30 blur-[1px]" />}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/55" />
          <div className="absolute -right-20 top-12 h-72 w-72 rounded-full bg-blue-500/20 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl('Portfolio')} className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition">
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t('portfolio.detail.back_to_portfolio', 'Back to Portfolio')}
          </Link>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
            <div className="mb-5 flex flex-wrap gap-2">
              <Badge className="border border-white/10 bg-white/10 text-blue-200 hover:bg-white/10">{t(`portfolio.categories.${portfolio.category}`, portfolio.category)}</Badge>
              <Badge className="border border-white/10 bg-white/10 text-slate-100 hover:bg-white/10">{projectTypeLabel}</Badge>
              {portfolio.is_featured && <Badge className="border border-purple-300/20 bg-purple-500/20 text-purple-100 hover:bg-purple-500/20"><Sparkles className="mr-1 h-3 w-3" />{t('portfolio.featured_case_study', 'Featured case study')}</Badge>}
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl">{getLoc(portfolio, 'title')}</h1>
            {headline && <p className="mb-8 max-w-3xl text-xl leading-relaxed text-slate-200 md:text-2xl">{headline}</p>}
            <div className="flex flex-wrap gap-6 text-slate-400">
              {portfolio.client_name && (
                <div className="flex items-center gap-2"><Building2 className="w-4 h-4" /><span>{portfolio.client_name}</span></div>
              )}
              {portfolio.industry && (
                <div className="flex items-center gap-2"><Building2 className="w-4 h-4" /><span>{portfolio.industry}</span></div>
              )}
              {portfolio.project_date && (
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{format(new Date(portfolio.project_date), 'MMMM yyyy')}</span></div>
              )}
              {portfolio.completion_date && (
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{t('portfolio.detail.completed', 'Completed')}: {format(new Date(portfolio.completion_date), 'MMMM yyyy')}</span></div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <nav aria-label={t('portfolio.detail.case_study_sections', 'Case study sections')} className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 py-4 text-sm font-semibold text-slate-600 sm:px-6 lg:px-8">
          <a href="#experience" className="whitespace-nowrap hover:text-blue-600">{t('portfolio.detail.experience', 'Experience')}</a>
          <a href="#story" className="whitespace-nowrap hover:text-blue-600">{t('portfolio.detail.project_story', 'Project story')}</a>
          <a href="#solution" className="whitespace-nowrap hover:text-blue-600">{t('portfolio.detail.solution', 'Solution')}</a>
          <a href="#results" className="whitespace-nowrap hover:text-blue-600">{t('portfolio.detail.results', 'Results')}</a>
          <a href="#gallery" className="whitespace-nowrap hover:text-blue-600">{t('portfolio.detail.media', 'Media')}</a>
        </div>
      </nav>

      {/* Content */}
      <section className="bg-gradient-to-b from-white to-slate-50 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Media Carousel */}
          {allMedia.length > 0 && (
            <motion.div id="experience" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16 scroll-mt-24">
              <div className="relative overflow-hidden rounded-[2rem] bg-slate-100 shadow-2xl shadow-slate-900/15 ring-1 ring-slate-900/10">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <AnimatePresence mode="wait">
                    {allMedia[currentSlide]?.type === 'video' ? (
                      <motion.div key={currentSlide} className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {isEmbedVideo(allMedia[currentSlide].url) ? (
                          <iframe title={`${getLoc(portfolio, 'title')} video`} src={getEmbedUrl(allMedia[currentSlide].url)} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                        ) : (
                          <video src={allMedia[currentSlide].url} poster={allMedia[currentSlide].poster || undefined} className="w-full h-full object-cover" controls />
                        )}
                      </motion.div>
                    ) : (
                      <motion.img key={currentSlide} src={allMedia[currentSlide]?.url} alt={allMedia[currentSlide]?.alt || getLoc(portfolio, 'title')} className="w-full h-full object-cover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
                    )}
                  </AnimatePresence>

                  {allMedia.length > 1 && (
                    <>
                      <button type="button" aria-label="Previous project media" onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg rtl:right-4 rtl:left-auto">
                        <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
                      </button>
                      <button type="button" aria-label="Next project media" onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg rtl:left-4 rtl:right-auto">
                        <ChevronRight className="w-6 h-6 rtl:rotate-180" />
                      </button>
                    </>
                  )}

                  {allMedia[currentSlide]?.type === 'image' && (
                    <button type="button" aria-label="Open project image" onClick={() => openLightbox(currentSlide)} className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg rtl:right-auto rtl:left-4">
                      <ZoomIn className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {allMedia.length > 1 && (
                  <div className="flex gap-2 p-4 bg-slate-50 overflow-x-auto">
                    {allMedia.map((media, i) => (
                      <button type="button" aria-label={`Show project media ${i + 1}`} key={i} onClick={() => setCurrentSlide(i)} className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${currentSlide === i ? 'border-blue-500 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                        {media.type === 'video' ? (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center"><Play className="w-6 h-6 text-white" /></div>
                        ) : (
                          <img src={media.url} alt="" className="w-full h-full object-cover" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Project Details */}
          <div id="story" className="grid scroll-mt-24 gap-12 lg:grid-cols-3">
            <div className="space-y-12 lg:col-span-2">
              {/* Overview */}
              {getLoc(portfolio, 'project_overview') && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                    <span className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
                    {t('portfolio.detail.project_overview', 'Project Overview')}
                  </h2>
                  <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-line">{getLoc(portfolio, 'project_overview')}</p>
                </motion.div>
              )}

              {/* Long Description */}
              {getLoc(portfolio, 'long_description') && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="prose prose-slate max-w-none">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{t('portfolio.detail.detailed_description', 'Detailed Description')}</h3>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">{getLoc(portfolio, 'long_description')}</p>
                </motion.div>
              )}

              {/* Challenges */}
              {getLoc(portfolio, 'challenges') && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-red-50 rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <Target className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{t('portfolio.detail.challenges', 'Challenges')}</h3>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{getLoc(portfolio, 'challenges')}</p>
                </motion.div>
              )}

              {/* Solutions */}
              {getLoc(portfolio, 'solutions') && (
                <motion.div id="solution" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="scroll-mt-24 rounded-2xl border border-blue-100 bg-blue-50 p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{t('portfolio.detail.solutions', 'Solutions')}</h3>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{getLoc(portfolio, 'solutions')}</p>
                </motion.div>
              )}

              {/* Results */}
              {getLoc(portfolio, 'results') && (
                <motion.div id="results" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="scroll-mt-24 rounded-2xl border border-emerald-100 bg-emerald-50 p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{t('portfolio.detail.results', 'Results')}</h3>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{getLoc(portfolio, 'results')}</p>
                </motion.div>
              )}

              {/* Testimonial */}
              {testimonial && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-slate-900 rounded-2xl p-8 text-white">
                  <Quote className="w-10 h-10 text-blue-400/30 mb-4" />
                  <p className="text-lg leading-relaxed mb-6">&ldquo;{getLoc(testimonial, 'content')}&rdquo;</p>
                  <div className="flex items-center gap-4">
                    {testimonial.image_url ? (
                      <img src={testimonial.image_url} alt={testimonial.client_name} className="w-12 h-12 rounded-full" />
                    ) : (
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold">{testimonial.client_name?.[0]}</div>
                    )}
                    <div>
                      <p className="font-semibold">{testimonial.client_name}</p>
                      <p className="text-slate-400 text-sm">{getLoc(testimonial, 'role')}, {testimonial.company}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-slate-50 rounded-2xl p-6">
                  <h3 className="font-bold text-slate-900 mb-4">{t('portfolio.detail.project_overview', 'Project Details')}</h3>
                  <div className="space-y-4">
                    {portfolio.client_name && <div><p className="text-sm text-slate-500">{t('portfolio.client', 'Client')}</p><p className="font-medium">{portfolio.client_name}</p></div>}
                    <div><p className="text-sm text-slate-500">{t('nav.portfolio', 'Category')}</p><p className="font-medium">{t(`portfolio.categories.${portfolio.category}`, portfolio.category)}</p></div>
                    {portfolio.completion_date && <div><p className="text-sm text-slate-500">{t('portfolio.detail.completed', 'Completed')}</p><p className="font-medium">{format(new Date(portfolio.completion_date), 'MMMM yyyy')}</p></div>}
                  </div>
                </motion.div>

                {(relatedIndustries.length > 0 || relatedServices.length > 0) && (
                  <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-2xl bg-slate-950 p-6 text-white">
                    <div className="mb-5 flex items-center gap-3"><Layers3 className="h-5 w-5 text-blue-300" /><h3 className="font-bold">{t('portfolio.detail.expertise_demonstrated', 'Expertise demonstrated')}</h3></div>
                    {relatedIndustries.length > 0 && <div className="mb-5"><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{t('portfolio.industry', 'Industry')}</p><div className="flex flex-wrap gap-2">{relatedIndustries.map((industry) => <Badge key={industry.id} className="border border-white/10 bg-white/10 text-white hover:bg-white/10">{getLoc(industry, 'name')}</Badge>)}</div></div>}
                    {relatedServices.length > 0 && <div><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{t('portfolio.solution', 'Solutions')}</p><ul className="space-y-2">{relatedServices.map((service) => <li key={service.id} className="flex items-start gap-2 text-sm text-slate-200"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />{getLoc(service, 'title')}</li>)}</ul></div>}
                  </motion.div>
                )}

                {portfolio.tech_stack?.length > 0 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-slate-50 rounded-2xl p-6">
                    <h3 className="font-bold text-slate-900 mb-4">{t('portfolio.detail.tech_stack', 'Tech Stack')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {portfolio.tech_stack.map((tech, i) => (
                        <Badge key={i} className="bg-white text-slate-700 border border-slate-200">{tech}</Badge>
                      ))}
                    </div>
                  </motion.div>
                )}

                {portfolio.live_project_url && (
                  <a href={portfolio.live_project_url} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                      {t('portfolio.detail.view_live_project', 'View Live Project')} <ExternalLink className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Gallery */}
          {gallery?.length > 0 && (
            <motion.div id="gallery" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-20 scroll-mt-24">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">{t('portfolio.detail.product_experience', 'Product experience')}</p>
              <h2 className="mb-6 mt-2 text-3xl font-bold text-slate-900">{t('portfolio.detail.screenshots', 'Screenshots and walkthroughs')}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {gallery.map((img, i) => (
                  <button key={i} type="button" aria-label={`${t('portfolio.detail.open_media', 'Open media')} ${i + 1}`} onClick={() => openLightbox(i + galleryOffset)} className="relative group rounded-2xl overflow-hidden aspect-video bg-slate-900">
                    {img.media_type === 'video' ? <video src={img.image_url} poster={img.poster_url || undefined} className="h-full w-full object-cover" muted /> : <img src={img.image_url} alt={getLoc(img, 'alt_text') || getLoc(portfolio, 'title')} className="w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-20 overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-12 text-center text-white md:px-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">{t('portfolio.detail.next_system', 'Your workflow could be next')}</p>
            <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">{t('portfolio.detail.cta_title', 'Have a complex process that should work better?')}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-300">{t('portfolio.detail.cta_description', 'Show us how your business operates today. We will help you map the opportunity and turn it into a practical digital solution.')}</p>
            <Link to="/Contact" className="mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:scale-[1.02]">{t('portfolio.detail.discuss_project', 'Discuss your project')}<ExternalLink className="h-4 w-4 rtl:-scale-x-100" /></Link>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
            <button type="button" aria-label="Close project media" onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center rtl:left-4 rtl:right-auto">
              <X className="w-6 h-6 text-white" />
            </button>
            {allMedia.length > 1 && (
              <>
                <button type="button" aria-label="Previous project media" onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length); }} className="absolute left-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center rtl:right-4 rtl:left-auto">
                  <ChevronLeft className="w-6 h-6 text-white rtl:rotate-180" />
                </button>
                <button type="button" aria-label="Next project media" onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev + 1) % allMedia.length); }} className="absolute right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center rtl:left-4 rtl:right-auto">
                  <ChevronRight className="w-6 h-6 text-white rtl:rotate-180" />
                </button>
              </>
            )}
            {allMedia[lightboxIndex]?.type === 'video' ? (
              <div className="w-full max-w-5xl aspect-video" onClick={(e) => e.stopPropagation()}>
                {isEmbedVideo(allMedia[lightboxIndex].url) ? (
                  <iframe title={`${getLoc(portfolio, 'title')} video`} src={getEmbedUrl(allMedia[lightboxIndex].url)} className="w-full h-full rounded-lg" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                ) : (
                  <video src={allMedia[lightboxIndex].url} poster={allMedia[lightboxIndex].poster || undefined} className="w-full h-full object-contain rounded-lg" controls autoPlay />
                )}
              </div>
            ) : (
              <img src={allMedia[lightboxIndex]?.url} alt={allMedia[lightboxIndex]?.alt || getLoc(portfolio, 'title')} className="max-w-full max-h-[85vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">{lightboxIndex + 1} / {allMedia.length}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

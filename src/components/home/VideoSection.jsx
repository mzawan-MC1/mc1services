import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../dataLayer';
import { Play, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLocalizedValue } from '../../utils';

export default function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const { t, i18n } = useTranslation();

  const { data: videoContent } = useQuery({
    queryKey: ['video-section'],
    queryFn: async () => {
      // Prefer Site Settings keys if present
      const settings = await dataLayer.siteSettings.getAll();
      const map = Object.fromEntries((settings || []).map(s => [s.setting_key, s.setting_value]));
      const fromSettings = {
        subtitle: map['who_we_are_subtitle'],
        title: map['who_we_are_title'],
        description: map['who_we_are_description'],
        media_url: map['who_we_are_media_url']
      };
      // Fallback to home content 'video' section
      const sections = await dataLayer.homeContent.getBySection('video');
      const fromHome = sections[0] || {};
      const preferredSettings = Object.fromEntries(Object.entries(fromSettings).filter(([, value]) => value));
      return {
        ...fromHome,
        ...preferredSettings,
        media_url: fromSettings.media_url || fromHome.background_video || fromHome.background_image,
        background_image: fromSettings.media_url || fromHome.background_image
      };
    }
  });

  const getLoc = (obj, key) => getLocalizedValue(obj, key, i18n.language, false);
  const isVideo = /\.(mp4|webm|ogg)$/i.test(videoContent?.media_url || '');
  const managedHighlights = videoContent?.content_data?.highlights;
  const highlights = Array.isArray(managedHighlights) && managedHighlights.length
    ? managedHighlights.filter((item) => item?.label || item?.label_ar).map((item) => i18n.language === 'ar' ? item.label_ar || item.label : item.label)
    : [
        t('home.video_section.features.agile', 'Clear Communication'),
        t('home.video_section.features.support', 'Practical Delivery'),
        t('home.video_section.features.global', 'Ongoing Support')
      ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 bg-purple-50 text-purple-600 rounded-full text-sm font-medium mb-4">
              {getLoc(videoContent, 'subtitle') || t('home.video_section.subtitle', 'Who We Are')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              {getLoc(videoContent, 'title') || t('home.video_section.title', 'Your Partner in Digital Transformation')}
            </h2>
            <div className="text-lg text-slate-600 mb-8 leading-relaxed whitespace-pre-line">
              {getLoc(videoContent, 'description') || t('home.video_section.desc', 'MCS Consultancy brings technology, marketing, automation, and IT expertise together to solve practical business problems. We focus on clear communication, dependable delivery, and maintainable solutions.')}
            </div>
            <div className="flex flex-wrap gap-4">
              {highlights.map((highlight, index) => <div key={highlight} className="flex items-center gap-2"><div className={`h-2 w-2 rounded-full ${['bg-green-500', 'bg-blue-500', 'bg-purple-500'][index % 3]}`} /><span className="text-slate-600">{highlight}</span></div>)}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              {/\.(mp4|webm|ogg)$/i.test(videoContent?.media_url || '') ? (
                <video src={videoContent.media_url} className="w-full aspect-video object-cover" />
              ) : videoContent?.background_image ? (
                <img
                  src={videoContent.background_image}
                  alt="Our Team"
                  className="w-full aspect-video object-cover"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-purple-900 p-8 text-center">
                  <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">MC1 Consultancy</p><p className="mt-3 text-2xl font-bold text-white">Technology shaped around your operation</p></div>
                </div>
              )}
              {isVideo && (
                <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
                  <button
                    type="button"
                    aria-label="Play company video"
                    onClick={() => setIsPlaying(true)}
                    className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                  >
                    <Play className="w-8 h-8 text-slate-900 ml-1" />
                  </button>
                </div>
              )}
            </div>

            {/* Decorative Elements */}
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl -z-10" />
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-2xl opacity-30 -z-10" />
          </motion.div>
        </div>
      </div>

      {/* Video Modal */}
      {isPlaying && isVideo && (
        <div role="dialog" aria-modal="true" aria-label="Company video" className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close company video"
            onClick={() => setIsPlaying(false)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="w-full max-w-4xl aspect-video bg-slate-900 rounded-xl overflow-hidden">
            {/\.(mp4|webm|ogg)$/i.test(videoContent?.media_url || '') ? (
              <video src={videoContent.media_url} controls autoPlay className="w-full h-full" />
            ) : (
              <img src={videoContent?.background_image} alt="Media" className="w-full h-full object-cover" />
            )}
          </div>
        </div>
      )}
    </section>
  );
}

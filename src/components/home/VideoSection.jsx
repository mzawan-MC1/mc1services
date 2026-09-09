import React, { useState } from 'react';
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
      return {
        ...fromHome,
        ...fromSettings,
        background_image: fromSettings.media_url || fromHome.background_image
      };
    }
  });

  const getLoc = (obj, key) => getLocalizedValue(obj, key, i18n.language, false);
  const isVideo = /\.(mp4|webm|ogg)$/i.test(videoContent?.media_url || '');

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
              {getLoc(videoContent, 'description') || t('home.video_section.desc', 'MCS Consultancy is a full-service technology and marketing agency dedicated to helping businesses thrive in the digital age. We combine technical expertise with creative excellence to deliver solutions that drive real results.\n\nFrom startups to enterprises, we\'ve helped over 80 clients achieve their digital goals through innovative software development, strategic marketing, and cutting-edge IT solutions.')}
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-slate-600">{t('home.video_section.features.agile', 'Agile Methodology')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-slate-600">{t('home.video_section.features.support', '24/7 Support')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span className="text-slate-600">{t('home.video_section.features.global', 'Global Delivery')}</span>
              </div>
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
              ) : (
                <img
                  src={videoContent?.background_image || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800"}
                  alt="Our Team"
                  className="w-full aspect-video object-cover"
                />
              )}
              {isVideo && (
                <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
                  <button
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
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
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

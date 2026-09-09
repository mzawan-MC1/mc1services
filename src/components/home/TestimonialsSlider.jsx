import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../dataLayer';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLocalizedValue } from '../../utils';

export default function TestimonialsSlider() {
  const [current, setCurrent] = useState(0);
  const { t, i18n } = useTranslation();

  const { data: testimonials = [] } = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => dataLayer.testimonials.getAll()
  });

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  if (testimonials.length === 0) return null;

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  const getLoc = (obj, key) => getLocalizedValue(obj, key, i18n.language);

  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-white/10 text-blue-300 rounded-full text-sm font-medium mb-4">
            {t('home.testimonials.subtitle', 'Testimonials')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            {t('home.testimonials.title', 'What Our Clients Say')}
          </h2>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10"
            >
              <Quote className="w-12 h-12 text-blue-400/30 mb-6" />
              
              <p className="text-xl md:text-2xl text-white leading-relaxed mb-8">
                "{getLoc(testimonials[current], 'content')}"
              </p>

              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < (testimonials[current]?.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-4">
                {testimonials[current]?.image_url ? (
                  <img
                    src={testimonials[current].image_url}
                    alt={getLoc(testimonials[current], 'client_name') || testimonials[current].client_name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      {(getLoc(testimonials[current], 'client_name') || testimonials[current].client_name)?.[0]}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-lg font-semibold text-white">
                    {getLoc(testimonials[current], 'client_name') || testimonials[current].client_name}
                  </p>
                  <p className="text-slate-400">
                    {getLoc(testimonials[current], 'role') || testimonials[current].role}
                    {(getLoc(testimonials[current], 'company') || testimonials[current].company) && `, ${getLoc(testimonials[current], 'company') || testimonials[current].company}`}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {testimonials.length > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={prev}
                className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      current === i ? 'bg-blue-500 w-8' : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
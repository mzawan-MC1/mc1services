import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

export default function TestimonialCard({ testimonial, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 h-full flex flex-col"
    >
      <Quote className="w-10 h-10 text-blue-100 mb-4" />
      <p className="text-slate-700 leading-relaxed flex-1 mb-6">
        "{testimonial.content}"
      </p>
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < (testimonial.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-4">
        {testimonial.image_url ? (
          <img
            src={testimonial.image_url}
            alt={testimonial.client_name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">{testimonial.client_name?.[0]}</span>
          </div>
        )}
        <div>
          <p className="font-semibold text-slate-900">{testimonial.client_name}</p>
          {(testimonial.role || testimonial.company) && (
            <p className="text-sm text-slate-500">
              {testimonial.role}{testimonial.role && testimonial.company && ', '}{testimonial.company}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
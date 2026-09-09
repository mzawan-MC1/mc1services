import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { motion } from 'framer-motion';
import { Home, ChevronRight, Share2, Facebook, MessageCircle, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ToolLayout({ title, description, icon: Icon, color, children, metaTitle, metaDescription, schemaData }) {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Set meta tags for SEO
  useEffect(() => {
    // Update document title
    document.title = metaTitle || `${title} | Free UAE Tool | MCS Consultancy`;
    
    // Update or create meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = metaDescription || description;

    // Add canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = currentUrl;

    // Add Schema.org JSON-LD for calculator tools
    const existingSchema = document.querySelector('script[data-schema="tool"]');
    if (existingSchema) existingSchema.remove();

    if (schemaData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-schema', 'tool');
      script.textContent = JSON.stringify(schemaData);
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup schema on unmount
      const schema = document.querySelector('script[data-schema="tool"]');
      if (schema) schema.remove();
    };
  }, [title, description, metaTitle, metaDescription, schemaData, currentUrl]);

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(title + ' - ' + currentUrl)}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className={`relative py-16 bg-gradient-to-br ${color || 'from-slate-900 to-slate-800'} overflow-hidden`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-6">
            <Link to={createPageUrl('Home')} className="hover:text-white flex items-center gap-1">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={createPageUrl('Tools')} className="hover:text-white">Tools</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{title}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-6"
          >
            {Icon && (
              <div className="hidden md:flex w-16 h-16 bg-white/10 rounded-2xl items-center justify-center flex-shrink-0">
                <Icon className="w-8 h-8 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{title}</h1>
              <p className="text-lg text-white/80 max-w-2xl">{description}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Tool */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8"
              >
                {children}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Share */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share This Tool
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={shareWhatsApp} className="flex-1">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={shareFacebook} className="flex-1">
                    <Facebook className="w-5 h-5 text-blue-600" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={copyLink} className="flex-1">
                    <Copy className="w-5 h-5 text-slate-600" />
                  </Button>
                </div>
              </div>

              {/* Other Tools */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Other Tools</h3>
                <ul className="space-y-3">
                  <li>
                    <Link to={createPageUrl('SalaryLoanCalculator')} className="text-blue-600 hover:underline text-sm">
                      Salary to Loan Calculator
                    </Link>
                  </li>
                  <li>
                    <Link to={createPageUrl('TrafficFinesChecker')} className="text-blue-600 hover:underline text-sm">
                      Traffic Fines Checker
                    </Link>
                  </li>
                  <li>
                    <Link to={createPageUrl('VisaOverstayCalculator')} className="text-blue-600 hover:underline text-sm">
                      Visa Overstay Calculator
                    </Link>
                  </li>
                  <li>
                    <Link to={createPageUrl('TollEstimator')} className="text-blue-600 hover:underline text-sm">
                      Toll Cost Estimator
                    </Link>
                  </li>
                  <li>
                    <Link to={createPageUrl('CurrencyConverter')} className="text-blue-600 hover:underline text-sm">
                      Currency Converter
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact CTA */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm text-blue-100 mb-4">Contact us for custom software solutions.</p>
                <Link to={createPageUrl('Contact')}>
                  <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
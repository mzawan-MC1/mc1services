import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { useTranslation } from 'react-i18next';
import { 
  Calculator, Car, Plane, CreditCard, DollarSign, Megaphone, Home as HomeIcon, Users, Briefcase,
  ArrowRight, ChevronRight, ChevronDown, TrendingUp, Link2, Percent, BarChart3,
  Zap, Droplets, Wallet, Building, Fuel, Map, Ticket, Bus, Sun, Luggage,
  Award, Landmark, FileText, Globe, HelpCircle, CheckCircle, Image, Palette, QrCode,
  FileImage, Scissors, Maximize2, RefreshCw, FileText as FilePdf, PenTool, Layout,
  Sparkles, Film, Paintbrush, Phone, Calendar, Wifi, MapPin, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEOHead from '../components/SEOHead';

// Import tool components
import MarketingTools from '../components/tools/MarketingTools';
import CreativeTools from '../components/tools/CreativeTools';
import DailyLifeTools from '../components/tools/DailyLifeTools';
import VisitorTools from '../components/tools/VisitorTools';
import BusinessTools from '../components/tools/BusinessTools';
import UAETools from '../components/tools/UAETools';
import { PhotoEditor, GifCreator, ColorPaletteGenerator, QRCodeEnhanced, ThumbnailCreatorEnhanced, ImageToPDF, BackgroundRemovalEnhanced } from '../components/tools/CreativeToolsEnhanced';
import PDFEditor from '../components/tools/PDFEditor';

// Icon mapping
const iconMap = {
  Calculator, Car, Plane, CreditCard, DollarSign, Megaphone, TrendingUp, Link2, Percent, BarChart3,
  Zap, Droplets, Wallet, Building, Fuel, Map, Ticket, Bus, Sun, Luggage,
  Award, Landmark, FileText, Globe, Image, Palette, QrCode, Scissors, Maximize2, RefreshCw,
  FilePdf, PenTool, Layout, Sparkles, Film, Paintbrush, Phone, Calendar, Wifi
};

export default function Tools() {
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('marketing');
  const [activeTool, setActiveTool] = useState(null);
  const toolRef = useRef(null);

  const categories = [
    { id: 'marketing', name: t('tools.categories.marketing', 'Digital Marketing & Ad Tools'), icon: Megaphone, color: 'from-purple-500 to-pink-500' },
    { id: 'creative', name: t('tools.categories.creative', 'Creative & Productivity Tools'), icon: Palette, color: 'from-rose-500 to-orange-500' },
    { id: 'finance', name: t('tools.categories.finance', 'UAE Life & Finance Tools'), icon: Briefcase, color: 'from-amber-500 to-orange-500' },
    { id: 'uae', name: t('tools.categories.uae', 'UAE Residents Tools'), icon: MapPin, color: 'from-green-500 to-teal-500' },
    { id: 'visitor', name: t('tools.categories.visitor', 'Dubai & Abu Dhabi Visitor Tools'), icon: Users, color: 'from-blue-500 to-cyan-500' },
  ];

  // We map the translation keys to the tool IDs to get localized titles/descriptions
  const getToolContent = (toolId, defaultTitle, defaultDesc) => {
    // Convert toolId (e.g., 'budget-split') to key format (e.g., 'budget_split') if needed
    const key = toolId.replace(/-/g, '_');
    return {
      title: t(`tools.list.${key}.title`, defaultTitle),
      desc: t(`tools.list.${key}.desc`, defaultDesc)
    };
  };

  // Fetch tools from database
  const { data: dbTools = [], isLoading: toolsLoading } = useQuery({
    queryKey: ['frontend-tools'],
    queryFn: () => dataLayer.tools.getVisible()
  });

  // SEO Meta Tags - Managed via SEOHead
  useEffect(() => {
    // Add ItemList schema for all tools
    const existingSchema = document.querySelector('script[data-schema="tools-hub"]');
    if (existingSchema) existingSchema.remove();

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "UAE Tools Hub – Free Online Tools",
      "description": "Comprehensive collection of 30+ free calculators and tools for UAE residents, visitors, marketers, and businesses",
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": 30,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Marketing Budget Calculator" },
          { "@type": "ListItem", "position": 2, "name": "ROAS Calculator" },
          { "@type": "ListItem", "position": 3, "name": "QR Code Generator" },
          { "@type": "ListItem", "position": 4, "name": "UAE Gratuity Calculator" },
          { "@type": "ListItem", "position": 5, "name": "Visa Overstay Calculator" },
          { "@type": "ListItem", "position": 6, "name": "AED Currency Converter" }
        ]
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'tools-hub');
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      const schema = document.querySelector('script[data-schema="tools-hub"]');
      if (schema) schema.remove();
    };
  }, []);

  const handleToolClick = (toolId) => {
    setActiveTool(activeTool === toolId ? null : toolId);
    setTimeout(() => {
      toolRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const scrollToCategory = (catId) => {
    setActiveCategory(catId);
    setActiveTool(null);
    document.getElementById(catId)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Group tools by category
  const toolsByCategory = dbTools.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {});

  // Check if category has visible tools
  const categoryHasTools = (catId) => toolsByCategory[catId]?.length > 0;

  return (
    <div>
      <SEOHead pageIdentifier="tools" />
      {/* Hero */}
      <section className="relative py-16 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
            <Link to={createPageUrl('Home')} className="hover:text-white flex items-center gap-1">
              <HomeIcon className="w-4 h-4" />{t('nav.home', 'Home')}
            </Link>
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            <span className="text-white">{t('nav.tools', 'Tools')}</span>
          </nav>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{t('tools.hero_title', 'UAE Tools Hub – Free Online Tools')}</h1>
            <p className="text-lg text-slate-300 mb-6">
              {t('tools.hero_desc', '30+ free calculators and tools for digital marketers, creative professionals, UAE residents, visitors, and businesses. No registration required.')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sticky Category Nav */}
      <div className="sticky top-20 z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-2 py-3 scrollbar-hide">
            {categories.filter(cat => categoryHasTools(cat.id)).map(cat => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  activeCategory === cat.id 
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-lg` 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                <span className="font-medium text-sm">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Categories & Tools */}
      <div className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {toolsLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : dbTools.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{t('tools.coming_soon', 'Tools will be available soon')}</h3>
              <p className="text-slate-600">{t('tools.check_back', 'Check back later for useful calculators and utilities.')}</p>
            </div>
          ) : (
            categories.filter(cat => categoryHasTools(cat.id)).map(category => {
              const categoryTools = toolsByCategory[category.id] || [];
              return (
                <section key={category.id} id={category.id} className="scroll-mt-36">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center`}>
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{category.name}</h2>
                      <p className="text-sm text-slate-500">
                        {t(`tools.category_desc.${category.id}`, category.id === 'marketing' ? 'Professional tools for advertisers and agencies to optimize campaigns.' : '')}
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
                    {categoryTools.map(tool => {
                      const IconComponent = iconMap[tool.icon_name] || Calculator;
                      const { title, desc } = getToolContent(tool.tool_id, tool.title, tool.description);
                      return (
                        <button
                          key={tool.tool_id}
                          onClick={() => { setActiveCategory(category.id); handleToolClick(tool.tool_id); }}
                          className={`text-left p-4 rounded-xl border-2 transition-all ${
                            activeTool === tool.tool_id && activeCategory === category.id
                              ? 'bg-white border-blue-500 shadow-lg'
                              : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md'
                          }`}
                        >
                          <div className={`w-10 h-10 bg-gradient-to-br ${category.color} rounded-lg flex items-center justify-center mb-3`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="font-semibold text-slate-900 text-sm mb-1">{title}</h3>
                          <p className="text-xs text-slate-500">{desc}</p>
                          <div className="flex items-center gap-1 mt-2 text-blue-600 text-xs font-medium">
                            <span>{t('tools.open_tool', 'Open Tool')}</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${activeTool === tool.tool_id && activeCategory === category.id ? 'rotate-180' : ''}`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Tool Panel */}
                  {activeCategory === category.id && activeTool && (
                    <motion.div
                      ref={toolRef}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-lg p-6 md:p-8"
                    >
                      {category.id === 'marketing' && <MarketingTools activeTool={activeTool} />}
                      {category.id === 'creative' && (
                        activeTool === 'photo-editor' ? <PhotoEditor /> :
                        activeTool === 'gif-creator' ? <GifCreator /> :
                        activeTool === 'color-palette' ? <ColorPaletteGenerator /> :
                        activeTool === 'qr-code' ? <QRCodeEnhanced /> :
                        activeTool === 'thumbnail' ? <ThumbnailCreatorEnhanced /> :
                        activeTool === 'image-to-pdf' ? <ImageToPDF /> :
                        activeTool === 'bg-remove' ? <BackgroundRemovalEnhanced /> :
                        activeTool === 'pdf-edit' ? <PDFEditor /> :
                        <CreativeTools activeTool={activeTool} />
                      )}
                      {category.id === 'finance' && (
                        ['utility', 'living', 'rent', 'transport', 'petrol'].includes(activeTool) 
                          ? <DailyLifeTools activeTool={activeTool} />
                          : <BusinessTools activeTool={activeTool} />
                      )}
                      {category.id === 'uae' && <UAETools activeTool={activeTool} />}
                      {category.id === 'visitor' && <VisitorTools activeTool={activeTool} />}
                    </motion.div>
                  )}
                </section>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Links */}
      <section className="py-8 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to={createPageUrl('Home')} className="text-blue-600 hover:underline">← {t('nav.home', 'Home')}</Link>
            <span className="text-slate-300">|</span>
            <Link to={createPageUrl('DevelopmentServices')} className="text-blue-600 hover:underline">{t('nav.services', 'Our Services')}</Link>
            <span className="text-slate-300">|</span>
            <Link to={createPageUrl('Contact')} className="text-blue-600 hover:underline">{t('nav.contact', 'Contact Us')}</Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">{t('tools.about.title', 'About Our UAE Tools')}</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">{t('tools.about.official_sources', 'Official Data Sources')}</h3>
              <p className="text-sm text-slate-600">{t('tools.about.official_sources_desc', 'Calculations use rates from UAE Central Bank, GDRFA, RTA, DEWA, and official government sources.')}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">{t('tools.about.standard_formulas', 'Standard Formulas')}</h3>
              <p className="text-sm text-slate-600">{t('tools.about.standard_formulas_desc', 'Financial tools follow UAE banking standards including 50% DBR cap, gratuity rules, and visa fine structures.')}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">{t('tools.about.save_prefs', 'Save Your Preferences')}</h3>
              <p className="text-sm text-slate-600">{t('tools.about.save_prefs_desc', 'Click "Save Defaults" on any tool to remember your settings locally. Your data stays in your browser.')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <HelpCircle className="w-6 h-6" />
            {t('tools.faq.title', 'Frequently Asked Questions')}
          </h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <div key={num} className="bg-white rounded-xl p-5 border border-slate-100">
                <h3 className="font-semibold text-slate-900 mb-2">{t(`tools.faq.q${num}`)}</h3>
                <p className="text-slate-600 text-sm">{t(`tools.faq.a${num}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
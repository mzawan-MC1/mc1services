import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, ArrowRight, Phone, Mail, Linkedin, Twitter, Facebook, Instagram, Youtube } from 'lucide-react';
import { dataLayer } from '../components/dataLayer';
import WhatsAppButton from '../components/WhatsAppButton';
import ScrollToTop from '../components/ScrollToTop';
import TrackingCode from '../components/TrackingCode';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const ARABIC_MENU_FALLBACKS = {
  Solutions: 'الحلول', Industries: 'القطاعات', Work: 'أعمالنا', Products: 'منتجاتنا', Company: 'الشركة', Resources: 'المصادر',
  Build: 'البناء', Scale: 'التوسع', Create: 'الإبداع', Explore: 'استكشف', 'Industry Experience': 'الخبرة القطاعية',
  'MC1 Products': 'منتجات MC1', 'About MC1': 'عن MC1', Connect: 'تواصل', Legal: 'قانوني',
  'AI Solutions & Intelligent Automation': 'حلول الذكاء الاصطناعي والأتمتة الذكية',
  'Custom Software & Business Platforms': 'البرمجيات المخصصة ومنصات الأعمال',
  'Application Development': 'تطوير التطبيقات', 'SaaS Product Engineering': 'هندسة منتجات SaaS',
  'Digital Marketing & Growth': 'التسويق الرقمي والنمو', 'Cloud, IT & Managed Support': 'السحابة وتقنية المعلومات والدعم المُدار',
  'Creative Content & Production': 'المحتوى الإبداعي والإنتاج', 'Automotive & Auctions': 'السيارات والمزادات',
  'Logistics, Shipping & Freight': 'الخدمات اللوجستية والشحن', 'Entertainment & Escape Rooms': 'الترفيه وغرف الهروب',
  Gaming: 'الألعاب', 'Food, Beverage & Hospitality': 'الأغذية والمشروبات والضيافة', 'Media & News': 'الإعلام والأخبار',
  'Legal & Professional Services': 'الخدمات القانونية والمهنية', 'Other Custom Business Workflows': 'مسارات عمل مخصصة أخرى',
  'Featured Case Studies': 'دراسات حالة مميزة', 'Client Projects': 'مشاريع العملاء', 'All Projects': 'جميع المشاريع',
  'How We Work': 'كيف نعمل', 'Our Team': 'فريقنا', Contact: 'تواصل معنا',
  'Free Business Tools': 'أدوات أعمال مجانية', FAQs: 'الأسئلة الشائعة', 'Privacy Policy': 'سياسة الخصوصية', 'Terms of Service': 'شروط الخدمة'
};

const ARABIC_DESCRIPTION_FALLBACKS = {
  'Practical AI and workflow automation.': 'ذكاء اصطناعي عملي وأتمتة لمسارات العمل.',
  'ERP, portals and operational systems.': 'أنظمة ERP وبوابات وأنظمة تشغيلية.',
  'Web, mobile and desktop applications.': 'تطبيقات الويب والجوال وسطح المكتب.',
  'Multi-tenant SaaS products and MVPs.': 'منتجات SaaS متعددة المستأجرين ونماذج أولية قابلة للتشغيل.',
  'SEO, paid media and social growth.': 'تحسين محركات البحث والإعلانات المدفوعة والنمو الاجتماعي.',
  'Infrastructure, security and support.': 'البنية التحتية والأمن والدعم.',
  'Brand, campaign and video production.': 'إنتاج العلامة التجارية والحملات والفيديو.',
  'See MC1 solutions in action.': 'شاهد حلول MC1 أثناء العمل.',
  'MC1 business workflow SaaS platform': 'منصة SaaS من MC1 لإدارة مسارات العمل',
  'An MC1-owned digital product': 'منتج رقمي مملوك لـ MC1'
};

export default function Layout({ children, currentPageName }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const isRTL = i18n.language === 'ar';
  const isAdminPage = currentPageName?.startsWith('Admin');

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [activeMenuChild, setActiveMenuChild] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [siteSettings, setSiteSettings] = useState({});
  const [headerSettings, setHeaderSettings] = useState(null);
  const [footerSettings, setFooterSettings] = useState(null);
  const [menuSources, setMenuSources] = useState({ services: [], industries: [], projects: [] });
  const [navigationReady, setNavigationReady] = useState(false);

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [isRTL, i18n.language]);

  useEffect(() => {
    const checkAdmin = async () => {
      if (isAdminPage) return;
      try {
        const admin = await dataLayer.auth.isAdmin();
        setIsAdmin(admin);
      } catch (_err) {
        setIsAdmin(false);
      }
    };

    const loadSettings = async () => {
      try {
        const settings = await dataLayer.siteSettings.getAll();
        const settingsObj = {};
        settings.forEach(s => {
          settingsObj[s.setting_key] = s.setting_value;
          settingsObj[`${s.setting_key}_ar`] = s.setting_value_ar;
        });
        setSiteSettings(settingsObj);

        if (!isAdminPage) {
          const headerFooter = await dataLayer.headerFooter.getAll();
          const header = headerFooter.find(s => s.setting_key === 'header');
          const footer = headerFooter.find(s => s.setting_key === 'footer');
          setHeaderSettings(header);
          setFooterSettings(footer);
          try {
            const [managedServices, managedIndustries, managedProjects] = await Promise.all([
              dataLayer.services.getActive(),
              dataLayer.industries.getActive(),
              dataLayer.portfolio.getPublished()
            ]);
            setMenuSources({ services: managedServices, industries: managedIndustries, projects: managedProjects });
          } catch (sourceError) {
            console.error('Failed to load managed menu sources:', sourceError);
          }
        }

        if (settingsObj.favicon_url) {
          const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
          link.rel = 'icon';
          link.href = settingsObj.favicon_url;
          document.head.appendChild(link);
        }
      } catch (_err) {
        console.error('Failed to load site settings:', _err);
      } finally {
        if (!isAdminPage) setNavigationReady(true);
      }
    };

    checkAdmin();
    loadSettings();
  }, [isAdminPage]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenMenu(null);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const closeMenus = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        setOpenMenu(null);
      }
    };
    window.addEventListener('keydown', closeMenus);
    return () => window.removeEventListener('keydown', closeMenus);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getLocalized = (obj, key) => {
    if (!obj) return '';
    if (!isRTL) return obj[key];
    if (obj[`${key}_ar`]) return obj[`${key}_ar`];
    if (key === 'description') return ARABIC_DESCRIPTION_FALLBACKS[obj[key]] || obj[key];
    return ARABIC_MENU_FALLBACKS[obj[key]] || obj[key];
  };

  const fallbackServices = [
    { name: t('services_list.web_development', 'Web Development'), href: 'WebDevelopment' },
    { name: t('services_list.app_development', 'App Development'), href: 'AppDevelopment' },
    { name: t('services_list.digital_marketing', 'Digital Marketing'), href: 'DigitalMarketing' },
    { name: t('services_list.automation', 'Automation'), href: 'Automation' },
    { name: t('services_list.production', 'Production'), href: 'Production' },
    { name: t('services_list.it_services', 'IT & Professional Services'), href: 'ITServices' },
  ];

  const fallbackNavLinks = [
    { name: t('nav.home', 'Home'), href: 'Home' },
    { name: t('nav.about', 'About'), href: 'About' },
    { name: t('nav.services', 'Services'), href: null, menu_type: 'mega', children: fallbackServices },
    { name: t('nav.portfolio', 'Portfolio'), href: 'Portfolio' },
    { name: t('nav.tools', 'Tools'), href: 'Tools' },
    { name: t('nav.contact', 'Contact'), href: 'Contact' },
  ];

  const resolveReferencedChild = (child) => {
    if (!child?.source_type || child.source_type === 'custom' || !child.source_id) return child;
    if (child.source_type === 'service') {
      const service = menuSources.services.find((item) => item.id === child.source_id);
      return service ? { ...child, label: service.title, label_ar: service.title_ar || child.label_ar, description: service.menu_description || service.description || child.description, description_ar: service.menu_description_ar || service.description_ar || child.description_ar, image_url: child.image_url || service.menu_image_url || service.image_url, href: service.slug ? `/solutions/${service.slug}` : service.page_url || child.href } : child;
    }
    if (child.source_type === 'industry') {
      const industry = menuSources.industries.find((item) => item.id === child.source_id);
      return industry ? { ...child, label: industry.name, label_ar: industry.name_ar || child.label_ar, description: industry.short_description || child.description, description_ar: industry.short_description_ar || child.description_ar, image_url: child.image_url || industry.image_url, href: industry.slug ? `/industries/${industry.slug}` : `/Portfolio?industry=${industry.slug}` } : child;
    }
    if (child.source_type === 'project') {
      const project = menuSources.projects.find((item) => item.id === child.source_id);
      return project ? { ...child, label: project.title, label_ar: project.title_ar || child.label_ar, description: project.headline || project.short_description || child.description, description_ar: project.headline_ar || project.short_description_ar || child.description_ar, image_url: child.image_url || project.main_image_url || project.image_url, href: `/PortfolioDetail?id=${project.id}` } : child;
    }
    return child;
  };

  const configuredNavLinks = Array.isArray(headerSettings?.menu_items)
    ? headerSettings.menu_items
      .filter((item) => item?.is_visible !== false)
      .map((item, index) => ({
        ...item,
        id: item.id || `menu-${index}`,
        name: getLocalized(item, 'label') || item.label,
        children: Array.isArray(item.children)
          ? item.children.map(resolveReferencedChild).map((child) => ({ ...child, name: getLocalized(child, 'label') || child.label }))
          : []
      }))
    : [];
  const navLinks = navigationReady ? (configuredNavLinks.length ? configuredNavLinks : fallbackNavLinks) : [];
  const footerServices = (navLinks.find((item) => item.id === 'solutions' || item.name === t('nav.services', 'Services'))?.children || fallbackServices).slice(0, 6);

  const resolveMenuHref = (href) => {
    if (!href) return '#';
    if (/^https?:\/\//i.test(href) || href.startsWith('/')) return href;
    return createPageUrl(href);
  };

  const isExternalHref = (href) => /^https?:\/\//i.test(href || '');
  const groupMenuChildren = (children = []) => Object.entries(children.reduce((groups, child) => {
    const group = getLocalized(child, 'group') || t('nav.explore', 'Explore');
    groups[group] = [...(groups[group] || []), child];
    return groups;
  }, {}));

  const isActive = (href) => currentPageName === href;

  return (
    <div className="min-h-screen flex flex-col overflow-x-clip bg-white">
      <TrackingCode />
      <ScrollToTop />
      <style>{`
        :root {
          --primary: #0f172a;
          --accent: #3b82f6;
          --accent-light: #60a5fa;
        }
        .gradient-text {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .glass-nav {
          backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.85);
        }
        /* RTL Support */
        [dir="rtl"] {
          font-family: 'Tajawal', 'Cairo', sans-serif;
        }
      `}</style>

      {/* Import Arabic Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet" />

      {/*
         If the page is an Admin Page (starts with "Admin"), we do NOT render the public header/footer.
         This prevents double wrapping if the Admin pages already have their own layout (AdminLayout).
      */}
      {isAdminPage ? (
        <main className="flex-1">
          {children}
        </main>
      ) : (
        <>
          <WhatsAppButton />
          {/* Top Bar */}
          <div className="bg-slate-900 text-white py-2 px-4 text-sm hidden md:block">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-6">
                <a href={`tel:${siteSettings.contact_phone || '+971508322799'}`} className="flex items-center gap-2 hover:text-blue-400 transition">
                  <Phone className="w-3.5 h-3.5" />
                  <span dir="ltr">{siteSettings.contact_phone || '+971-50-83-22799'}</span>
                </a>
                <a href={`mailto:${siteSettings.contact_email_primary || 'info@mc1services.com'}`} className="flex items-center gap-2 hover:text-blue-400 transition">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{siteSettings.contact_email_primary || 'info@mc1services.com'}</span>
                </a>
              </div>
              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <div className="w-px h-4 bg-slate-700 mx-1"></div>
                {siteSettings.social_linkedin && (
                  <a href={siteSettings.social_linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition" aria-label="LinkedIn">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {siteSettings.social_twitter && (
                  <a href={siteSettings.social_twitter} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition" aria-label="Twitter">
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {siteSettings.social_facebook && (
                  <a href={siteSettings.social_facebook} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition" aria-label="Facebook">
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {siteSettings.social_instagram && (
                  <a href={siteSettings.social_instagram} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition" aria-label="Instagram">
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {siteSettings.social_youtube && (
                  <a href={siteSettings.social_youtube} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition" aria-label="YouTube">
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
                {siteSettings.social_reddit && (
                  <a href={siteSettings.social_reddit} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition" aria-label="Reddit">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
                  </a>
                )}
                {siteSettings.social_snapchat && (
                  <a href={siteSettings.social_snapchat} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition" aria-label="Snapchat">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z"/></svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-nav shadow-lg' : 'bg-white'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-20">
                {/* Logo */}
                <Link to={createPageUrl('Home')} className="flex items-center gap-3" aria-label={t('nav.home', 'Home')}>
                  {siteSettings.logo_url ? (
                    <img
                      src={siteSettings.logo_url}
                      alt={siteSettings.company_name || 'MCS Consultancy'}
                      className="h-12 w-auto object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div style={{ display: siteSettings.logo_url ? 'none' : 'flex' }} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-xl">M</span>
                    </div>
                    <div>
                      <span className="text-xl font-bold">{siteSettings.company_name || 'MCS'}</span>
                      <span className="text-xs block text-slate-500 -mt-1">Consultancy</span>
                    </div>
                  </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="relative hidden items-center gap-5 lg:flex xl:gap-7">
                  {navLinks.map((link, linkIndex) => {
                    const menuId = link.id || link.name || `menu-${linkIndex}`;
                    const hasMenu = link.menu_type === 'mega' || link.children?.length > 0;
                    const isOpen = openMenu === menuId;
                    const previewChild = link.children?.find((child) => (child.id || child.href) === activeMenuChild[menuId]) || link.children?.[0];
                    return hasMenu ? (
                      <div key={menuId}>
                        <button
                          type="button"
                          className="flex items-center gap-1 py-2 font-medium text-slate-700 transition hover:text-blue-600"
                          onClick={() => setOpenMenu(isOpen ? null : menuId)}
                          onFocus={() => setOpenMenu(menuId)}
                          onMouseEnter={() => setOpenMenu(menuId)}
                          aria-expanded={isOpen}
                          aria-controls={`desktop-menu-${menuId}`}
                          aria-haspopup="true"
                        >
                          {link.name}
                          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <div
                          id={`desktop-menu-${menuId}`}
                          className={`absolute left-1/2 top-full w-[min(980px,calc(100vw-2rem))] -translate-x-1/2 pt-2 ${isOpen ? 'block' : 'hidden'}`}
                          onMouseEnter={() => setOpenMenu(menuId)}
                          onMouseLeave={() => setOpenMenu(null)}
                        >
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20"
                          >
                            <div className="grid min-h-[326px] lg:grid-cols-[0.92fr_1.08fr]">
                              <div className="grid content-start grid-cols-2 gap-x-3 gap-y-4 border-r border-slate-200 bg-slate-50/80 p-4 rtl:border-l rtl:border-r-0">
                                {groupMenuChildren(link.children).map(([group, children]) => (
                                  <div key={group} className={children.length > 3 ? 'col-span-2' : ''}>
                                    <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">{group}</p>
                                    <div className={children.length > 3 ? 'grid grid-cols-2 gap-1' : 'space-y-1'}>
                                      {children.map((child) => {
                                        const childKey = child.id || child.href;
                                        const selected = previewChild === child;
                                        const content = <span className="flex items-center justify-between gap-2"><span className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">{child.name || child.label}</span><ArrowRight className={`h-3.5 w-3.5 shrink-0 transition rtl:-scale-x-100 ${selected ? 'translate-x-0 text-blue-600' : '-translate-x-1 text-slate-300'}`} /></span>;
                                        const className = `block rounded-lg px-2.5 py-2 text-left transition ${selected ? 'bg-white shadow-sm ring-1 ring-slate-200' : 'hover:bg-white/80'}`;
                                        const events = { onMouseEnter: () => setActiveMenuChild((current) => ({ ...current, [menuId]: childKey })), onFocus: () => setActiveMenuChild((current) => ({ ...current, [menuId]: childKey })) };
                                        return isExternalHref(child.href) ? <a key={childKey} href={child.href} target={child.open_new_tab ? '_blank' : undefined} rel={child.open_new_tab ? 'noopener noreferrer' : undefined} className={className} {...events}>{content}</a> : <Link key={childKey} to={resolveMenuHref(child.href)} className={className} {...events}>{content}</Link>;
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {previewChild && <div className="relative flex min-h-[326px] flex-col overflow-hidden bg-slate-950 p-5 text-white">
                                {previewChild.image_url ? <img key={previewChild.image_url} src={previewChild.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-65 transition duration-500" /> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,.55),transparent_35%),linear-gradient(135deg,#0f172a,#172554,#3b0764)]" />}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-950/10" />
                                <div className="relative mt-auto max-w-xl rounded-xl border border-white/10 bg-slate-950/65 p-4 backdrop-blur-md">
                                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">{getLocalized(previewChild, 'group') || t('nav.explore')}</p>
                                  <h3 className="mt-1.5 text-xl font-bold leading-tight">{previewChild.name || previewChild.label}</h3>
                                  {getLocalized(previewChild, 'description') && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-200">{getLocalized(previewChild, 'description')}</p>}
                                  <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">{t('common.learn_more')}<ArrowRight className="h-4 w-4 rtl:-scale-x-100" /></span>
                                </div>
                              </div>}
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    ) : (
                      isExternalHref(link.href) ? <a key={menuId} href={link.href} className="font-medium text-slate-700 transition hover:text-blue-600">{link.name}</a> : <Link
                        key={menuId}
                        to={resolveMenuHref(link.href)}
                        className={`font-medium transition ${isActive(link.href) ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'}`}
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                  {isAdmin && (
                    <Link
                      to={createPageUrl('AdminDashboard')}
                      className="text-slate-700 hover:text-blue-600 font-medium transition"
                    >
                      {t('nav.admin', 'Admin')}
                    </Link>
                  )}
                </div>

                {/* CTA Button */}
                <div className="hidden lg:block">
                  <Link
                    to={createPageUrl(headerSettings?.cta_button_link || 'Contact')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                  >
                    {getLocalized(headerSettings, 'cta_button_text') || headerSettings?.cta_button_text || t('common.get_started', 'Get Started')}
                  </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-navigation"
                  aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                  className="lg:hidden p-2 text-slate-700"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  id="mobile-navigation"
                  className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-slate-200 bg-slate-50 lg:hidden"
                >
                  <div className="space-y-2 px-4 py-4">
                    <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                      <span className="text-sm font-medium text-slate-500">{t('common.language', 'Language')}</span>
                      <LanguageSwitcher />
                    </div>
                    {navLinks.map((link, linkIndex) => {
                      const menuId = link.id || link.name || `mobile-menu-${linkIndex}`;
                      const hasMenu = link.menu_type === 'mega' || link.children?.length > 0;
                      const isOpen = openMenu === menuId;
                      return hasMenu ? (
                        <div key={menuId} className={`rounded-xl transition ${isOpen ? 'border border-slate-200 bg-white shadow-sm' : ''}`}>
                          <button
                            type="button"
                            onClick={() => setOpenMenu(isOpen ? null : menuId)}
                            aria-expanded={isOpen}
                            aria-controls={`mobile-menu-${menuId}`}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left font-semibold transition ${isOpen ? 'text-blue-700' : 'text-slate-700 hover:bg-white'}`}
                          >
                            {link.name}
                            <ChevronDown className={`w-4 h-4 transition ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {isOpen && (
                            <div id={`mobile-menu-${menuId}`} className="space-y-4 px-3 pb-3">
                              {groupMenuChildren(link.children).map(([group, children]) => <div key={group} className="space-y-2"><p className="px-1 pt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">{group}</p>{children.map((child) => {
                                const childKey = child.id || child.href;
                                const description = getLocalized(child, 'description');
                                const content = <span className="flex min-w-0 flex-1 items-center gap-3">{child.image_url ? <img src={child.image_url} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" loading="lazy" /> : <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-lg font-bold text-white">{(child.name || child.label || '?').trim().charAt(0)}</span>}<span className="min-w-0 flex-1"><span className="block text-sm font-semibold leading-snug text-slate-900">{child.name || child.label}</span>{description && <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-slate-500">{description}</span>}</span><ArrowRight className="h-4 w-4 shrink-0 text-blue-500 rtl:-scale-x-100" /></span>;
                                const className = 'block rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm transition active:scale-[0.99] hover:border-blue-200 hover:shadow-md';
                                return isExternalHref(child.href) ? <a key={childKey} href={child.href} target={child.open_new_tab ? '_blank' : undefined} rel={child.open_new_tab ? 'noopener noreferrer' : undefined} onClick={() => setMobileMenuOpen(false)} className={className}>{content}</a> : <Link key={childKey} to={resolveMenuHref(child.href)} onClick={() => setMobileMenuOpen(false)} className={className}>{content}</Link>;
                              })}</div>)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          key={menuId}
                          to={resolveMenuHref(link.href)}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block rounded-xl px-3 py-3 font-semibold text-slate-700 transition hover:bg-white hover:text-blue-600"
                        >
                          {link.name}
                        </Link>
                      );
                    })}
                    {isAdmin && (
                      <Link
                        to={createPageUrl('AdminDashboard')}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block rounded-xl px-3 py-3 font-semibold text-slate-700 transition hover:bg-white hover:text-blue-600"
                      >
                        {t('nav.admin', 'Admin Dashboard')}
                      </Link>
                    )}
                    <Link
                      to={createPageUrl('Contact')}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center px-6 py-3 rounded-full font-medium"
                    >
                      {getLocalized(headerSettings, 'cta_button_text') || headerSettings?.cta_button_text || t('common.get_started', 'Get Started')}
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-slate-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                {/* Company Info */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    {siteSettings.logo_url ? (
                      <img
                        src={siteSettings.logo_url}
                        alt={siteSettings.company_name || 'MCS Consultancy'}
                        className="h-12 w-auto object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div style={{ display: siteSettings.logo_url ? 'none' : 'flex' }} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-xl">M</span>
                      </div>
                      <div>
                        <span className="text-xl font-bold">{siteSettings.company_name || 'MCS'}</span>
                        <span className="text-xs block text-slate-400 -mt-1">Consultancy</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-400 mb-6">
                    {getLocalized(footerSettings, 'footer_text') || footerSettings?.footer_text || t('footer.footer_text')}
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    {siteSettings.social_linkedin && (
                      <a href={siteSettings.social_linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition" aria-label="LinkedIn">
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {siteSettings.social_twitter && (
                      <a href={siteSettings.social_twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition" aria-label="Twitter">
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                    {siteSettings.social_facebook && (
                      <a href={siteSettings.social_facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition" aria-label="Facebook">
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                    {siteSettings.social_instagram && (
                      <a href={siteSettings.social_instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition" aria-label="Instagram">
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {siteSettings.social_youtube && (
                      <a href={siteSettings.social_youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-red-600 transition" aria-label="YouTube">
                        <Youtube className="w-5 h-5" />
                      </a>
                    )}
                    {siteSettings.social_reddit && (
                      <a href={siteSettings.social_reddit} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-orange-600 transition" aria-label="Reddit">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
                      </a>
                    )}
                  </div>
                </div>

                {/* Services */}
                <div>
                  <h3 className="text-lg font-semibold mb-6">{t('footer.services', 'Services')}</h3>
                  <ul className="space-y-3">
                    {footerServices.map((service) => (
                      <li key={service.name}>
                        <Link
                          to={resolveMenuHref(service.href)}
                          className="text-slate-400 hover:text-white transition-colors"
                        >
                          {service.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quick Links */}
                <div>
                  <h3 className="text-lg font-semibold mb-6">{t('footer.quick_links', 'Quick Links')}</h3>
                  <ul className="space-y-3">
                    {navLinks.filter(link => link.href).map((link) => (
                      <li key={link.name}>
                        <Link
                          to={resolveMenuHref(link.href)}
                          className="text-slate-400 hover:text-white transition-colors"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Contact */}
                <div>
                  <h3 className="text-lg font-semibold mb-6">{t('footer.contact_us', 'Contact Us')}</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3 text-slate-400">
                      <Phone className="w-5 h-5 shrink-0 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">{t('footer.call_us', 'Call Us')}</p>
                        <a href={`tel:${siteSettings.contact_phone || '+971508322799'}`} className="hover:text-white transition-colors" dir="ltr">
                          {siteSettings.contact_phone || '+971 50 832 2799'}
                        </a>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 text-slate-400">
                      <Mail className="w-5 h-5 shrink-0 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">{t('footer.email_us', 'Email Us')}</p>
                        <a href={`mailto:${siteSettings.contact_email_primary || 'info@mc1services.com'}`} className="hover:text-white transition-colors">
                          {siteSettings.contact_email_primary || 'info@mc1services.com'}
                        </a>
                      </div>
                    </li>
                    {siteSettings.contact_address && (
                      <li className="flex items-start gap-3 text-slate-400">
                        <div className="w-5 h-5 shrink-0 flex items-center justify-center text-blue-500 mt-0.5">
                          <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-0.5">{t('footer.visit_us', 'Visit Us')}</p>
                          <span>{siteSettings.contact_address}</span>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-slate-500 text-sm text-center md:text-left">
                  {getLocalized(footerSettings, 'copyright_text') || footerSettings?.copyright_text || `© ${new Date().getFullYear()} MCS Consultancy. ${t('footer.rights_reserved')}`}
                </p>
                <div className="flex gap-6 text-sm text-slate-500">
                  <Link to="/privacy-policy" className="hover:text-white transition-colors">{t('footer.privacy_policy', 'Privacy Policy')}</Link>
                  <Link to="/terms-of-service" className="hover:text-white transition-colors">{t('footer.terms_of_service', 'Terms of Service')}</Link>
                </div>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

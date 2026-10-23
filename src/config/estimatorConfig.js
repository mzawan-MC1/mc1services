// Project Cost Estimator — fully admin-editable configuration.
//
// Stored as JSON in site_settings under ESTIMATOR_SETTING_KEY (same
// pattern as portfolioCategories). The admin screen (Admin → Cost
// Estimator) edits it; the public estimator renders from it. If no row
// exists yet, DEFAULT_ESTIMATOR_CONFIG applies, so the tool works
// identically before anyone saves anything.

export const ESTIMATOR_SETTING_KEY = 'estimator_config';

export const ESTIMATOR_ICON_KEYS = [
  'globe', 'cart', 'dashboard', 'phone', 'bot', 'megaphone',
  'code', 'cloud', 'palette', 'chart', 'shield', 'rocket',
  'wrench', 'database', 'store', 'briefcase',
];

export const DEFAULT_ESTIMATOR_CONFIG = {
  hero: {
    badge: 'Free instant estimate',
    title: 'Project Cost Estimator',
    subtitle: 'Answer three quick questions and get an honest ballpark for your website, app or software project — cost and timeline, based on real UAE project ranges.',
    points: ['No sign-up needed', 'Takes about a minute', 'Fixed quote after a free consultation'],
    footerPrefix: 'Prefer to talk it through?',
    footerConsult: 'Book a free consultation',
    footerMid: 'or browse',
    footerWork: 'our recent work',
    footerSuffix: 'first.',
  },
  texts: {
    step1: 'What are you building?',
    step2: 'Size & features',
    step3: 'Your indicative estimate',
    sizeQuestion: 'How big is it?',
    featuresQuestion: 'Which features do you need?',
    speedQuestion: 'How fast do you need it?',
  },
  result: {
    heading: 'Indicative investment',
    disclaimer: 'This is an instant ballpark based on typical UAE projects — not a quote. Your free consultation confirms the exact scope and a fixed price before any work starts. No obligation.',
    emailHeading: 'Email me this estimate',
    emailButton: 'Send my estimate',
    whatsappButton: 'Discuss on WhatsApp',
    consultButton: 'Book a free consultation',
    sentText: "Done — we've received your details and will email your estimate shortly.",
  },
  types: [
    { id: 'website', label: 'Business Website', blurb: 'Company site, landing pages, CMS', icon: 'globe', baseMin: 6000, baseMax: 15000, weeksMin: 3, weeksMax: 6, monthly: false },
    { id: 'ecommerce', label: 'E-commerce Store', blurb: 'Catalogue, payments, orders, shipping', icon: 'cart', baseMin: 15000, baseMax: 45000, weeksMin: 6, weeksMax: 12, monthly: false },
    { id: 'webapp', label: 'Web App / SaaS Platform', blurb: 'Custom software, dashboards, portals', icon: 'dashboard', baseMin: 30000, baseMax: 120000, weeksMin: 10, weeksMax: 24, monthly: false },
    { id: 'mobile', label: 'Mobile App', blurb: 'iOS & Android, one codebase', icon: 'phone', baseMin: 35000, baseMax: 120000, weeksMin: 10, weeksMax: 22, monthly: false },
    { id: 'automation', label: 'AI & Automation', blurb: 'Workflows, chatbots, integrations', icon: 'bot', baseMin: 12000, baseMax: 60000, weeksMin: 4, weeksMax: 12, monthly: false },
    { id: 'marketing', label: 'Digital Marketing', blurb: 'Monthly retainer: ads, SEO, content', icon: 'megaphone', baseMin: 4000, baseMax: 15000, weeksMin: 1, weeksMax: 2, monthly: true },
  ],
  sizes: [
    { id: 'small', label: 'Small', blurb: 'Up to ~8 pages / screens, essentials only', mult: 1, weeksMultLow: 0.8, weeksMultHigh: 0.85, isDefault: false },
    { id: 'medium', label: 'Medium', blurb: '9–25 pages / screens, richer features', mult: 1.6, weeksMultLow: 1.1, weeksMultHigh: 1.1, isDefault: true },
    { id: 'large', label: 'Large', blurb: '25+ pages / screens, complex product', mult: 2.5, weeksMultLow: 1.5, weeksMultHigh: 1.5, isDefault: false },
  ],
  features: [
    { id: 'payments', label: 'Online payments', addMin: 4000, addMax: 10000 },
    { id: 'accounts', label: 'User accounts & login', addMin: 5000, addMax: 12000 },
    { id: 'admin', label: 'Admin dashboard', addMin: 6000, addMax: 15000 },
    { id: 'multilingual', label: 'Arabic + English (bilingual)', addMin: 3000, addMax: 8000 },
    { id: 'integrations', label: 'Third-party integrations / APIs', addMin: 5000, addMax: 20000 },
    { id: 'design', label: 'Fully custom design & branding', addMin: 4000, addMax: 10000 },
    { id: 'booking', label: 'Booking / scheduling system', addMin: 5000, addMax: 14000 },
    { id: 'chat', label: 'AI chat assistant', addMin: 6000, addMax: 18000 },
  ],
  speeds: [
    { id: 'flexible', label: 'Flexible', blurb: 'Best value — we schedule efficiently', mult: 0.9, isDefault: false },
    { id: 'standard', label: 'Standard', blurb: 'Normal delivery pace', mult: 1, isDefault: true },
    { id: 'fast', label: 'Fast-track', blurb: 'Priority delivery, tighter deadlines', mult: 1.2, isDefault: false },
  ],
};

const num = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};
const str = (value, fallback) => {
  const s = typeof value === 'string' ? value.trim() : '';
  return s || fallback;
};
const slug = (value, fallback) => {
  const s = String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return s || fallback;
};

const cleanTypes = (list) => {
  if (!Array.isArray(list)) return null;
  const seen = new Set();
  const out = list.map((t, i) => ({
    id: slug(t?.id, `type_${i + 1}`),
    label: str(t?.label, ''),
    blurb: String(t?.blurb || '').trim(),
    icon: ESTIMATOR_ICON_KEYS.includes(t?.icon) ? t.icon : 'globe',
    baseMin: Math.max(0, num(t?.baseMin, 0)),
    baseMax: Math.max(0, num(t?.baseMax, 0)),
    weeksMin: Math.max(1, Math.round(num(t?.weeksMin, 1))),
    weeksMax: Math.max(1, Math.round(num(t?.weeksMax, 2))),
    monthly: t?.monthly === true,
  })).filter((t) => t.label && !seen.has(t.id) && seen.add(t.id));
  return out.length ? out : null;
};

const cleanSizes = (list) => {
  if (!Array.isArray(list)) return null;
  const seen = new Set();
  const out = list.map((s, i) => ({
    id: slug(s?.id, `size_${i + 1}`),
    label: str(s?.label, ''),
    blurb: String(s?.blurb || '').trim(),
    mult: Math.max(0.1, num(s?.mult, 1)),
    weeksMultLow: Math.max(0.1, num(s?.weeksMultLow, 1)),
    weeksMultHigh: Math.max(0.1, num(s?.weeksMultHigh, 1)),
    isDefault: s?.isDefault === true,
  })).filter((s) => s.label && !seen.has(s.id) && seen.add(s.id));
  if (!out.length) return null;
  if (!out.some((s) => s.isDefault)) out[0].isDefault = true;
  let seenDefault = false;
  out.forEach((s) => { if (s.isDefault) { if (seenDefault) s.isDefault = false; seenDefault = true; } });
  return out;
};

const cleanFeatures = (list) => {
  if (!Array.isArray(list)) return null;
  const seen = new Set();
  const out = list.map((f, i) => ({
    id: slug(f?.id, `feature_${i + 1}`),
    label: str(f?.label, ''),
    addMin: Math.max(0, num(f?.addMin, 0)),
    addMax: Math.max(0, num(f?.addMax, 0)),
  })).filter((f) => f.label && !seen.has(f.id) && seen.add(f.id));
  // An empty array is a valid choice (it hides the features step);
  // only a missing/invalid list falls back to the defaults.
  return out;
};

const cleanSpeeds = (list) => {
  if (!Array.isArray(list)) return null;
  const seen = new Set();
  const out = list.map((s, i) => ({
    id: slug(s?.id, `speed_${i + 1}`),
    label: str(s?.label, ''),
    blurb: String(s?.blurb || '').trim(),
    mult: Math.max(0.1, num(s?.mult, 1)),
    isDefault: s?.isDefault === true,
  })).filter((s) => s.label && !seen.has(s.id) && seen.add(s.id));
  if (!out.length) return null;
  if (!out.some((s) => s.isDefault)) out[0].isDefault = true;
  let seenDefault = false;
  out.forEach((s) => { if (s.isDefault) { if (seenDefault) s.isDefault = false; seenDefault = true; } });
  return out;
};

const cloneDefaults = () => JSON.parse(JSON.stringify(DEFAULT_ESTIMATOR_CONFIG));

export const normalizeEstimatorConfig = (rawValue) => {
  const cfg = cloneDefaults();
  try {
    const parsed = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
    if (!parsed || typeof parsed !== 'object') return cfg;
    if (parsed.hero && typeof parsed.hero === 'object') {
      cfg.hero.badge = str(parsed.hero.badge, cfg.hero.badge);
      cfg.hero.title = str(parsed.hero.title, cfg.hero.title);
      cfg.hero.subtitle = str(parsed.hero.subtitle, cfg.hero.subtitle);
      if (Array.isArray(parsed.hero.points)) {
        const points = parsed.hero.points.map((p) => String(p || '').trim()).filter(Boolean).slice(0, 6);
        if (points.length) cfg.hero.points = points;
      }
      cfg.hero.footerPrefix = str(parsed.hero.footerPrefix, cfg.hero.footerPrefix);
      cfg.hero.footerConsult = str(parsed.hero.footerConsult, cfg.hero.footerConsult);
      cfg.hero.footerMid = str(parsed.hero.footerMid, cfg.hero.footerMid);
      cfg.hero.footerWork = str(parsed.hero.footerWork, cfg.hero.footerWork);
      cfg.hero.footerSuffix = str(parsed.hero.footerSuffix, cfg.hero.footerSuffix);
    }
    if (parsed.texts && typeof parsed.texts === 'object') {
      Object.keys(cfg.texts).forEach((k) => { cfg.texts[k] = str(parsed.texts[k], cfg.texts[k]); });
    }
    if (parsed.result && typeof parsed.result === 'object') {
      Object.keys(cfg.result).forEach((k) => { cfg.result[k] = str(parsed.result[k], cfg.result[k]); });
    }
    cfg.types = cleanTypes(parsed.types) || cfg.types;
    cfg.sizes = cleanSizes(parsed.sizes) || cfg.sizes;
    cfg.features = Array.isArray(parsed.features) ? cleanFeatures(parsed.features) : cfg.features;
    cfg.speeds = cleanSpeeds(parsed.speeds) || cfg.speeds;
    return cfg;
  } catch {
    return cfg;
  }
};

export const serializeEstimatorConfig = (config) => JSON.stringify(normalizeEstimatorConfig(config));

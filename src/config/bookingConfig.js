// Book a Consultation — fully admin-editable configuration.
//
// Stored as JSON in site_settings under BOOKING_SETTING_KEY (same
// pattern as the estimator). The admin screen (Admin → Booking Page)
// edits it; the public /BookConsultation page renders from it. If no
// row exists yet, DEFAULT_BOOKING_CONFIG applies — which mirrors the
// page exactly as it shipped (topics = the live service titles + Other),
// so nothing changes until the admin saves something.

export const BOOKING_SETTING_KEY = 'booking_config';

// The structural fields: name + email are always shown and required
// (the booking pipeline replies by email); the rest can be edited,
// reordered, disabled, and joined by custom fields.
export const CORE_FIELD_KEYS = ['name', 'email', 'phone', 'company', 'notes'];
export const LOCKED_FIELD_KEYS = ['name', 'email'];

export const DEFAULT_BOOKING_CONFIG = {
  texts: {
    badge: 'Free 30-minute consultation',
    title: 'Book a Consultation',
    intro: "Pick a time that suits you. We'll confirm your slot by email or WhatsApp — no obligation, just honest advice about your project.",
    topicsTitle: 'What would you like to discuss?',
    datetimeTitle: 'Pick a date & time',
    datetimeHint: '— all times Gulf Standard Time',
    dateLabel: 'Preferred date',
    timeLabel: 'Time (GST)',
    tzNote: 'Dubai time (UTC+4)',
    detailsTitle: 'Your details',
    submitLabel: 'Request this slot',
    underSubmit: 'This sends a booking request — we confirm the exact time with you personally. Prefer email?',
    underSubmitLinkLabel: 'Use the contact form',
    successTitle: 'Request received',
    successText: "You've asked for {date} at {time} GST to discuss {topic}. We'll confirm shortly at {email}.",
    whatsappLabel: 'Confirm faster on WhatsApp',
    stepsTitle: 'What happens next',
    directTitle: 'Prefer to talk directly?',
    directWhatsappLabel: 'WhatsApp us anytime',
  },
  showWhatsappButton: true,
  showDirectCard: true,
  topics: [
    { id: 'topic_1', label: 'Digital Marketing & Growth', enabled: true },
    { id: 'topic_2', label: 'Cloud, IT & Managed Support', enabled: true },
    { id: 'topic_3', label: 'Creative Content & Production', enabled: true },
    { id: 'topic_4', label: 'App Development', enabled: true },
    { id: 'topic_5', label: 'SaaS Product Engineering', enabled: true },
    { id: 'topic_6', label: 'AI & Automation', enabled: true },
    { id: 'topic_7', label: 'Custom Software', enabled: true },
    { id: 'topic_8', label: 'Other', enabled: true },
  ],
  slots: [
    { id: 'slot_1', label: '10:00 AM', enabled: true },
    { id: 'slot_2', label: '11:00 AM', enabled: true },
    { id: 'slot_3', label: '12:00 PM', enabled: true },
    { id: 'slot_4', label: '2:00 PM', enabled: true },
    { id: 'slot_5', label: '3:00 PM', enabled: true },
    { id: 'slot_6', label: '4:00 PM', enabled: true },
    { id: 'slot_7', label: '5:00 PM', enabled: true },
  ],
  dateRules: {
    minNoticeDays: 0, // 0 = today is bookable
    maxDaysAhead: 0, // 0 = no limit
  },
  steps: [
    { id: 'step_1', title: 'Send your request', text: 'Pick a topic, a date and a time that suits you — it takes under a minute.' },
    { id: 'step_2', title: 'We confirm personally', text: 'We reply by email or WhatsApp to lock in the exact slot. No automated calendar spam.' },
    { id: 'step_3', title: 'Meet for 30 minutes', text: 'A video call or phone chat about your project — honest advice, no sales pressure.' },
  ],
  badges: ['Free of charge', '30 minutes', 'No obligation'],
  fields: [
    { key: 'name', label: 'Your name', placeholder: 'Full name', required: true, enabled: true },
    { key: 'email', label: 'Email', placeholder: 'you@company.com', required: true, enabled: true },
    { key: 'phone', label: 'Phone / WhatsApp', placeholder: '+971 …', required: false, enabled: true },
    { key: 'company', label: 'Company', placeholder: 'Company name', required: false, enabled: true },
    { key: 'notes', label: 'Anything we should prepare? (optional)', placeholder: 'A few lines about your project, goals or questions…', required: false, enabled: true },
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

const cleanToggleList = (list, prefix) => {
  if (!Array.isArray(list)) return null;
  const seen = new Set();
  const out = list.map((item, i) => ({
    id: slug(item?.id, `${prefix}_${i + 1}`),
    label: str(item?.label, ''),
    enabled: item?.enabled !== false,
  })).filter((item) => item.label && !seen.has(item.id) && seen.add(item.id));
  return out.length ? out : null;
};

const cleanSteps = (list) => {
  if (!Array.isArray(list)) return null;
  const seen = new Set();
  const out = list.map((s, i) => ({
    id: slug(s?.id, `step_${i + 1}`),
    title: str(s?.title, ''),
    text: String(s?.text || '').trim(),
  })).filter((s) => s.title && !seen.has(s.id) && seen.add(s.id));
  return out.length ? out : null;
};

const cleanFields = (list) => {
  if (!Array.isArray(list)) return null;
  const seen = new Set();
  const out = list.map((f, i) => {
    const key = slug(f?.key, `custom_${i + 1}`);
    const locked = LOCKED_FIELD_KEYS.includes(key);
    return {
      key,
      label: str(f?.label, ''),
      placeholder: String(f?.placeholder || '').trim(),
      required: locked ? true : f?.required === true,
      enabled: locked ? true : f?.enabled !== false,
    };
  }).filter((f) => f.label && !seen.has(f.key) && seen.add(f.key));
  // The structural fields must always exist; re-add any that are missing.
  DEFAULT_BOOKING_CONFIG.fields.forEach((d) => {
    if (!out.some((f) => f.key === d.key)) out.push({ ...d });
  });
  return out;
};

const cloneDefaults = () => JSON.parse(JSON.stringify(DEFAULT_BOOKING_CONFIG));

export const normalizeBookingConfig = (rawValue) => {
  const cfg = cloneDefaults();
  try {
    const parsed = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
    if (!parsed || typeof parsed !== 'object') return cfg;
    if (parsed.texts && typeof parsed.texts === 'object') {
      Object.keys(cfg.texts).forEach((k) => { cfg.texts[k] = str(parsed.texts[k], cfg.texts[k]); });
    }
    if (typeof parsed.showWhatsappButton === 'boolean') cfg.showWhatsappButton = parsed.showWhatsappButton;
    if (typeof parsed.showDirectCard === 'boolean') cfg.showDirectCard = parsed.showDirectCard;
    cfg.topics = cleanToggleList(parsed.topics, 'topic') || cfg.topics;
    cfg.slots = cleanToggleList(parsed.slots, 'slot') || cfg.slots;
    if (parsed.dateRules && typeof parsed.dateRules === 'object') {
      cfg.dateRules.minNoticeDays = Math.max(0, Math.round(num(parsed.dateRules.minNoticeDays, 0)));
      cfg.dateRules.maxDaysAhead = Math.max(0, Math.round(num(parsed.dateRules.maxDaysAhead, 0)));
    }
    cfg.steps = cleanSteps(parsed.steps) || cfg.steps;
    if (Array.isArray(parsed.badges)) {
      const badges = parsed.badges.map((b) => String(b || '').trim()).filter(Boolean).slice(0, 6);
      if (badges.length) cfg.badges = badges;
    }
    cfg.fields = cleanFields(parsed.fields) || cfg.fields;
    return cfg;
  } catch {
    return cfg;
  }
};

export const serializeBookingConfig = (config) => JSON.stringify(normalizeBookingConfig(config));

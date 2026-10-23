import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Globe, ShoppingCart, LayoutDashboard, Smartphone, Bot, Megaphone, MessageCircle, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { dataLayer } from '../dataLayer';
import TurnstileWidget from '../TurnstileWidget';

// Indicative UAE agency rate card (AED). Adjust these numbers in one
// place to retune every estimate the tool produces.
const PROJECT_TYPES = [
  { id: 'website', label: 'Business Website', icon: Globe, base: [6000, 15000], weeks: [3, 6], blurb: 'Company site, landing pages, CMS' },
  { id: 'ecommerce', label: 'E-commerce Store', icon: ShoppingCart, base: [15000, 45000], weeks: [6, 12], blurb: 'Catalogue, payments, orders, shipping' },
  { id: 'webapp', label: 'Web App / SaaS Platform', icon: LayoutDashboard, base: [30000, 120000], weeks: [10, 24], blurb: 'Custom software, dashboards, portals' },
  { id: 'mobile', label: 'Mobile App', icon: Smartphone, base: [35000, 120000], weeks: [10, 22], blurb: 'iOS & Android, one codebase' },
  { id: 'automation', label: 'AI & Automation', icon: Bot, base: [12000, 60000], weeks: [4, 12], blurb: 'Workflows, chatbots, integrations' },
  { id: 'marketing', label: 'Digital Marketing', icon: Megaphone, base: [4000, 15000], weeks: [1, 2], monthly: true, blurb: 'Monthly retainer: ads, SEO, content' },
];

const SIZES = [
  { id: 'small', label: 'Small', mult: 1, blurb: 'Up to ~8 pages / screens, essentials only' },
  { id: 'medium', label: 'Medium', mult: 1.6, blurb: '9–25 pages / screens, richer features' },
  { id: 'large', label: 'Large', mult: 2.5, blurb: '25+ pages / screens, complex product' },
];

const FEATURES = [
  { id: 'payments', label: 'Online payments', add: [4000, 10000] },
  { id: 'accounts', label: 'User accounts & login', add: [5000, 12000] },
  { id: 'admin', label: 'Admin dashboard', add: [6000, 15000] },
  { id: 'multilingual', label: 'Arabic + English (bilingual)', add: [3000, 8000] },
  { id: 'integrations', label: 'Third-party integrations / APIs', add: [5000, 20000] },
  { id: 'design', label: 'Fully custom design & branding', add: [4000, 10000] },
  { id: 'booking', label: 'Booking / scheduling system', add: [5000, 14000] },
  { id: 'chat', label: 'AI chat assistant', add: [6000, 18000] },
];

const TIMELINES = [
  { id: 'flexible', label: 'Flexible', mult: 0.9, blurb: 'Best value — we schedule efficiently' },
  { id: 'standard', label: 'Standard', mult: 1, blurb: 'Normal delivery pace' },
  { id: 'fast', label: 'Fast-track', mult: 1.2, blurb: 'Priority delivery, tighter deadlines' },
];

const fmt = (n) => `AED ${Math.round(n / 500) * 500 >= 1000 ? (Math.round(n / 500) * 500).toLocaleString('en-US') : Math.round(n / 500) * 500}`;

export default function ProjectCostEstimator() {
  const [step, setStep] = useState(1);
  const [typeId, setTypeId] = useState(null);
  const [sizeId, setSizeId] = useState('medium');
  const [features, setFeatures] = useState([]);
  const [timelineId, setTimelineId] = useState('standard');
  const [lead, setLead] = useState({ name: '', email: '', phone: '' });
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const type = PROJECT_TYPES.find((t) => t.id === typeId);
  const size = SIZES.find((s) => s.id === sizeId);
  const timeline = TIMELINES.find((t) => t.id === timelineId);

  const estimate = useMemo(() => {
    if (!type) return null;
    let low = type.base[0] * size.mult;
    let high = type.base[1] * size.mult;
    features.forEach((fid) => {
      const f = FEATURES.find((x) => x.id === fid);
      if (f) { low += f.add[0]; high += f.add[1]; }
    });
    low *= timeline.mult; high *= timeline.mult;
    const weeksLow = Math.max(1, Math.round(type.weeks[0] * (size.id === 'small' ? 0.8 : size.id === 'large' ? 1.5 : 1.1)));
    const weeksHigh = Math.max(weeksLow + 1, Math.round(type.weeks[1] * (size.id === 'small' ? 0.85 : size.id === 'large' ? 1.5 : 1.1)));
    return { low, high, weeksLow, weeksHigh };
  }, [type, size, features, timeline]);

  const toggleFeature = (fid) => setFeatures((prev) => prev.includes(fid) ? prev.filter((f) => f !== fid) : [...prev, fid]);

  const summaryText = () => {
    if (!type || !estimate) return '';
    const featLabels = features.map((fid) => FEATURES.find((f) => f.id === fid)?.label).filter(Boolean);
    return [
      `Project: ${type.label} (${size.label})`,
      featLabels.length ? `Features: ${featLabels.join(', ')}` : 'Features: none extra',
      `Pace: ${timeline.label}`,
      `Indicative estimate: ${fmt(estimate.low)} – ${fmt(estimate.high)}${type.monthly ? ' / month' : ''}`,
      `Indicative timeline: ${estimate.weeksLow}–${estimate.weeksHigh} weeks`,
    ].join('\n');
  };

  const sendEstimate = async () => {
    if (!lead.name.trim() || !lead.email.trim()) { toast.error('Please add your name and email'); return; }
    if (!turnstileToken) { toast.error('Please complete the security verification'); return; }
    setSending(true);
    try {
      await dataLayer.contactSubmissions.submitPublic({
        name: lead.name.trim(),
        email: lead.email.trim().toLowerCase(),
        phone: lead.phone.trim() || null,
        company: null,
        service_interest: 'Project Cost Estimate',
        message: `A visitor used the Project Cost Estimator and asked for this estimate by email:\n\n${summaryText()}`,
        status: 'new',
        subject: 'Project Cost Estimate Request',
      }, turnstileToken);
      setSent(true);
      toast.success('Estimate request sent — check your inbox soon');
    } catch {
      setTurnstileToken('');
      setTurnstileResetKey((k) => k + 1);
      toast.error('Sending failed — please try again or use WhatsApp');
    } finally { setSending(false); }
  };

  const waText = encodeURIComponent(`Hi MCS, I used your project cost estimator. Here is my estimate:\n\n${summaryText()}\n\nI'd like to discuss it.`);

  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <span className={`flex h-7 w-7 items-center justify-center rounded-full ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{s}</span>
            {s < 3 && <span className={`h-0.5 w-8 rounded ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`} />}
          </React.Fragment>
        ))}
        <span className="ml-2 normal-case tracking-normal text-slate-500">{step === 1 ? 'What are you building?' : step === 2 ? 'Size & features' : 'Your indicative estimate'}</span>
      </div>

      {step === 1 && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {PROJECT_TYPES.map((t) => (
            <button key={t.id} onClick={() => { setTypeId(t.id); setStep(2); }} className="group rounded-2xl border border-slate-200 p-5 text-left transition hover:border-blue-400 hover:bg-blue-50/50">
              <t.icon className="h-7 w-7 text-blue-600" />
              <p className="mt-3 font-bold text-slate-900">{t.label}</p>
              <p className="mt-1 text-sm text-slate-500">{t.blurb}</p>
              <p className="mt-2 text-xs font-semibold text-slate-400">From {fmt(t.base[0])}{t.monthly ? ' / month' : ''}</p>
            </button>
          ))}
        </div>
      )}

      {step === 2 && type && (
        <div className="mt-6 space-y-7">
          <div>
            <p className="font-semibold text-slate-900">How big is it?</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {SIZES.map((s) => (
                <button key={s.id} onClick={() => setSizeId(s.id)} className={`rounded-2xl border p-4 text-left transition ${sizeId === s.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300'}`}>
                  <p className="font-bold text-slate-900">{s.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{s.blurb}</p>
                </button>
              ))}
            </div>
          </div>
          {!type.monthly && (
            <div>
              <p className="font-semibold text-slate-900">Which features do you need?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {FEATURES.map((f) => (
                  <button key={f.id} onClick={() => toggleFeature(f.id)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${features.includes(f.id) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{f.label}</button>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="font-semibold text-slate-900">How fast do you need it?</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {TIMELINES.map((t) => (
                <button key={t.id} onClick={() => setTimelineId(t.id)} className={`rounded-2xl border p-4 text-left transition ${timelineId === t.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300'}`}>
                  <p className="font-bold text-slate-900">{t.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{t.blurb}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50"><ArrowLeft className="h-4 w-4" /> Back</button>
            <button onClick={() => setStep(3)} className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">See my estimate <ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {step === 3 && type && estimate && (
        <div className="mt-6">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-blue-900 p-6 text-center md:p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-300">Indicative investment</p>
            <p className="mt-2 text-3xl font-extrabold text-white md:text-4xl">{fmt(estimate.low)} – {fmt(estimate.high)}{type.monthly && <span className="text-lg font-semibold text-blue-200"> / month</span>}</p>
            <p className="mt-2 text-sm text-slate-300">Estimated timeline: {estimate.weeksLow}–{estimate.weeksHigh} weeks · {type.label} · {size.label} · {timeline.label} pace</p>
          </div>
          <p className="mt-4 text-center text-xs leading-relaxed text-slate-400">This is an instant ballpark based on typical UAE projects — not a quote. Your free consultation confirms the exact scope and a fixed price before any work starts. No obligation.</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a href={`https://wa.me/971508322799?text=${waText}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 font-semibold text-white transition hover:brightness-105"><MessageCircle className="h-5 w-5" /> Discuss on WhatsApp</a>
            <Link to="/BookConsultation" className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-700">Book a free consultation</Link>
          </div>

          {sent ? (
            <p className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-green-50 px-5 py-4 text-sm font-medium text-green-700"><CheckCircle2 className="h-5 w-5" /> Done — we've received your details and will email your estimate shortly.</p>
          ) : (
            <div className="mt-6 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200/70">
              <p className="font-semibold text-slate-900">Email me this estimate</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <input value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} placeholder="Your name" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400" />
                <input value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} placeholder="Email" type="email" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400" />
                <input value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} placeholder="Phone (optional)" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400" />
              </div>
              <div className="mt-3"><TurnstileWidget siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ''} onVerify={setTurnstileToken} resetKey={turnstileResetKey} /></div>
              <button onClick={sendEstimate} disabled={sending} className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send my estimate
              </button>
            </div>
          )}

          <button onClick={() => { setStep(1); setSent(false); }} className="mx-auto mt-6 block text-sm font-semibold text-blue-600 hover:text-blue-700">Start over</button>
        </div>
      )}
    </div>
  );
}

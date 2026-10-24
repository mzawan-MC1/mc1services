import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Globe, MessageCircle, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { dataLayer } from '../dataLayer';
import TurnstileWidget from '../TurnstileWidget';
import { useEstimatorConfig } from '../../hooks/useEstimatorConfig';
import { ESTIMATOR_ICONS } from '../../utils/estimatorIcons';

// Fully data-driven: project types, sizes, features, speeds and every
// label come from the admin-edited configuration (Admin → Cost
// Estimator), stored in site_settings. Built-in defaults live in
// src/config/estimatorConfig.js.

const fmt = (n) => `AED ${Math.round(n / 500) * 500 >= 1000 ? (Math.round(n / 500) * 500).toLocaleString('en-US') : Math.round(n / 500) * 500}`;

export default function ProjectCostEstimator() {
  const cfg = useEstimatorConfig();
  const [step, setStep] = useState(1);
  const [typeId, setTypeId] = useState(null);
  const [sizeId, setSizeId] = useState(null);
  const [features, setFeatures] = useState([]);
  const [speedId, setSpeedId] = useState(null);
  const [lead, setLead] = useState({ name: '', email: '', phone: '' });
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const type = cfg.types.find((t) => t.id === typeId);
  const size = cfg.sizes.find((s) => s.id === sizeId) || cfg.sizes.find((s) => s.isDefault) || cfg.sizes[0];
  const speed = cfg.speeds.find((s) => s.id === speedId) || cfg.speeds.find((s) => s.isDefault) || cfg.speeds[0];

  const estimate = useMemo(() => {
    if (!type || !size || !speed) return null;
    let low = type.baseMin * size.mult;
    let high = type.baseMax * size.mult;
    features.forEach((fid) => {
      const f = cfg.features.find((x) => x.id === fid);
      if (f) { low += f.addMin; high += f.addMax; }
    });
    low *= speed.mult; high *= speed.mult;
    const weeksLow = Math.max(1, Math.round(type.weeksMin * size.weeksMultLow));
    const weeksHigh = Math.max(weeksLow + 1, Math.round(type.weeksMax * size.weeksMultHigh));
    return { low, high, weeksLow, weeksHigh };
  }, [type, size, features, speed, cfg.features]);

  const toggleFeature = (fid) => setFeatures((prev) => prev.includes(fid) ? prev.filter((f) => f !== fid) : [...prev, fid]);

  const summaryText = () => {
    if (!type || !estimate || !size || !speed) return '';
    const featLabels = features.map((fid) => cfg.features.find((f) => f.id === fid)?.label).filter(Boolean);
    return [
      `Project: ${type.label} (${size.label})`,
      featLabels.length ? `Features: ${featLabels.join(', ')}` : 'Features: none extra',
      `Pace: ${speed.label}`,
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
        service_interest: 'other',
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
        <span className="ml-2 normal-case tracking-normal text-slate-500">{step === 1 ? cfg.texts.step1 : step === 2 ? cfg.texts.step2 : cfg.texts.step3}</span>
      </div>

      {step === 1 && (
        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-3">
          {cfg.types.map((t) => {
            const Icon = ESTIMATOR_ICONS[t.icon] || Globe;
            return (
              <button key={t.id} onClick={() => { setTypeId(t.id); setStep(2); }} className="group rounded-2xl border border-slate-200 p-3.5 text-left transition hover:border-blue-400 hover:bg-blue-50/50 sm:p-5">
                <Icon className="h-6 w-6 text-blue-600 sm:h-7 sm:w-7" />
                <p className="mt-2 text-[15px] font-bold text-slate-900 sm:mt-3 sm:text-base">{t.label}</p>
                {t.blurb && <p className="mt-1 text-xs text-slate-500 sm:text-sm">{t.blurb}</p>}
                <p className="mt-2 text-xs font-semibold text-slate-400">From {fmt(t.baseMin)}{t.monthly ? ' / month' : ''}</p>
              </button>
            );
          })}
        </div>
      )}

      {step === 2 && type && size && speed && (
        <div className="mt-6 space-y-7">
          <div>
            <p className="font-semibold text-slate-900">{cfg.texts.sizeQuestion}</p>
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
              {cfg.sizes.map((s) => (
                <button key={s.id} onClick={() => setSizeId(s.id)} className={`rounded-2xl border p-3 text-left transition sm:p-4 ${size.id === s.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300'}`}>
                  <p className="font-bold text-slate-900">{s.label}</p>
                  {s.blurb && <p className="mt-1 text-xs text-slate-500">{s.blurb}</p>}
                </button>
              ))}
            </div>
          </div>
          {!type.monthly && cfg.features.length > 0 && (
            <div>
              <p className="font-semibold text-slate-900">{cfg.texts.featuresQuestion}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {cfg.features.map((f) => (
                  <button key={f.id} onClick={() => toggleFeature(f.id)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${features.includes(f.id) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{f.label}</button>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="font-semibold text-slate-900">{cfg.texts.speedQuestion}</p>
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
              {cfg.speeds.map((t) => (
                <button key={t.id} onClick={() => setSpeedId(t.id)} className={`rounded-2xl border p-3 text-left transition sm:p-4 ${speed.id === t.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300'}`}>
                  <p className="font-bold text-slate-900">{t.label}</p>
                  {t.blurb && <p className="mt-1 text-xs text-slate-500">{t.blurb}</p>}
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

      {step === 3 && type && estimate && size && speed && (
        <div className="mt-6">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-blue-900 p-6 text-center md:p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-300">{cfg.result.heading}</p>
            <p className="mt-2 text-3xl font-extrabold text-white md:text-4xl">{fmt(estimate.low)} – {fmt(estimate.high)}{type.monthly && <span className="text-lg font-semibold text-blue-200"> / month</span>}</p>
            <p className="mt-2 text-sm text-slate-300">Estimated timeline: {estimate.weeksLow}–{estimate.weeksHigh} weeks · {type.label} · {size.label} · {speed.label} pace</p>
          </div>
          <p className="mt-4 text-center text-xs leading-relaxed text-slate-400">{cfg.result.disclaimer}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a href={`https://wa.me/971508322799?text=${waText}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 font-semibold text-white transition hover:brightness-105"><MessageCircle className="h-5 w-5" /> {cfg.result.whatsappButton}</a>
            <Link to="/BookConsultation" className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-700">{cfg.result.consultButton}</Link>
          </div>

          {sent ? (
            <p className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-green-50 px-5 py-4 text-sm font-medium text-green-700"><CheckCircle2 className="h-5 w-5" /> {cfg.result.sentText}</p>
          ) : (
            <div className="mt-6 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200/70">
              <p className="font-semibold text-slate-900">{cfg.result.emailHeading}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <input value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} placeholder="Your name" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400" />
                <input value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} placeholder="Email" type="email" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400" />
                <input value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} placeholder="Phone (optional)" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400" />
              </div>
              <div className="mt-3"><TurnstileWidget siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ''} onVerify={setTurnstileToken} resetKey={turnstileResetKey} /></div>
              <button onClick={sendEstimate} disabled={sending} className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {cfg.result.emailButton}
              </button>
            </div>
          )}

          <button onClick={() => { setStep(1); setSent(false); }} className="mx-auto mt-6 block text-sm font-semibold text-blue-600 hover:text-blue-700">Start over</button>
        </div>
      )}
    </div>
  );
}

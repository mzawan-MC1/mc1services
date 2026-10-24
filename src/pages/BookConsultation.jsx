import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CalendarCheck2, Check, CheckCircle2, Clock3, Loader2, Mail, MessageCircle, Phone, Video } from 'lucide-react';
import { toast } from 'sonner';
import { dataLayer } from '../components/dataLayer';
import SEOHead from '../components/SEOHead';
import TurnstileWidget from '../components/TurnstileWidget';

const TIME_SLOTS = ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
const FALLBACK_TOPICS = ['Software Development', 'AI & Automation', 'Mobile App Development', 'E-commerce', 'Digital Marketing', 'IT Services', 'Other'];

function SectionHeader({ n, title, hint }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{n}</span>
      <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </div>
  );
}

const NEXT_STEPS = [
  { title: 'Send your request', text: 'Pick a topic, a date and a time that suits you — it takes under a minute.' },
  { title: 'We confirm personally', text: 'We reply by email or WhatsApp to lock in the exact slot. No automated calendar spam.' },
  { title: 'Meet for 30 minutes', text: 'A video call or phone chat about your project — honest advice, no sales pressure.' },
];

export default function BookConsultation() {
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', notes: '' });
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [sending, setSending] = useState(false);
  const [booked, setBooked] = useState(false);

  const { data: services = [] } = useQuery({
    queryKey: ['booking-services'],
    queryFn: async () => { try { return await dataLayer.services.getAll(); } catch { return []; } },
  });
  const topics = useMemo(() => {
    const titles = services.map((s) => s.title).filter(Boolean);
    return titles.length ? [...titles, 'Other'] : FALLBACK_TOPICS;
  }, [services]);

  const today = new Date().toISOString().split('T')[0];
  const prettyDate = date ? new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';

  const submit = async (e) => {
    e.preventDefault();
    // The submission service only accepts a fixed set of service codes —
    // map the chosen topic to the closest one (the true topic travels in
    // the message itself).
    const topicCode = (() => {
      const t = topic.toLowerCase();
      if (t.includes('app')) return 'app_development';
      if (t.includes('web')) return 'web_development';
      if (t.includes('marketing') || t.includes('growth')) return 'digital_marketing';
      if (t.includes('seo')) return 'seo';
      if (t.includes('social')) return 'social_media';
      if (t.includes('brand') || t.includes('creative') || t.includes('production')) return 'branding';
      if (t.includes('cloud') || t.includes('it')) return 'it_consulting';
      if (t.includes('software') || t.includes('saas') || t.includes('automation') || t.includes('ai')) return 'custom_software';
      return 'other';
    })();
    if (!topic) { toast.error('Please choose what you would like to discuss'); return; }
    if (!date || !slot) { toast.error('Please pick a date and a time slot'); return; }
    if (!form.name.trim() || !form.email.trim()) { toast.error('Please add your name and email'); return; }
    if (!turnstileToken) { toast.error('Please complete the security verification'); return; }
    setSending(true);
    try {
      await dataLayer.contactSubmissions.submitPublic({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        company: form.company.trim() || null,
        service_interest: topicCode,
        message: `Consultation booking request\nTopic: ${topic}\nPreferred date: ${prettyDate} (${date})\nPreferred time: ${slot} (GST, UTC+4)\nFormat: Video call / phone\n\nNotes: ${form.notes.trim() || '—'}`,
        source: 'booking',
        context: { topic, date: `${prettyDate} (${date})`, time: slot },
        status: 'new',
        subject: `Consultation Booking: ${topic} — ${date} ${slot}`,
      }, turnstileToken);
      setBooked(true);
    } catch {
      setTurnstileToken('');
      setTurnstileResetKey((k) => k + 1);
      toast.error('Booking failed — please try again or message us on WhatsApp');
    } finally { setSending(false); }
  };

  const waText = encodeURIComponent(`Hi MCS, I just requested a consultation.\nTopic: ${topic}\nPreferred: ${prettyDate} at ${slot} GST\nName: ${form.name}`);
  const inputCls = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100';

  return (
    <div className="min-h-screen bg-slate-50">
      <SEOHead pageIdentifier="BookConsultation" />

      <section className="relative overflow-hidden bg-slate-900 py-14 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_70%_0%,rgba(37,99,235,0.35),transparent),radial-gradient(50%_50%_at_10%_100%,rgba(20,184,166,0.25),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-200 ring-1 ring-white/15">
            <Video className="h-3.5 w-3.5" /> Free 30-minute consultation
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight text-white md:text-5xl">Book a Consultation</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">
            Pick a time that suits you. We'll confirm your slot by email or WhatsApp — no obligation, just honest advice about your project.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        {booked ? (
          <div className="mx-auto max-w-2xl rounded-3xl bg-white px-8 py-14 text-center shadow-sm ring-1 ring-slate-200/70">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600"><CheckCircle2 className="h-9 w-9" /></span>
            <h2 className="mt-5 text-2xl font-bold text-slate-900">Request received</h2>
            <p className="mx-auto mt-2 max-w-md text-slate-500">
              You've asked for <strong className="text-slate-700">{prettyDate} at {slot} GST</strong> to discuss <strong className="text-slate-700">{topic}</strong>. We'll confirm shortly at {form.email}.
            </p>
            <a href={`https://wa.me/971508322799?text=${waText}`} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105">
              <MessageCircle className="h-4 w-4" /> Confirm faster on WhatsApp
            </a>
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[320px_1fr]">
            {/* Sidebar — what happens next + direct contact */}
            <aside className="order-2 space-y-6 lg:order-1 lg:sticky lg:top-24">
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">What happens next</h2>
                <ol className="mt-5 space-y-5">
                  {NEXT_STEPS.map((s, i) => (
                    <li key={s.title} className="flex gap-3.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600 ring-1 ring-blue-100">{i + 1}</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{s.title}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{s.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
                  {['Free of charge', '30 minutes', 'No obligation'].map((b) => (
                    <span key={b} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"><Check className="h-3 w-3 text-teal-600" />{b}</span>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm">
                <h2 className="text-sm font-bold uppercase tracking-wider">Prefer to talk directly?</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <a href="tel:+971508322799" className="flex items-center gap-3 text-slate-200 transition hover:text-white"><Phone className="h-4 w-4 shrink-0 text-teal-300" /> +971 50 832 2799</a>
                  <a href="mailto:info@mc1services.com" className="flex items-center gap-3 text-slate-200 transition hover:text-white"><Mail className="h-4 w-4 shrink-0 text-teal-300" /> info@mc1services.com</a>
                  <a href="https://wa.me/971508322799" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-200 transition hover:text-white"><MessageCircle className="h-4 w-4 shrink-0 text-teal-300" /> WhatsApp us anytime</a>
                </div>
              </div>
            </aside>

            {/* The booking form, in three numbered sections */}
            <form onSubmit={submit} className="order-1 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 md:p-8 lg:order-2">
              <section>
                <SectionHeader n={1} title="What would you like to discuss?" />
                <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
                  {topics.map((t) => {
                    const active = topic === t;
                    return (
                      <button type="button" key={t} onClick={() => setTopic(t)} aria-pressed={active} className={`flex min-h-[2.75rem] items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-center text-[13px] font-medium leading-snug transition ${active ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {active && <Check className="h-3.5 w-3.5 shrink-0" />}{t}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="mt-8 border-t border-slate-100 pt-8">
                <SectionHeader n={2} title="Pick a date & time" hint="— all times Gulf Standard Time" />
                <div className="mt-4 grid gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Preferred date</label>
                    <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
                    {prettyDate && <p className="mt-2 text-xs font-medium text-blue-600">{prettyDate}</p>}
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400"><Clock3 className="h-3.5 w-3.5" /> Time (GST)</label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map((s) => (
                        <button type="button" key={s} onClick={() => setSlot(s)} aria-pressed={slot === s} className={`rounded-xl px-2 py-2.5 text-xs font-semibold transition ${slot === s ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{s}</button>
                      ))}
                      <span className="col-span-2 flex items-center rounded-xl bg-slate-50 px-3 text-[11px] font-medium text-slate-400 ring-1 ring-inset ring-slate-100">Dubai time (UTC+4)</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mt-8 border-t border-slate-100 pt-8">
                <SectionHeader n={3} title="Your details" />
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <div><label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Your name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Full name" /></div>
                  <div><label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email *</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} placeholder="you@company.com" /></div>
                  <div><label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Phone / WhatsApp</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} placeholder="+971 …" /></div>
                  <div><label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Company</label><input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={inputCls} placeholder="Company name" /></div>
                </div>
                <div className="mt-5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Anything we should prepare? (optional)</label>
                  <textarea rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputCls} placeholder="A few lines about your project, goals or questions…" />
                </div>
              </section>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <TurnstileWidget siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ''} onVerify={setTurnstileToken} resetKey={turnstileResetKey} />
                <button type="submit" disabled={sending} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60 sm:w-auto">
                  {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <CalendarCheck2 className="h-5 w-5" />} Request this slot
                </button>
                <p className="mt-3 text-xs leading-relaxed text-slate-400">This sends a booking request — we confirm the exact time with you personally. Prefer email? <Link to="/Contact" className="font-semibold text-blue-600">Use the contact form</Link>.</p>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

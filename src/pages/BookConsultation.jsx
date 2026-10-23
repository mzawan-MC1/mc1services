import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CalendarCheck2, CheckCircle2, Clock3, Loader2, MessageCircle, Video } from 'lucide-react';
import { toast } from 'sonner';
import { dataLayer } from '../components/dataLayer';
import SEOHead from '../components/SEOHead';
import TurnstileWidget from '../components/TurnstileWidget';

const TIME_SLOTS = ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
const FALLBACK_TOPICS = ['Software Development', 'AI & Automation', 'Mobile App Development', 'E-commerce', 'Digital Marketing', 'IT Services', 'Other'];

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
        service_interest: topic,
        message: `Consultation booking request\nTopic: ${topic}\nPreferred date: ${prettyDate} (${date})\nPreferred time: ${slot} (GST, UTC+4)\nFormat: Video call / phone\n\nNotes: ${form.notes.trim() || '—'}`,
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

  return (
    <div className="min-h-screen bg-slate-50">
      <SEOHead pageIdentifier="BookConsultation" />

      <section className="relative overflow-hidden bg-slate-900 py-16 md:py-20">
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

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        {booked ? (
          <div className="rounded-3xl bg-white px-8 py-14 text-center shadow-sm ring-1 ring-slate-200/70">
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
          <form onSubmit={submit} className="space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 md:p-8">
            <div>
              <label className="text-sm font-semibold text-slate-900">What would you like to discuss?</label>
              <div className="mt-3 flex flex-wrap gap-2">
                {topics.map((t) => (
                  <button type="button" key={t} onClick={() => setTopic(t)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${topic === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{t}</button>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-900">Preferred date</label>
                <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-900"><Clock3 className="h-4 w-4 text-slate-400" /> Time (GST)</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TIME_SLOTS.map((s) => (
                    <button type="button" key={s} onClick={() => setSlot(s)} className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${slot === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{s}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div><label className="text-sm font-semibold text-slate-900">Your name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400" placeholder="Full name" /></div>
              <div><label className="text-sm font-semibold text-slate-900">Email *</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400" placeholder="you@company.com" /></div>
              <div><label className="text-sm font-semibold text-slate-900">Phone / WhatsApp</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400" placeholder="+971 …" /></div>
              <div><label className="text-sm font-semibold text-slate-900">Company</label><input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400" placeholder="Company name" /></div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-900">Anything we should prepare? (optional)</label>
              <textarea rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400" placeholder="A few lines about your project, goals or questions…" />
            </div>

            <TurnstileWidget onVerify={setTurnstileToken} resetKey={turnstileResetKey} />

            <button type="submit" disabled={sending} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60 sm:w-auto">
              {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <CalendarCheck2 className="h-5 w-5" />} Request this slot
            </button>
            <p className="text-xs text-slate-400">This sends a booking request — we confirm the exact time with you personally. Prefer email? <Link to="/Contact" className="font-semibold text-blue-600">Use the contact form</Link>.</p>
          </form>
        )}
      </main>
    </div>
  );
}

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Send, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { dataLayer } from './dataLayer';
import TurnstileWidget from './TurnstileWidget';

// Knowledge-based site assistant: answers from the live CMS (services,
// FAQs, settings), guides visitors to the estimator / booking / portfolio,
// and captures leads into the same Inquiries inbox as the contact form.
// The responder is deliberately modular — an LLM endpoint can replace
// answerFor() later without touching the UI.

const CHIPS = ['Our services', 'What does it cost?', 'Book a consultation', 'See your work', 'Talk to a human'];

const includesAny = (text, words) => words.some((w) => text.includes(w));

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [capture, setCapture] = useState(null); // { name, contact, message } while the lead form is open
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [sending, setSending] = useState(false);
  const greetedRef = useRef(false);
  const scrollRef = useRef(null);

  const { data: services = [] } = useQuery({
    queryKey: ['assistant-services'],
    queryFn: async () => { try { return await dataLayer.services.getAll(); } catch { return []; } },
    staleTime: 10 * 60 * 1000,
  });
  const { data: settingsRows = [] } = useQuery({
    queryKey: ['assistant-settings'],
    queryFn: async () => { try { return await dataLayer.siteSettings.getAll(); } catch { return []; } },
    staleTime: 10 * 60 * 1000,
  });

  const settings = useMemo(() => {
    const obj = {};
    (settingsRows || []).forEach((s) => { if (s?.setting_key) obj[s.setting_key] = s.setting_value; });
    return obj;
  }, [settingsRows]);

  const phone = settings.contact_phone || '+971 50 832 2799';
  const waNumber = (settings.whatsapp_number || settings.contact_phone || '+971508322799').replace(/[^0-9]/g, '');
  const email = settings.contact_email_primary || 'info@mc1services.com';

  useEffect(() => {
    if (open && !greetedRef.current) {
      greetedRef.current = true;
      pushBot("Hi, I'm the MCS assistant. Ask me about our services, prices or timelines — or tap one of these:");
    }
  }, [open ]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, capture, open]);

  const pushBot = (text, links) => setMessages((m) => [...m, { from: 'bot', text, links }]);
  const pushUser = (text) => setMessages((m) => [...m, { from: 'user', text }]);

  const answerFor = (raw) => {
    const text = raw.toLowerCase();

    if (includesAny(text, ['human', 'agent', 'whatsapp', 'real person', 'someone'])) {
      return { text: `Of course — you can reach the team right away on WhatsApp at ${phone}, or leave your details here and we'll reply within one business day.`, links: [{ label: 'Chat on WhatsApp', href: `https://wa.me/${waNumber}`, external: true }, { label: 'Leave your details', action: 'capture' }] };
    }
    if (includesAny(text, ['book', 'consultation', 'meeting', 'call', 'appointment', 'schedule'])) {
      return { text: "You can book a free 30-minute consultation and pick a time that suits you — we'll confirm personally, no obligation.", links: [{ label: 'Book a consultation', to: '/BookConsultation' }, { label: 'Leave your details', action: 'capture' }] };
    }
    if (includesAny(text, ['cost', 'price', 'pricing', 'quote', 'how much', 'budget', 'estimate'])) {
      return { text: "Every project is scoped individually, but you can get an instant ballpark right now with our Project Cost Estimator — it takes about a minute. Or book a free consultation for an exact, fixed quote.", links: [{ label: 'Open the cost estimator', to: '/ProjectCostEstimator' }, { label: 'Book a consultation', to: '/BookConsultation' }] };
    }
    if (includesAny(text, ['portfolio', 'work', 'projects', 'clients', 'case stud'])) {
      return { text: "We've delivered 80+ projects across the UAE — auction platforms, marketplaces, SaaS products and more. Take a look at the case studies:", links: [{ label: 'See our work', to: '/Portfolio' }] };
    }
    if (includesAny(text, ['contact', 'phone', 'email', 'location', 'address', 'where are you', 'sharjah', 'dubai'])) {
      return { text: `We're based in Sharjah and work across the UAE & GCC. Phone/WhatsApp: ${phone} · Email: ${email}.`, links: [{ label: 'Contact page', to: '/Contact' }, { label: 'Chat on WhatsApp', href: `https://wa.me/${waNumber}`, external: true }] };
    }
    if (includesAny(text, ['how long', 'timeline', 'duration', 'delivery time', 'deadline'])) {
      return { text: "Typical timelines: a business website in 3–6 weeks, e-commerce in 6–12 weeks, and custom platforms in 10–24 weeks depending on scope. The estimator gives a timeline range for your specific project.", links: [{ label: 'Try the estimator', to: '/ProjectCostEstimator' }] };
    }
    if (includesAny(text, ['service', 'what do you do', 'offer', 'develop', 'build', 'app', 'website', 'software', 'ai', 'automation', 'marketing', 'seo'])) {
      const matched = services.find((s) => {
        if (!s.title) return false;
        const t = s.title.toLowerCase();
        if (text.includes(t)) return true;
        const words = t.split(' ').filter((w) => w.length > 3);
        return words.length >= 2 && words.slice(0, 2).every((w) => text.includes(w));
      });
      if (matched) {
        return { text: `${matched.title}: ${(matched.short_description || matched.description || '').slice(0, 220)}`, links: [{ label: `Explore ${matched.title}`, to: `/solutions/${matched.slug}` }, { label: 'Get an estimate', to: '/ProjectCostEstimator' }] };
      }
      const list = services.slice(0, 7).map((s) => `• ${s.title}`).join('\n');
      return { text: `Here's what we do:\n${list || '• Software Development\n• AI & Automation\n• Mobile Apps\n• Digital Marketing\n• IT Services'}\n\nTell me which one you're interested in, or get an instant estimate.`, links: [{ label: 'Get an estimate', to: '/ProjectCostEstimator' }, { label: 'Book a consultation', to: '/BookConsultation' }] };
    }
    if (includesAny(text, ['hi', 'hello', 'hey', 'salam', 'good morning', 'good afternoon'])) {
      return { text: "Hello! Great to meet you. Are you planning a website, an app, or something with AI and automation? I can point you to examples, prices or a free consultation." };
    }
    if (includesAny(text, ['thank', 'great', 'perfect', 'awesome'])) {
      return { text: "You're welcome! If you'd like, leave your details and the team will follow up personally — or keep asking me anything." , links: [{ label: 'Leave your details', action: 'capture' }] };
    }
    return { text: "I can help with our services, ballpark pricing, timelines, our portfolio, or booking a free consultation. For anything more specific, leave your details and the team will reply within one business day.", links: [{ label: 'Leave your details', action: 'capture' }, { label: 'Talk to a human', href: `https://wa.me/${waNumber}`, external: true }] };
  };

  const send = (rawText) => {
    const text = (rawText ?? input).trim();
    if (!text) return;
    pushUser(text);
    setInput('');
    setTyping(true);
    const { text: reply, links } = answerFor(text);
    setTimeout(() => { setTyping(false); pushBot(reply, links); }, 550);
  };

  const startCapture = () => {
    setCapture({ name: '', contact: '', message: '' });
    pushBot('Happy to pass this to the team. Fill in your details below and hit send:');
  };

  const submitCapture = async () => {
    if (!capture.name.trim() || !capture.contact.trim()) { toast.error('Please add your name and an email or phone'); return; }
    if (!turnstileToken) { toast.error('Please complete the security check'); return; }
    setSending(true);
    try {
      const isEmail = capture.contact.includes('@');
      await dataLayer.contactSubmissions.submitPublic({
        name: capture.name.trim(),
        email: isEmail ? capture.contact.trim().toLowerCase() : email,
        phone: isEmail ? null : capture.contact.trim(),
        company: null,
        service_interest: 'other',
        message: `Lead from the website assistant chat.\nContact: ${capture.contact.trim()}\n\n${capture.message.trim() || '(no message written)'}\n\nConversation:\n${messages.map((m) => `${m.from === 'user' ? 'Visitor' : 'Assistant'}: ${m.text}`).join('\n')}`.slice(0, 4900),
        status: 'new',
        subject: 'Website Assistant Lead',
      }, turnstileToken);
      setCapture(null);
      pushBot(`Thanks, ${capture.name.split(' ')[0]} — your details are with the team. We'll reply within one business day. Anything else I can help with?`);
    } catch {
      setTurnstileToken('');
      setTurnstileResetKey((k) => k + 1);
      toast.error('Sending failed — please try WhatsApp instead');
    } finally { setSending(false); }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Chat with the MCS assistant"
          className="fixed bottom-24 left-4 z-50 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-600 to-teal-500 py-3 pl-4 pr-5 text-white shadow-2xl ring-1 ring-white/30 transition hover:scale-[1.03] sm:bottom-6 sm:left-6"
        >
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-semibold">Ask MCS</span>
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-pulse rounded-full bg-green-400 ring-2 ring-white" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-24 left-4 z-50 flex h-[min(560px,calc(100dvh-8rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 sm:bottom-6 sm:left-6">
          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-700 to-teal-600 px-5 py-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25"><Sparkles className="h-5 w-5 text-white" /></span>
            <div className="flex-1">
              <p className="font-bold leading-tight text-white">MCS Assistant</p>
              <p className="text-xs text-blue-100">Answers instantly · team replies within 1 business day</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-full p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white"><X className="h-5 w-5" /></button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={m.from === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.from === 'user' ? 'rounded-br-md bg-blue-600 text-white' : 'rounded-bl-md bg-white text-slate-700 shadow-sm ring-1 ring-slate-200/70'}`}>
                  {m.text}
                  {m.links && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {m.links.map((l, li) => l.action === 'capture' ? (
                        <button key={li} onClick={startCapture} className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700">{l.label}</button>
                      ) : l.external ? (
                        <a key={li} href={l.href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700">{l.label}</a>
                      ) : (
                        <Link key={li} to={l.to} onClick={() => setOpen(false)} className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-200 transition hover:bg-blue-100">{l.label}</Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && <div className="flex justify-start"><div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/70"><Loader2 className="h-4 w-4 animate-spin text-blue-600" /></div></div>}

            {capture && (
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-blue-200">
                <p className="text-sm font-semibold text-slate-900">Leave your details</p>
                <input value={capture.name} onChange={(e) => setCapture({ ...capture, name: e.target.value })} placeholder="Your name" className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
                <input value={capture.contact} onChange={(e) => setCapture({ ...capture, contact: e.target.value })} placeholder="Email or phone / WhatsApp" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
                <textarea value={capture.message} onChange={(e) => setCapture({ ...capture, message: e.target.value })} placeholder="What do you need? (optional)" rows={2} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
                <div className="mt-2 origin-left scale-[0.85]"><TurnstileWidget siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ''} onVerify={setTurnstileToken} resetKey={turnstileResetKey} /></div>
                <div className="mt-1 flex gap-2">
                  <button onClick={submitCapture} disabled={sending} className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60">{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send</button>
                  <button onClick={() => setCapture(null)} className="rounded-full px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">Cancel</button>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 bg-white px-4 pb-2 pt-3">
            <div className="flex gap-1.5 overflow-x-auto pb-2">
              {CHIPS.map((chip) => (
                <button key={chip} onClick={() => chip === 'Talk to a human' ? send('Talk to a human') : send(chip)} className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700">{chip}</button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2 pb-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about services, prices…" className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white" />
              <button type="submit" aria-label="Send message" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700"><Send className="h-4 w-4" /></button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

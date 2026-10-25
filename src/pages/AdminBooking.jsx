import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, CalendarCheck2, ChevronDown, ExternalLink, Loader2, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { dataLayer } from '../components/dataLayer';
import { Switch } from '@/components/ui/switch';
import { DEFAULT_BOOKING_CONFIG, CORE_FIELD_KEYS, LOCKED_FIELD_KEYS, normalizeBookingConfig } from '../config/bookingConfig';
import AdminLayout from '../components/admin/AdminLayout';

const inputCls = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const labelCls = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500';

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function Section({ title, hint, open, onToggle, children }) {
  return (
    <section className={`rounded-2xl bg-white shadow-sm ring-1 transition ${open ? 'ring-slate-300' : 'ring-slate-200/70'}`}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-start justify-between gap-3 p-5 text-left md:px-6">
        <span>
          <span className="block text-base font-bold text-slate-900">{title}</span>
          {hint && <span className="mt-0.5 block text-xs font-normal text-slate-400">{hint}</span>}
        </span>
        <ChevronDown className={`mt-1 h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-5 pb-5 md:px-6 md:pb-6">{children}</div>}
    </section>
  );
}

function RowControls({ index, count, onMove, onDelete, deleteDisabled }) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button type="button" title="Move up" disabled={index === 0} onClick={() => onMove(index, -1)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
      <button type="button" title="Move down" disabled={index === count - 1} onClick={() => onMove(index, 1)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
      <button type="button" title="Delete" disabled={deleteDisabled} onClick={() => onDelete(index)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}

const move = (list, index, dir) => {
  const next = [...list];
  const target = index + dir;
  if (target < 0 || target >= next.length) return list;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};
const newId = (prefix) => `${prefix}_${Date.now().toString(36)}${Math.floor(Math.random() * 999)}`;

const TEXT_FIELDS = [
  ['badge', 'Top badge'],
  ['title', 'Page title'],
  ['intro', 'Intro paragraph', 3],
  ['topicsTitle', 'Section 1 — topics heading'],
  ['datetimeTitle', 'Section 2 — date & time heading'],
  ['datetimeHint', 'Date & time hint (next to heading)'],
  ['dateLabel', 'Date field label'],
  ['timeLabel', 'Time field label'],
  ['tzNote', 'Timezone note (under the slots)'],
  ['detailsTitle', 'Section 3 — details heading'],
  ['submitLabel', 'Submit button label'],
  ['underSubmit', 'Line under the submit button', 2],
  ['underSubmitLinkLabel', 'Contact-form link label'],
  ['successTitle', 'Success screen title'],
  ['successText', 'Success screen text — {date} {time} {topic} {email}', 3],
  ['whatsappLabel', 'WhatsApp button label (success screen)'],
  ['stepsTitle', 'Sidebar — steps heading'],
  ['directTitle', 'Sidebar — direct contact heading'],
  ['directWhatsappLabel', 'Sidebar — WhatsApp row label'],
];

export default function AdminBooking() {
  const queryClient = useQueryClient();
  const { data: remote, isLoading } = useQuery({
    queryKey: ['admin-booking-config'],
    queryFn: () => dataLayer.booking.getConfig(),
    retry: false,
  });
  const [cfg, setCfg] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [openSection, setOpenSection] = useState(0);
  const toggleSection = (i) => setOpenSection((cur) => (cur === i ? -1 : i));

  useEffect(() => { if (remote && !cfg) setCfg(normalizeBookingConfig(remote)); }, [remote, cfg]);

  const update = (patch) => { setCfg((c) => ({ ...c, ...patch })); setDirty(true); };
  const updateList = (key, list) => update({ [key]: list });
  const updateText = (key, value) => update({ texts: { ...cfg.texts, [key]: value } });

  const saveMutation = useMutation({
    mutationFn: () => dataLayer.booking.saveConfig(cfg),
    onSuccess: () => {
      setDirty(false);
      queryClient.invalidateQueries({ queryKey: ['booking-config'] });
      queryClient.invalidateQueries({ queryKey: ['admin-booking-config'] });
      toast.success('Booking page updated — the live page now uses your settings');
    },
    onError: () => toast.error('Could not save. Please try again.'),
  });

  const summary = useMemo(() => cfg
    ? `${cfg.topics.filter((t) => t.enabled).length} topics · ${cfg.slots.filter((s) => s.enabled).length} time slots · ${cfg.fields.filter((f) => f.enabled).length} detail fields`
    : '', [cfg]);

  if (isLoading || !cfg) {
    return (
      <AdminLayout currentPage="AdminBooking">
        <div className="flex items-center justify-center py-24 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
      </AdminLayout>
    );
  }

  const toggleRow = (key, i, patch) => updateList(key, cfg[key].map((x, xi) => (xi === i ? { ...x, ...patch } : x)));

  return (
    <AdminLayout currentPage="AdminBooking">
      <div className="mx-auto max-w-5xl space-y-6 pb-28">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><CalendarCheck2 className="h-6 w-6 text-blue-600" /> Booking Page</h1>
            <p className="mt-1 text-sm text-slate-500">Everything on /BookConsultation is edited here — topics, time slots, date rules, the detail fields and all the wording. {summary}.</p>
          </div>
          <a href="/BookConsultation" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-600 ring-1 ring-slate-200 transition hover:ring-blue-300">View live <ExternalLink className="h-3.5 w-3.5" /></a>
        </div>

        {/* ── Page texts ─────────────────────────────────────────── */}
        <Section title="Page texts & switches" open={openSection === 0} onToggle={() => toggleSection(0)} hint="Every heading, label and paragraph on the booking page, plus two on/off switches.">
          <div className="grid gap-4 sm:grid-cols-2">
            {TEXT_FIELDS.map(([key, label, rows]) => (
              <Field key={key} label={label} className={rows ? 'sm:col-span-2' : ''}>
                {rows
                  ? <textarea rows={rows} className={inputCls} value={cfg.texts[key]} onChange={(e) => updateText(key, e.target.value)} />
                  : <input className={inputCls} value={cfg.texts[key]} onChange={(e) => updateText(key, e.target.value)} />}
              </Field>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">"Confirm faster on WhatsApp" button</p>
                <p className="text-xs text-slate-500">Shown on the success screen after a booking.</p>
              </div>
              <Switch checked={cfg.showWhatsappButton} onCheckedChange={(v) => update({ showWhatsappButton: v })} />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">"Prefer to talk directly?" card</p>
                <p className="text-xs text-slate-500">The dark sidebar card with phone, email and WhatsApp.</p>
              </div>
              <Switch checked={cfg.showDirectCard} onCheckedChange={(v) => update({ showDirectCard: v })} />
            </div>
          </div>
        </Section>

        {/* ── Topics ─────────────────────────────────────────────── */}
        <Section title="Topics — “What would you like to discuss?”" open={openSection === 1} onToggle={() => toggleSection(1)} hint="Add, rename, reorder or switch off the topic chips. Disabled topics disappear from the page.">
          <div className="space-y-2">
            {cfg.topics.map((t, i) => (
              <div key={t.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                <input className={inputCls} value={t.label} onChange={(e) => toggleRow('topics', i, { label: e.target.value })} placeholder="Topic label" />
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">{t.enabled ? 'On' : 'Off'}</span>
                  <Switch checked={t.enabled} onCheckedChange={(v) => toggleRow('topics', i, { enabled: v })} />
                </div>
                <RowControls index={i} count={cfg.topics.length} onMove={(idx, dir) => updateList('topics', move(cfg.topics, idx, dir))} onDelete={(idx) => updateList('topics', cfg.topics.filter((_, x) => x !== idx))} deleteDisabled={cfg.topics.length <= 1} />
              </div>
            ))}
          </div>
          <button type="button" onClick={() => updateList('topics', [...cfg.topics, { id: newId('topic'), label: 'New topic', enabled: true }])} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"><Plus className="h-4 w-4" /> Add topic</button>
        </Section>

        {/* ── Date & time ────────────────────────────────────────── */}
        <Section title="Date & time slots" open={openSection === 2} onToggle={() => toggleSection(2)} hint="The time chips visitors can pick, and how far ahead they may book.">
          <div className="space-y-2">
            {cfg.slots.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                <input className={inputCls} value={s.label} onChange={(e) => toggleRow('slots', i, { label: e.target.value })} placeholder="e.g. 9:30 AM" />
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">{s.enabled ? 'On' : 'Off'}</span>
                  <Switch checked={s.enabled} onCheckedChange={(v) => toggleRow('slots', i, { enabled: v })} />
                </div>
                <RowControls index={i} count={cfg.slots.length} onMove={(idx, dir) => updateList('slots', move(cfg.slots, idx, dir))} onDelete={(idx) => updateList('slots', cfg.slots.filter((_, x) => x !== idx))} deleteDisabled={cfg.slots.length <= 1} />
              </div>
            ))}
          </div>
          <button type="button" onClick={() => updateList('slots', [...cfg.slots, { id: newId('slot'), label: '9:00 AM', enabled: true }])} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"><Plus className="h-4 w-4" /> Add time slot</button>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Earliest booking — days from today">
              <input type="number" min="0" max="30" className={inputCls} value={cfg.dateRules.minNoticeDays} onChange={(e) => update({ dateRules: { ...cfg.dateRules, minNoticeDays: e.target.value } })} />
              <p className="mt-1 text-xs text-slate-400">0 = visitors can book for today. 1 = tomorrow is the earliest, and so on.</p>
            </Field>
            <Field label="Latest booking — days ahead">
              <input type="number" min="0" max="365" className={inputCls} value={cfg.dateRules.maxDaysAhead} onChange={(e) => update({ dateRules: { ...cfg.dateRules, maxDaysAhead: e.target.value } })} />
              <p className="mt-1 text-xs text-slate-400">0 = no limit. 30 = the calendar stops 30 days from today.</p>
            </Field>
          </div>
        </Section>

        {/* ── Your details fields ────────────────────────────────── */}
        <Section title="“Your details” fields" open={openSection === 3} onToggle={() => toggleSection(3)} hint="Rename, reorder, require or disable the form fields — or add your own. Name and Email always stay on (your replies go by email). Custom answers arrive inside the booking message in Inquiries.">
          <div className="space-y-3">
            {cfg.fields.map((f, i) => {
              const locked = LOCKED_FIELD_KEYS.includes(f.key);
              const isCore = CORE_FIELD_KEYS.includes(f.key);
              return (
                <div key={f.key} className="rounded-xl bg-slate-50 px-3 py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="min-w-[180px] flex-1">
                      <input className={inputCls} value={f.label} onChange={(e) => toggleRow('fields', i, { label: e.target.value })} placeholder="Field label" />
                    </div>
                    <div className="flex shrink-0 items-center gap-2" title={locked ? 'Name and Email are always required' : ''}>
                      <span className="text-xs font-medium text-slate-500">Required</span>
                      <Switch checked={f.required} disabled={locked} onCheckedChange={(v) => toggleRow('fields', i, { required: v })} />
                    </div>
                    <div className="flex shrink-0 items-center gap-2" title={locked ? 'Name and Email cannot be hidden' : ''}>
                      <span className="text-xs font-medium text-slate-500">Shown</span>
                      <Switch checked={f.enabled} disabled={locked} onCheckedChange={(v) => toggleRow('fields', i, { enabled: v })} />
                    </div>
                    <RowControls index={i} count={cfg.fields.length} onMove={(idx, dir) => updateList('fields', move(cfg.fields, idx, dir))} onDelete={(idx) => updateList('fields', cfg.fields.filter((_, x) => x !== idx))} deleteDisabled={isCore} />
                  </div>
                  <input className={`${inputCls} mt-2`} value={f.placeholder} onChange={(e) => toggleRow('fields', i, { placeholder: e.target.value })} placeholder="Placeholder text shown inside the empty field" />
                  {locked && <p className="mt-1.5 text-[11px] text-slate-400">Core field — always shown and required.</p>}
                  {!isCore && <p className="mt-1.5 text-[11px] text-slate-400">Custom field — its answer is added to the booking message.</p>}
                </div>
              );
            })}
          </div>
          <button type="button" onClick={() => updateList('fields', [...cfg.fields, { key: newId('custom'), label: 'New field', placeholder: '', required: false, enabled: true }])} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"><Plus className="h-4 w-4" /> Add a field</button>
        </Section>

        {/* ── Sidebar content ────────────────────────────────────── */}
        <Section title="Sidebar — steps & badges" open={openSection === 4} onToggle={() => toggleSection(4)} hint="The “What happens next” steps and the small tick badges under them.">
          <div className="space-y-3">
            {cfg.steps.map((s, i) => (
              <div key={s.id} className="rounded-xl bg-slate-50 px-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{i + 1}</span>
                  <input className={inputCls} value={s.title} onChange={(e) => toggleRow('steps', i, { title: e.target.value })} placeholder="Step title" />
                  <RowControls index={i} count={cfg.steps.length} onMove={(idx, dir) => updateList('steps', move(cfg.steps, idx, dir))} onDelete={(idx) => updateList('steps', cfg.steps.filter((_, x) => x !== idx))} deleteDisabled={cfg.steps.length <= 1} />
                </div>
                <textarea rows={2} className={`${inputCls} mt-2`} value={s.text} onChange={(e) => toggleRow('steps', i, { text: e.target.value })} placeholder="Step description" />
              </div>
            ))}
          </div>
          <button type="button" onClick={() => updateList('steps', [...cfg.steps, { id: newId('step'), title: 'New step', text: '' }])} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"><Plus className="h-4 w-4" /> Add step</button>
          <div className="mt-6">
            <label className={labelCls}>Tick badges (under the steps)</label>
            <div className="space-y-2">
              {cfg.badges.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input className={inputCls} value={b} onChange={(e) => { const badges = [...cfg.badges]; badges[i] = e.target.value; update({ badges }); }} />
                  <button type="button" title="Remove" onClick={() => update({ badges: cfg.badges.filter((_, x) => x !== i) })} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            {cfg.badges.length < 6 && (
              <button type="button" onClick={() => update({ badges: [...cfg.badges, ''] })} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"><Plus className="h-4 w-4" /> Add a badge</button>
            )}
          </div>
        </Section>

        {/* ── Sticky save bar ────────────────────────────────────── */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur lg:left-64">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <span className="text-sm text-slate-500">{dirty ? 'You have unsaved changes.' : 'All changes saved.'}</span>
            <div className="ms-auto flex items-center gap-2">
              <button type="button" onClick={() => { if (window.confirm('Restore the original booking page content? Your current edits on this screen will be replaced (nothing is saved until you press Save).')) { setCfg(JSON.parse(JSON.stringify(DEFAULT_BOOKING_CONFIG))); setDirty(true); } }} className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-slate-600 ring-1 ring-slate-300 transition hover:bg-slate-50"><RotateCcw className="h-4 w-4" /> Restore defaults</button>
              <button type="button" disabled={!dirty || saveMutation.isPending} onClick={() => saveMutation.mutate()} className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50">
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save booking settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

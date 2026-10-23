import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Calculator, ExternalLink, Loader2, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { dataLayer } from '../components/dataLayer';
import { DEFAULT_ESTIMATOR_CONFIG, ESTIMATOR_ICON_KEYS, normalizeEstimatorConfig } from '../config/estimatorConfig';
import { ESTIMATOR_ICONS } from '../utils/estimatorIcons';

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

function Section({ title, hint, children }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 md:p-6">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
      <div className="mt-4">{children}</div>
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

export default function AdminEstimator() {
  const queryClient = useQueryClient();
  const { data: remote, isLoading } = useQuery({
    queryKey: ['admin-estimator-config'],
    queryFn: () => dataLayer.estimator.getConfig(),
    retry: false,
  });
  const [cfg, setCfg] = useState(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => { if (remote && !cfg) setCfg(normalizeEstimatorConfig(remote)); }, [remote, cfg]);

  const update = (patch) => { setCfg((c) => ({ ...c, ...patch })); setDirty(true); };
  const updateList = (key, list) => update({ [key]: list });
  const setDefaultIn = (key, id) => update({ [key]: cfg[key].map((x) => ({ ...x, isDefault: x.id === id })) });

  const saveMutation = useMutation({
    mutationFn: () => dataLayer.estimator.saveConfig(cfg),
    onSuccess: () => {
      setDirty(false);
      queryClient.invalidateQueries({ queryKey: ['estimator-config'] });
      queryClient.invalidateQueries({ queryKey: ['admin-estimator-config'] });
      toast.success('Estimator updated — the live page now uses your settings');
    },
    onError: () => toast.error('Could not save. Please try again.'),
  });

  const summary = useMemo(() => cfg ? `${cfg.types.length} project types · ${cfg.sizes.length} sizes · ${cfg.features.length} features · ${cfg.speeds.length} speeds` : '', [cfg]);

  if (isLoading || !cfg) {
    return <div className="flex items-center justify-center py-24 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-28">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><Calculator className="h-6 w-6 text-blue-600" /> Project Cost Estimator</h1>
          <p className="mt-1 text-sm text-slate-500">Everything on the public estimator page is edited here — project types, prices, sizes, features, speeds and all the wording. {summary}.</p>
        </div>
        <a href="/ProjectCostEstimator" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-600 ring-1 ring-slate-200 transition hover:ring-blue-300">View live <ExternalLink className="h-3.5 w-3.5" /></a>
      </div>

      {/* ── Page texts ─────────────────────────────────────────── */}
      <Section title="Page texts" hint="The hero at the top of /ProjectCostEstimator and the line under the estimator.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Badge"><input className={inputCls} value={cfg.hero.badge} onChange={(e) => update({ hero: { ...cfg.hero, badge: e.target.value } })} /></Field>
          <Field label="Title"><input className={inputCls} value={cfg.hero.title} onChange={(e) => update({ hero: { ...cfg.hero, title: e.target.value } })} /></Field>
          <Field label="Subtitle" className="sm:col-span-2"><textarea rows={2} className={inputCls} value={cfg.hero.subtitle} onChange={(e) => update({ hero: { ...cfg.hero, subtitle: e.target.value } })} /></Field>
        </div>
        <div className="mt-4">
          <label className={labelCls}>Tick points (shown under the subtitle)</label>
          <div className="space-y-2">
            {cfg.hero.points.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <input className={inputCls} value={p} onChange={(e) => { const points = [...cfg.hero.points]; points[i] = e.target.value; update({ hero: { ...cfg.hero, points } }); }} />
                <button type="button" title="Remove" onClick={() => update({ hero: { ...cfg.hero, points: cfg.hero.points.filter((_, x) => x !== i) } })} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
          {cfg.hero.points.length < 6 && (
            <button type="button" onClick={() => update({ hero: { ...cfg.hero, points: [...cfg.hero.points, ''] } })} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"><Plus className="h-4 w-4" /> Add a point</button>
          )}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Footer — opening words"><input className={inputCls} value={cfg.hero.footerPrefix} onChange={(e) => update({ hero: { ...cfg.hero, footerPrefix: e.target.value } })} /></Field>
          <Field label="Footer — consultation link text"><input className={inputCls} value={cfg.hero.footerConsult} onChange={(e) => update({ hero: { ...cfg.hero, footerConsult: e.target.value } })} /></Field>
          <Field label="Footer — middle words"><input className={inputCls} value={cfg.hero.footerMid} onChange={(e) => update({ hero: { ...cfg.hero, footerMid: e.target.value } })} /></Field>
          <Field label="Footer — work link text"><input className={inputCls} value={cfg.hero.footerWork} onChange={(e) => update({ hero: { ...cfg.hero, footerWork: e.target.value } })} /></Field>
          <Field label="Footer — closing words"><input className={inputCls} value={cfg.hero.footerSuffix} onChange={(e) => update({ hero: { ...cfg.hero, footerSuffix: e.target.value } })} /></Field>
        </div>
      </Section>

      {/* ── Step & result texts ────────────────────────────────── */}
      <Section title="Step headings & result texts">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Step 1 heading"><input className={inputCls} value={cfg.texts.step1} onChange={(e) => update({ texts: { ...cfg.texts, step1: e.target.value } })} /></Field>
          <Field label="Step 2 heading"><input className={inputCls} value={cfg.texts.step2} onChange={(e) => update({ texts: { ...cfg.texts, step2: e.target.value } })} /></Field>
          <Field label="Step 3 heading"><input className={inputCls} value={cfg.texts.step3} onChange={(e) => update({ texts: { ...cfg.texts, step3: e.target.value } })} /></Field>
          <Field label="Size question"><input className={inputCls} value={cfg.texts.sizeQuestion} onChange={(e) => update({ texts: { ...cfg.texts, sizeQuestion: e.target.value } })} /></Field>
          <Field label="Features question"><input className={inputCls} value={cfg.texts.featuresQuestion} onChange={(e) => update({ texts: { ...cfg.texts, featuresQuestion: e.target.value } })} /></Field>
          <Field label="Speed question"><input className={inputCls} value={cfg.texts.speedQuestion} onChange={(e) => update({ texts: { ...cfg.texts, speedQuestion: e.target.value } })} /></Field>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Result heading"><input className={inputCls} value={cfg.result.heading} onChange={(e) => update({ result: { ...cfg.result, heading: e.target.value } })} /></Field>
          <Field label="“Sent” confirmation text"><input className={inputCls} value={cfg.result.sentText} onChange={(e) => update({ result: { ...cfg.result, sentText: e.target.value } })} /></Field>
          <Field label="Disclaimer under the estimate" className="sm:col-span-2"><textarea rows={2} className={inputCls} value={cfg.result.disclaimer} onChange={(e) => update({ result: { ...cfg.result, disclaimer: e.target.value } })} /></Field>
          <Field label="Email box heading"><input className={inputCls} value={cfg.result.emailHeading} onChange={(e) => update({ result: { ...cfg.result, emailHeading: e.target.value } })} /></Field>
          <Field label="Email button"><input className={inputCls} value={cfg.result.emailButton} onChange={(e) => update({ result: { ...cfg.result, emailButton: e.target.value } })} /></Field>
          <Field label="WhatsApp button"><input className={inputCls} value={cfg.result.whatsappButton} onChange={(e) => update({ result: { ...cfg.result, whatsappButton: e.target.value } })} /></Field>
          <Field label="Consultation button"><input className={inputCls} value={cfg.result.consultButton} onChange={(e) => update({ result: { ...cfg.result, consultButton: e.target.value } })} /></Field>
        </div>
      </Section>

      {/* ── Project types ──────────────────────────────────────── */}
      <Section title="Step 1 — Project types" hint="Each card on the first step. “From” price on the card = the base price (low). Monthly types (retainers) hide the features step.">
        <div className="space-y-3">
          {cfg.types.map((t, i) => {
            const Icon = ESTIMATOR_ICONS[t.icon];
            return (
              <div key={t.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 font-semibold text-slate-900">{Icon && <Icon className="h-5 w-5 text-blue-600" />}{t.label || 'Untitled type'}</p>
                  <RowControls index={i} count={cfg.types.length} onMove={(idx, dir) => updateList('types', move(cfg.types, idx, dir))} onDelete={(idx) => updateList('types', cfg.types.filter((_, x) => x !== idx))} deleteDisabled={cfg.types.length <= 1} />
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="Name"><input className={inputCls} value={t.label} onChange={(e) => updateList('types', cfg.types.map((x, xi) => xi === i ? { ...x, label: e.target.value } : x))} /></Field>
                  <Field label="Icon">
                    <select className={inputCls} value={t.icon} onChange={(e) => updateList('types', cfg.types.map((x, xi) => xi === i ? { ...x, icon: e.target.value } : x))}>
                      {ESTIMATOR_ICON_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </Field>
                  <Field label="Base price — low (AED)"><input type="number" min="0" step="500" className={inputCls} value={t.baseMin} onChange={(e) => updateList('types', cfg.types.map((x, xi) => xi === i ? { ...x, baseMin: e.target.value } : x))} /></Field>
                  <Field label="Base price — high (AED)"><input type="number" min="0" step="500" className={inputCls} value={t.baseMax} onChange={(e) => updateList('types', cfg.types.map((x, xi) => xi === i ? { ...x, baseMax: e.target.value } : x))} /></Field>
                  <Field label="Description (under the name)" className="sm:col-span-2"><input className={inputCls} value={t.blurb} onChange={(e) => updateList('types', cfg.types.map((x, xi) => xi === i ? { ...x, blurb: e.target.value } : x))} /></Field>
                  <Field label="Timeline — weeks low"><input type="number" min="1" className={inputCls} value={t.weeksMin} onChange={(e) => updateList('types', cfg.types.map((x, xi) => xi === i ? { ...x, weeksMin: e.target.value } : x))} /></Field>
                  <Field label="Timeline — weeks high"><input type="number" min="1" className={inputCls} value={t.weeksMax} onChange={(e) => updateList('types', cfg.types.map((x, xi) => xi === i ? { ...x, weeksMax: e.target.value } : x))} /></Field>
                </div>
                <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={t.monthly} onChange={(e) => updateList('types', cfg.types.map((x, xi) => xi === i ? { ...x, monthly: e.target.checked } : x))} className="h-4 w-4 rounded border-slate-300 accent-blue-600" />
                  Monthly retainer — price shown “/ month” and the features step is skipped for this type
                </label>
              </div>
            );
          })}
        </div>
        <button type="button" onClick={() => updateList('types', [...cfg.types, { id: newId('type'), label: 'New project type', blurb: '', icon: 'globe', baseMin: 10000, baseMax: 30000, weeksMin: 4, weeksMax: 8, monthly: false }])} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"><Plus className="h-4 w-4" /> Add project type</button>
      </Section>

      {/* ── Sizes ──────────────────────────────────────────────── */}
      <Section title="Step 2 — Sizes" hint="The size multiplies the base price. The two “weeks” factors stretch or shrink the timeline (1 = no change).">
        <div className="space-y-3">
          {cfg.sizes.map((s, i) => (
            <div key={s.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-900">
                  <input type="radio" name="default-size" checked={!!s.isDefault} onChange={() => setDefaultIn('sizes', s.id)} className="h-4 w-4 accent-blue-600" /> {s.label || 'Untitled size'} {s.isDefault && <span className="text-xs font-medium text-blue-600">(pre-selected)</span>}
                </label>
                <RowControls index={i} count={cfg.sizes.length} onMove={(idx, dir) => updateList('sizes', move(cfg.sizes, idx, dir))} onDelete={(idx) => updateList('sizes', cfg.sizes.filter((_, x) => x !== idx))} deleteDisabled={cfg.sizes.length <= 1} />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <Field label="Name"><input className={inputCls} value={s.label} onChange={(e) => updateList('sizes', cfg.sizes.map((x, xi) => xi === i ? { ...x, label: e.target.value } : x))} /></Field>
                <Field label="Description" className="sm:col-span-2"><input className={inputCls} value={s.blurb} onChange={(e) => updateList('sizes', cfg.sizes.map((x, xi) => xi === i ? { ...x, blurb: e.target.value } : x))} /></Field>
                <Field label="Price multiplier ×"><input type="number" min="0.1" step="0.1" className={inputCls} value={s.mult} onChange={(e) => updateList('sizes', cfg.sizes.map((x, xi) => xi === i ? { ...x, mult: e.target.value } : x))} /></Field>
                <Field label="Weeks × (low / high)">
                  <div className="flex gap-2">
                    <input type="number" min="0.1" step="0.05" className={inputCls} value={s.weeksMultLow} onChange={(e) => updateList('sizes', cfg.sizes.map((x, xi) => xi === i ? { ...x, weeksMultLow: e.target.value } : x))} />
                    <input type="number" min="0.1" step="0.05" className={inputCls} value={s.weeksMultHigh} onChange={(e) => updateList('sizes', cfg.sizes.map((x, xi) => xi === i ? { ...x, weeksMultHigh: e.target.value } : x))} />
                  </div>
                </Field>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => updateList('sizes', [...cfg.sizes, { id: newId('size'), label: 'New size', blurb: '', mult: 1, weeksMultLow: 1, weeksMultHigh: 1, isDefault: false }])} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"><Plus className="h-4 w-4" /> Add size</button>
      </Section>

      {/* ── Features ───────────────────────────────────────────── */}
      <Section title="Step 2 — Features" hint="Ticked features add their price range on top. Delete them all and the features question disappears from the estimator.">
        <div className="space-y-2">
          {cfg.features.map((f, i) => (
            <div key={f.id} className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 p-3">
              <Field label="Feature" className="min-w-52 flex-1"><input className={inputCls} value={f.label} onChange={(e) => updateList('features', cfg.features.map((x, xi) => xi === i ? { ...x, label: e.target.value } : x))} /></Field>
              <Field label="Adds — low (AED)"><input type="number" min="0" step="500" className={`${inputCls} w-32`} value={f.addMin} onChange={(e) => updateList('features', cfg.features.map((x, xi) => xi === i ? { ...x, addMin: e.target.value } : x))} /></Field>
              <Field label="Adds — high (AED)"><input type="number" min="0" step="500" className={`${inputCls} w-32`} value={f.addMax} onChange={(e) => updateList('features', cfg.features.map((x, xi) => xi === i ? { ...x, addMax: e.target.value } : x))} /></Field>
              <RowControls index={i} count={cfg.features.length} onMove={(idx, dir) => updateList('features', move(cfg.features, idx, dir))} onDelete={(idx) => updateList('features', cfg.features.filter((_, x) => x !== idx))} deleteDisabled={false} />
            </div>
          ))}
        </div>
        <button type="button" onClick={() => updateList('features', [...cfg.features, { id: newId('feature'), label: 'New feature', addMin: 3000, addMax: 8000 }])} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"><Plus className="h-4 w-4" /> Add feature</button>
      </Section>

      {/* ── Speeds ─────────────────────────────────────────────── */}
      <Section title="Step 2 — Speed" hint="The speed multiplies the final price (below 1 = discount for flexible timing, above 1 = rush premium).">
        <div className="space-y-3">
          {cfg.speeds.map((s, i) => (
            <div key={s.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-900">
                  <input type="radio" name="default-speed" checked={!!s.isDefault} onChange={() => setDefaultIn('speeds', s.id)} className="h-4 w-4 accent-blue-600" /> {s.label || 'Untitled speed'} {s.isDefault && <span className="text-xs font-medium text-blue-600">(pre-selected)</span>}
                </label>
                <RowControls index={i} count={cfg.speeds.length} onMove={(idx, dir) => updateList('speeds', move(cfg.speeds, idx, dir))} onDelete={(idx) => updateList('speeds', cfg.speeds.filter((_, x) => x !== idx))} deleteDisabled={cfg.speeds.length <= 1} />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Field label="Name"><input className={inputCls} value={s.label} onChange={(e) => updateList('speeds', cfg.speeds.map((x, xi) => xi === i ? { ...x, label: e.target.value } : x))} /></Field>
                <Field label="Description"><input className={inputCls} value={s.blurb} onChange={(e) => updateList('speeds', cfg.speeds.map((x, xi) => xi === i ? { ...x, blurb: e.target.value } : x))} /></Field>
                <Field label="Price multiplier ×"><input type="number" min="0.1" step="0.05" className={inputCls} value={s.mult} onChange={(e) => updateList('speeds', cfg.speeds.map((x, xi) => xi === i ? { ...x, mult: e.target.value } : x))} /></Field>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => updateList('speeds', [...cfg.speeds, { id: newId('speed'), label: 'New speed', blurb: '', mult: 1, isDefault: false }])} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"><Plus className="h-4 w-4" /> Add speed</button>
      </Section>

      {/* ── Sticky save bar ────────────────────────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <span className="text-sm text-slate-500">{dirty ? 'You have unsaved changes.' : 'All changes saved.'}</span>
          <div className="ms-auto flex items-center gap-2">
            <button type="button" onClick={() => { if (window.confirm('Restore the original estimator content and prices? Your current edits on this screen will be replaced (nothing is saved until you press Save).')) { setCfg(JSON.parse(JSON.stringify(DEFAULT_ESTIMATOR_CONFIG))); setDirty(true); } }} className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-slate-600 ring-1 ring-slate-300 transition hover:bg-slate-50"><RotateCcw className="h-4 w-4" /> Restore defaults</button>
            <button type="button" disabled={!dirty || saveMutation.isPending} onClick={() => saveMutation.mutate()} className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50">
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save estimator settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

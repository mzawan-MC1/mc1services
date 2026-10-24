import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Loader2, Mail, Phone, Building2, Trash2, Eye, CalendarCheck, Calculator,
  Sparkles, MessageCircle, ListTodo, Send, Clock, Tag, Banknote, CalendarDays,
  Search, ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AdminLayout from '../components/admin/AdminLayout';

const serviceLabels = {
  web_development: 'Web Development',
  app_development: 'App Development',
  custom_software: 'Custom Software',
  digital_marketing: 'Digital Marketing',
  automation: 'Business Automation',
  production: 'Production & Creative Services',
  branding: 'Branding & Design',
  seo: 'SEO & SEM',
  social_media: 'Social Media Marketing',
  it_services: 'IT Services & Consulting',
  it_consulting: 'IT Services & Consulting',
  other: 'Other'
};

const SOURCE_META = {
  booking: { label: 'Booking', badge: 'bg-violet-100 text-violet-700', Icon: CalendarCheck },
  estimator: { label: 'Cost Estimate', badge: 'bg-cyan-100 text-cyan-700', Icon: Calculator },
  contact: { label: 'Contact Form', badge: 'bg-blue-100 text-blue-700', Icon: Mail },
  assistant: { label: 'Assistant', badge: 'bg-teal-100 text-teal-700', Icon: Sparkles },
};

// Rows saved before the source column existed are recognised by their
// message text; new rows carry the source directly.
function detectSource(contact) {
  if (contact.source && SOURCE_META[contact.source]) return contact.source;
  const message = contact.message || '';
  if (message.startsWith('Consultation booking request')) return 'booking';
  if (message.startsWith('A visitor used the Project Cost Estimator')) return 'estimator';
  if (message.startsWith('Lead from the website assistant')) return 'assistant';
  return 'contact';
}

function parseBooking(message = '') {
  const grab = (pattern) => message.match(pattern)?.[1]?.trim() || '';
  return {
    topic: grab(/Topic:\s*(.+)/),
    date: grab(/Preferred date:\s*(.+)/),
    isoDate: grab(/\((\d{4}-\d{2}-\d{2})\)/),
    time: grab(/Preferred time:\s*(.+?)(?:\s*\(|$)/),
  };
}

function parseEstimate(message = '') {
  const grab = (pattern) => message.match(pattern)?.[1]?.trim() || '';
  return {
    project: grab(/Project:\s*(.+)/),
    estimate: grab(/Indicative estimate:\s*(.+)/),
    timeline: grab(/Indicative timeline:\s*(.+)/),
  };
}

// wa.me wants international format: turn a UAE local number into 971…
function waNumber(phone) {
  let d = String(phone || '').replace(/\D/g, '');
  if (!d) return null;
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0')) d = '971' + d.slice(1);
  if (d.length === 9 && d.startsWith('5')) d = '971' + d;
  return d;
}

const statusColors = {
  new: 'bg-orange-100 text-orange-700',
  contacted: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  quote_sent: 'bg-indigo-100 text-indigo-700',
  closed: 'bg-green-100 text-green-700'
};

function statusOptionsFor(source, current) {
  const options = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'in_progress', label: 'In Progress' },
  ];
  if (source === 'booking') options.push({ value: 'confirmed', label: 'Confirmed' });
  if (source === 'estimator') options.push({ value: 'quote_sent', label: 'Quote Sent' });
  options.push({ value: 'closed', label: 'Closed' });
  if (current && !options.some((o) => o.value === current)) {
    options.push({ value: current, label: current.replace(/_/g, ' ') });
  }
  return options;
}

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'booking', label: 'Bookings' },
  { key: 'estimator', label: 'Cost Estimates' },
  { key: 'contact', label: 'Contact Form' },
  { key: 'assistant', label: 'Assistant' },
];

const STATUS_FILTERS = [
  { key: 'all', label: 'All Statuses' },
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'quote_sent', label: 'Quote Sent' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'closed', label: 'Closed' },
];

export default function AdminContacts() {
  const queryClient = useQueryClient();
  const [selectedContact, setSelectedContact] = useState(null);
  const [tab, setTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOldest, setSortOldest] = useState(false);

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['admin-contacts'],
    queryFn: () => dataLayer.contactSubmissions.getAll()
  });

  const counts = useMemo(() => {
    const map = { all: contacts.length, booking: 0, estimator: 0, contact: 0, assistant: 0 };
    contacts.forEach((c) => { map[detectSource(c)] += 1; });
    return map;
  }, [contacts]);

  const bySource = useMemo(
    () => (tab === 'all' ? contacts : contacts.filter((c) => detectSource(c) === tab)),
    [contacts, tab]
  );

  const statusCounts = useMemo(() => {
    const map = { all: bySource.length };
    bySource.forEach((c) => { const s = c.status || 'new'; map[s] = (map[s] || 0) + 1; });
    return map;
  }, [bySource]);

  const visible = useMemo(() => {
    let list = bySource;
    if (statusFilter !== 'all') list = list.filter((c) => (c.status || 'new') === statusFilter);
    const q = searchQuery.trim().toLowerCase();
    if (q) list = list.filter((c) => [c.name, c.email, c.company].some((v) => (v || '').toLowerCase().includes(q)));
    return [...list].sort((a, b) => {
      if (statusFilter === 'all') {
        // Closed inquiries sink to the bottom of the combined view.
        const ca = a.status === 'closed' ? 1 : 0;
        const cb = b.status === 'closed' ? 1 : 0;
        if (ca !== cb) return ca - cb;
      }
      const ta = new Date(a.created_at || 0).getTime();
      const tb = new Date(b.created_at || 0).getTime();
      return sortOldest ? ta - tb : tb - ta;
    });
  }, [bySource, statusFilter, searchQuery, sortOldest]);

  const invalidate = () => queryClient.invalidateQueries(['admin-contacts']);

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => dataLayer.contactSubmissions.update(id, { status }),
    onSuccess: invalidate
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dataLayer.contactSubmissions.delete(id),
    onSuccess: invalidate
  });

  const convertMutation = useMutation({
    mutationFn: async (contact) => {
      const source = detectSource(contact);
      const bk = source === 'booking' ? parseBooking(contact.message) : null;
      const title = source === 'booking'
        ? `Consultation: ${bk?.topic || serviceLabels[contact.service_interest] || 'Booking'} — ${contact.name}`
        : source === 'estimator'
          ? `Estimate follow-up — ${contact.name}`
          : `Inquiry follow-up — ${contact.name}`;
      const description = [
        `Converted from a ${SOURCE_META[source].label} inquiry (Admin → Inquiries).`,
        `Name: ${contact.name}`,
        `Email: ${contact.email}`,
        contact.phone ? `Phone: ${contact.phone}` : null,
        contact.company ? `Company: ${contact.company}` : null,
        '',
        contact.message || '',
      ].filter((line) => line !== null).join('\n');
      const created = await dataLayer.tasks.create({
        title, description, status: 'pending',
        priority: source === 'booking' ? 'high' : 'normal',
        due_date: bk?.isoDate || null,
      });
      await dataLayer.contactSubmissions.update(contact.id, {
        converted_task_id: created.id,
        status: contact.status === 'new' ? 'in_progress' : contact.status,
      });
      return created;
    },
    onSuccess: () => { toast.success('Task created — find it in Tasks'); invalidate(); },
    onError: (e) => toast.error(e.message || 'Could not create the task')
  });

  const confirmMutation = useMutation({
    mutationFn: async (contact) => {
      const result = await dataLayer.email.confirmBooking(contact.id);
      await dataLayer.contactSubmissions.update(contact.id, { status: 'confirmed' });
      return result;
    },
    onSuccess: (data) => {
      toast.success(data?.calendar === 'created'
        ? 'Booking confirmed — visitor emailed and event added to Google Calendar'
        : 'Booking confirmed — the visitor has been emailed');
      invalidate();
    },
    onError: (e) => toast.error(e.message || 'Confirmation email failed')
  });

  const ackMutation = useMutation({
    mutationFn: (contact) => dataLayer.email.resendAck(contact.id),
    onSuccess: () => toast.success('Acknowledgement email sent'),
    onError: (e) => toast.error(e.message || 'Could not send the acknowledgement')
  });

  // Split a stored message into tidy label → value rows (booking/estimator
  // messages are "Key: value" lines) plus any free-text paragraphs, so the
  // details popup reads organized instead of one raw text block.
  const parseMessageLines = (message) => {
    const rows = [];
    const paras = [];
    const lines = String(message || '').split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      if (i === 0 && !line.includes(':')) continue; // summary header line
      const kv = line.match(/^([^:]{2,40}):\s*(.*)$/);
      if (kv) {
        let value = kv[2].trim();
        if (!value && i + 1 < lines.length) { value = lines[i + 1].trim(); i++; } // "Notes:" style
        rows.push({ label: kv[1].trim(), value });
      } else {
        paras.push(line);
      }
    }
    return { rows, paras };
  };

  const renderDetailChips = (contact, source, inline = false) => {
    let chips = null;
    if (source === 'booking') {
      const bk = parseBooking(contact.message);
      chips = (
        <>
          {bk.date && <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 font-medium text-violet-700"><CalendarDays className="h-3.5 w-3.5" />{bk.date}</span>}
          {bk.time && <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 font-medium text-violet-700"><Clock className="h-3.5 w-3.5" />{bk.time} GST</span>}
          {bk.topic && <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 font-medium text-violet-700"><Tag className="h-3.5 w-3.5" />{bk.topic}</span>}
          {contact.calendar_event_id && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700"><CalendarCheck className="h-3.5 w-3.5" />On Google Calendar</span>}
        </>
      );
    } else if (source === 'estimator') {
      const est = parseEstimate(contact.message);
      chips = (
        <>
          {est.estimate && <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1 font-medium text-cyan-700"><Banknote className="h-3.5 w-3.5" />{est.estimate}</span>}
          {est.timeline && <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1 font-medium text-cyan-700"><Clock className="h-3.5 w-3.5" />{est.timeline}</span>}
          {est.project && <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1 font-medium text-cyan-700"><Tag className="h-3.5 w-3.5" />{est.project}</span>}
        </>
      );
    }
    if (!chips) return null;
    if (inline) return <span className="inline-flex flex-wrap items-center gap-2 text-xs">{chips}</span>;
    return <div className="mt-3 flex flex-wrap gap-2 text-xs">{chips}</div>;
  };

  // One calm system: contact actions are soft pills, and each card gets
  // exactly ONE solid primary — Confirm booking for an open booking,
  // otherwise Convert to task. Everything else stays quiet.
  const renderActions = (contact, source) => {
    const wa = waNumber(contact.phone);
    // A closed inquiry is done: no workflow buttons, only contact channels
    // (and the Task created link, if it was converted before closing).
    const isClosed = contact.status === 'closed';
    const showConfirm = source === 'booking' && contact.status !== 'confirmed' && !isClosed;
    const soft = 'inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold ring-1 transition';
    return (
      <div className="flex flex-wrap items-center gap-2">
        {wa && (
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className={`${soft} bg-green-50 text-green-700 ring-green-200 hover:bg-green-100`}>
            <MessageCircle className="h-3.5 w-3.5 text-green-600" /> WhatsApp
          </a>
        )}
        {contact.phone && (
          <a href={`tel:${contact.phone}`} className={`${soft} bg-white text-slate-600 ring-slate-200 hover:bg-slate-50`}>
            <Phone className="h-3.5 w-3.5" /> Call
          </a>
        )}
        <a href={`mailto:${contact.email}`} className={`${soft} bg-white text-slate-600 ring-slate-200 hover:bg-slate-50`}>
          <Mail className="h-3.5 w-3.5" /> Email
        </a>
        {showConfirm && (
          <button type="button" onClick={() => confirmMutation.mutate(contact)} disabled={confirmMutation.isPending} className={`${soft} bg-emerald-600 text-white ring-transparent hover:bg-emerald-700 disabled:opacity-60`}>
            <CalendarCheck className="h-3.5 w-3.5" /> Confirm booking
          </button>
        )}
        {contact.converted_task_id ? (
          <Link to="/admin/tasks" className={`${soft} bg-blue-50 text-blue-700 ring-blue-200 hover:bg-blue-100`}>
            <ListTodo className="h-3.5 w-3.5" /> Task created
          </Link>
        ) : !isClosed && (
          <button type="button" onClick={() => convertMutation.mutate(contact)} disabled={convertMutation.isPending} className={`${soft} disabled:opacity-60 ${showConfirm ? 'bg-blue-50 text-blue-700 ring-blue-200 hover:bg-blue-100' : 'bg-blue-600 text-white ring-transparent hover:bg-blue-700'}`}>
            <ListTodo className="h-3.5 w-3.5" /> Convert to task
          </button>
        )}
      </div>
    );
  };

  return (
    <AdminLayout currentPage="AdminContacts">
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Inquiries</h1>
          <p className="mt-1 text-slate-600">Every lead from the website — bookings, estimates, contact form and assistant — in one task desk.</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === key ? 'bg-slate-900 text-white shadow' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}
            >
              {label} <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[11px] ${tab === key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{counts[key]}</span>
            </button>
          ))}
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.filter((f) => f.key === 'all' || (statusCounts[f.key] || 0) > 0 || statusFilter === f.key).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${statusFilter === key ? 'bg-blue-600 text-white shadow' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}
            >
              {label} <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] ${statusFilter === key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{statusCounts[key] || 0}</span>
            </button>
          ))}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, company"
                className="w-60 bg-white pl-9"
              />
            </div>
            <Button type="button" variant="outline" onClick={() => setSortOldest((v) => !v)} className="bg-white">
              <ArrowUpDown className="mr-2 h-4 w-4" /> {sortOldest ? 'Oldest first' : 'Newest first'}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : visible.length === 0 ? (
          <Card className="py-12 text-center">
            <CardContent>
              <p className="text-slate-500">{contacts.length === 0 ? 'No inquiries yet' : 'No inquiries match this view — try another tab, status, or search.'}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {visible.map((contact) => {
              const source = detectSource(contact);
              const meta = SOURCE_META[source];
              return (
                <Card key={contact.id} className={contact.status === 'closed' ? 'bg-slate-50/70 opacity-75' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{contact.name}</h3>
                          <Badge className={statusColors[contact.status || 'new']}>
                            {(contact.status || 'new').replace(/_/g, ' ')}
                          </Badge>
                          <Badge className={meta.badge}>
                            <meta.Icon className="mr-1 h-3 w-3" />{meta.label}
                          </Badge>
                          {contact.service_interest && source !== 'booking' && source !== 'estimator' && (
                            <Badge variant="outline">
                              {serviceLabels[contact.service_interest] || contact.service_interest}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                          <a href={`mailto:${contact.email}`} className="flex items-center gap-1 hover:text-blue-600">
                            <Mail className="h-4 w-4" />{contact.email}
                          </a>
                          {contact.phone && (
                            <a href={`tel:${contact.phone}`} className="flex items-center gap-1 hover:text-blue-600">
                              <Phone className="h-4 w-4" />{contact.phone}
                            </a>
                          )}
                          {contact.company && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />{contact.company}
                            </span>
                          )}
                          {renderDetailChips(contact, source, true)}
                        </div>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-slate-100 pt-3">
                          {renderActions(contact, source)}
                          <p className="text-xs text-slate-400">
                            {contact.created_at && <>Submitted {format(new Date(contact.created_at), 'MMM d, yyyy · h:mm a')}</>}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Select
                          value={contact.status || 'new'}
                          onValueChange={(status) => updateMutation.mutate({ id: contact.id, status })}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptionsFor(source, contact.status).map((o) => (
                              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedContact(contact)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this inquiry?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-red-600" onClick={() => deleteMutation.mutate(contact.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
          <DialogContent className="max-h-[90vh] w-[92vw] max-w-[1200px] overflow-y-auto sm:w-[80vw]">
            <DialogHeader>
              <DialogTitle>Inquiry Details</DialogTitle>
            </DialogHeader>
            {selectedContact && (() => {
              const source = detectSource(selectedContact);
              const meta = SOURCE_META[source];
              const parsed = parseMessageLines(selectedContact.message);
              const field = (label, value, isLink = false) => (
                <div key={label}>
                  <p className="text-xs text-slate-400">{label}</p>
                  {isLink
                    ? <a href={`mailto:${value}`} className="font-semibold text-blue-600">{value}</a>
                    : <p className="font-semibold text-slate-900">{value}</p>}
                </div>
              );
              return (
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className={meta.badge}><meta.Icon className="mr-1 h-3 w-3" />{meta.label}</Badge>
                    <Badge className={statusColors[selectedContact.status || 'new']}>
                      {(selectedContact.status || 'new').replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <div className="mt-4 grid gap-5 md:grid-cols-[1fr_1.25fr]">
                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                      <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Contact</p>
                      <div className="grid gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
                        {field('Name', selectedContact.name)}
                        {selectedContact.company && field('Company', selectedContact.company)}
                        {field('Email', selectedContact.email, true)}
                        {selectedContact.phone && field('Phone', selectedContact.phone)}
                        {selectedContact.service_interest && field('Service interest', serviceLabels[selectedContact.service_interest] || selectedContact.service_interest)}
                        {selectedContact.created_at && field('Submitted', format(new Date(selectedContact.created_at), 'MMM d, yyyy · h:mm a'))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                      <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Request details</p>
                      {renderDetailChips(selectedContact, source)}
                      {parsed.rows.length > 0 && (
                        <div className="divide-y divide-dashed divide-slate-200">
                          {parsed.rows.map((r, idx) => (
                            <div key={idx} className="flex gap-4 py-1.5 text-sm">
                              <span className="w-32 shrink-0 text-slate-500">{r.label}</span>
                              <span className="font-medium text-slate-900">{r.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {parsed.paras.map((p, idx) => (
                        <p key={idx} className="mt-2 whitespace-pre-wrap text-sm font-medium text-slate-900">{p}</p>
                      ))}
                      {parsed.rows.length === 0 && parsed.paras.length === 0 && (
                        <p className="whitespace-pre-wrap text-sm font-medium text-slate-900">{selectedContact.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    {renderActions(selectedContact, source)}
                    <button
                      type="button"
                      onClick={() => ackMutation.mutate(selectedContact)}
                      disabled={ackMutation.isPending}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-60"
                    >
                      <Send className="h-3.5 w-3.5" /> Resend acknowledgement email
                    </button>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { toast } from 'sonner';
import {
  Loader2, Mail, Settings2, FileText, ScrollText, Send, Save, AlertTriangle, CheckCircle2, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import AdminLayout from '../components/admin/AdminLayout';

const PLACEHOLDERS = [
  ['{name}', 'Visitor name'], ['{email}', 'Visitor email'], ['{phone}', 'Visitor phone'],
  ['{company}', 'Visitor company'], ['{service}', 'Service interest'], ['{source_label}', 'Where it came from'],
  ['{message}', 'The full submitted message'], ['{topic}', 'Booking topic'], ['{date}', 'Booking date'],
  ['{time}', 'Booking time'], ['{estimate}', 'Estimate range'], ['{timeline}', 'Estimate timeline'],
  ['{project}', 'Estimate project'], ['{admin_url}', 'Link to Admin → Inquiries'],
];

function SetupNotice() {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="flex items-start gap-3 p-5">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div className="text-sm text-amber-900">
          <p className="font-semibold">The email tables are not set up yet.</p>
          <p className="mt-1">Run the one-time SQL file <span className="font-mono font-semibold">inquiries-email-setup.sql</span> in Supabase → SQL Editor, then reload this page. It creates the settings, templates and log tables (admin-only) and adds the inquiry source column.</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SettingsTab() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['email-settings'],
    queryFn: () => dataLayer.email.getSettings()
  });
  const [form, setForm] = useState(null);
  const [testTo, setTestTo] = useState('');

  useEffect(() => {
    if (settings) {
      setForm({
        smtp_host: settings.smtp_host || '',
        smtp_port: settings.smtp_port ?? 465,
        smtp_secure: settings.smtp_secure !== false,
        smtp_user: settings.smtp_user || '',
        smtp_password: settings.smtp_password || '',
        from_name: settings.from_name || 'MCS Consultancy',
        from_email: settings.from_email || '',
        notify_email: settings.notify_email || '',
        notify_admin: settings.notify_admin !== false,
        ack_visitor: settings.ack_visitor !== false,
      });
      setTestTo(settings.notify_email || settings.from_email || '');
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: () => dataLayer.email.saveSettings({ ...form, smtp_port: Number(form.smtp_port) || 465 }),
    onSuccess: () => { toast.success('Email settings saved'); queryClient.invalidateQueries(['email-settings']); },
    onError: (e) => toast.error(e.message || 'Could not save settings')
  });

  const testMutation = useMutation({
    mutationFn: () => dataLayer.email.sendTest(testTo.trim() || undefined),
    onSuccess: (data) => toast.success(`Test email sent to ${data?.to || testTo}`),
    onError: (e) => toast.error(e.message || 'Test email failed')
  });

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-blue-600" /></div>;
  if (!settings || !form) return <SetupNotice />;

  const field = (label, key, props = {}) => (
    <div>
      <Label>{label}</Label>
      <Input className="mt-1" value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} {...props} />
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">SMTP connection</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
            {field('SMTP host', 'smtp_host', { placeholder: 'e.g. mail.mc1services.com or smtp.gmail.com' })}
            {field('Port', 'smtp_port', { type: 'number' })}
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">SSL / TLS (secure connection)</p>
              <p className="text-xs text-slate-500">On for port 465. For port 587 (STARTTLS) switch this off.</p>
            </div>
            <Switch checked={form.smtp_secure} onCheckedChange={(v) => setForm((f) => ({ ...f, smtp_secure: v }))} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {field('SMTP username', 'smtp_user', { placeholder: 'Usually your full email address' })}
            {field('SMTP password', 'smtp_password', { type: 'password', placeholder: 'Mailbox password or app password' })}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {field('From name', 'from_name')}
            {field('From email', 'from_email', { placeholder: 'info@mc1services.com' })}
          </div>
          <p className="text-xs text-slate-500">The password is stored in an admin-only table that the public website cannot read, and mail is sent from the server — never from the browser.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {field('Notification email (where new-inquiry alerts go)', 'notify_email', { placeholder: 'Leave empty to use the From email' })}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">Email me on every new inquiry</p>
              <p className="text-xs text-slate-500">Bookings, estimates, contact form and assistant leads.</p>
            </div>
            <Switch checked={form.notify_admin} onCheckedChange={(v) => setForm((f) => ({ ...f, notify_admin: v }))} />
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">Send visitors an acknowledgement</p>
              <p className="text-xs text-slate-500">The “thank you, we have received your details” email, per source.</p>
            </div>
            <Switch checked={form.ack_visitor} onCheckedChange={(v) => setForm((f) => ({ ...f, ack_visitor: v }))} />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-blue-600 text-white hover:bg-blue-700">
          {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save settings
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Send a test email</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Input value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="Send test to…" className="sm:max-w-sm" />
          <Button variant="outline" onClick={() => testMutation.mutate()} disabled={testMutation.isPending}>
            {testMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send test
          </Button>
          <p className="self-center text-xs text-slate-500">Save your settings first, then test.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function TemplatesTab() {
  const queryClient = useQueryClient();
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: () => dataLayer.email.getTemplates()
  });
  const [selectedKey, setSelectedKey] = useState(null);
  const [draft, setDraft] = useState(null);

  const selected = useMemo(
    () => templates.find((t) => t.key === selectedKey) || templates[0],
    [templates, selectedKey]
  );

  useEffect(() => {
    if (selected) setDraft({ subject: selected.subject, body: selected.body, enabled: selected.enabled !== false });
  }, [selected?.key]);

  const saveMutation = useMutation({
    mutationFn: () => dataLayer.email.updateTemplate(selected.key, draft),
    onSuccess: () => { toast.success('Template saved'); queryClient.invalidateQueries(['email-templates']); },
    onError: (e) => toast.error(e.message || 'Could not save the template')
  });

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-blue-600" /></div>;
  if (templates.length === 0) return <SetupNotice />;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[300px_1fr]">
      <div className="space-y-2">
        {templates.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setSelectedKey(t.key)}
            className={`w-full rounded-xl border px-4 py-3 text-left transition ${selected?.key === t.key ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 bg-white hover:border-blue-300'}`}
          >
            <p className="flex items-center justify-between text-sm font-semibold text-slate-900">
              {t.name}
              {t.enabled === false && <Badge variant="outline" className="text-[10px]">off</Badge>}
            </p>
            <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{t.description}</p>
          </button>
        ))}
        <Card className="bg-slate-50">
          <CardContent className="p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Placeholders you can use</p>
            <div className="space-y-1 text-xs text-slate-600">
              {PLACEHOLDERS.map(([token, label]) => (
                <p key={token}><span className="font-mono font-semibold text-blue-700">{token}</span> — {label}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {selected && draft && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              {selected.name}
              <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                Enabled
                <Switch checked={draft.enabled} onCheckedChange={(v) => setDraft((d) => ({ ...d, enabled: v }))} />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Subject</Label>
              <Input className="mt-1" value={draft.subject} onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))} />
            </div>
            <div>
              <Label>Body</Label>
              <Textarea className="mt-1 font-mono text-[13px] leading-relaxed" rows={16} value={draft.body} onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))} />
              <p className="mt-1 text-xs text-slate-500">Plain text — line breaks are kept, and the email is also sent as a simple formatted HTML version automatically.</p>
            </div>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-blue-600 text-white hover:bg-blue-700">
              {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LogTab() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['email-logs'],
    queryFn: () => dataLayer.email.getLogs()
  });

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-blue-600" /></div>;
  if (logs.length === 0) {
    return (
      <Card className="py-12 text-center">
        <CardContent>
          <p className="text-slate-500">No emails sent yet. Once inquiries arrive (or you send a test), every send is recorded here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3 font-semibold">When</th>
                <th className="px-4 py-3 font-semibold">To</th>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold">Template</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 100).map((log) => (
                <tr key={log.id} className="border-b last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{log.created_at && format(new Date(log.created_at), 'MMM d, h:mm a')}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{log.to_email}</td>
                  <td className="max-w-[320px] truncate px-4 py-3 text-slate-600">{log.subject}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className="font-mono text-[11px]">{log.template_key}</Badge></td>
                  <td className="px-4 py-3">
                    {log.status === 'sent' ? (
                      <span className="inline-flex items-center gap-1 font-medium text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Sent</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-medium text-red-600" title={log.error || ''}><XCircle className="h-4 w-4" /> Failed</span>
                    )}
                    {log.status !== 'sent' && log.error && <p className="mt-0.5 max-w-[260px] truncate text-xs text-red-500">{log.error}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

const TABS = [
  { key: 'settings', label: 'Settings', Icon: Settings2 },
  { key: 'templates', label: 'Templates', Icon: FileText },
  { key: 'log', label: 'Sent Log', Icon: ScrollText },
];

export default function AdminEmail() {
  const [tab, setTab] = useState('settings');
  return (
    <AdminLayout currentPage="AdminEmail">
      <div>
        <div className="mb-6">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><Mail className="h-6 w-6 text-blue-600" /> Email</h1>
          <p className="mt-1 text-slate-600">Connect your mailbox once — the website then emails you on every inquiry and automatically thanks every visitor.</p>
        </div>
        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${tab === key ? 'bg-slate-900 text-white shadow' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
        {tab === 'settings' && <SettingsTab />}
        {tab === 'templates' && <TemplatesTab />}
        {tab === 'log' && <LogTab />}
      </div>
    </AdminLayout>
  );
}

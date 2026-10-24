import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataLayer } from '../components/dataLayer';
import { toast } from 'sonner';
import {
  Loader2, Mail, Settings2, FileText, ScrollText, Send, Save, AlertTriangle, CheckCircle2, XCircle, CalendarDays, Unlink
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

function CalendarTab() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['email-settings'],
    queryFn: () => dataLayer.email.getSettings()
  });
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (settings) {
      setForm({
        google_client_id: settings.google_client_id || '',
        google_client_secret: settings.google_client_secret || '',
        meeting_minutes: settings.meeting_minutes ?? 30,
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: () => dataLayer.email.saveSettings({
      google_client_id: form.google_client_id.trim(),
      google_client_secret: form.google_client_secret.trim(),
      meeting_minutes: Number(form.meeting_minutes) || 30,
    }),
    onSuccess: () => { toast.success('Google Calendar settings saved'); queryClient.invalidateQueries(['email-settings']); },
    onError: (e) => toast.error(e.message || 'Could not save')
  });

  const disconnectMutation = useMutation({
    mutationFn: () => dataLayer.email.disconnectGoogle(),
    onSuccess: () => { toast.success('Google Calendar disconnected'); queryClient.invalidateQueries(['email-settings']); },
    onError: (e) => toast.error(e.message || 'Could not disconnect')
  });

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-blue-600" /></div>;
  if (!settings || !form) return <SetupNotice />;

  const needsSql = settings.google_client_id === undefined;
  if (needsSql) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="flex items-start gap-3 p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold">One database step is needed first.</p>
            <p className="mt-1">Run the one-time SQL file <span className="font-mono font-semibold">google-calendar-setup.sql</span> in Supabase → SQL Editor, then reload this page. It adds the Google Calendar fields (kept in the same admin-only settings row as your SMTP password).</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const connected = !!settings.google_refresh_token;
  const savedCreds = !!(settings.google_client_id && settings.google_client_secret);
  const dirty = form.google_client_id.trim() !== (settings.google_client_id || '')
    || form.google_client_secret.trim() !== (settings.google_client_secret || '')
    || Number(form.meeting_minutes) !== (settings.meeting_minutes ?? 30);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const redirectUri = `${supabaseUrl}/functions/v1/google-calendar-callback`;
  const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
    client_id: settings.google_client_id || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email',
    access_type: 'offline',
    prompt: 'consent',
  }).toString();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Connection</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            {connected ? (
              <p className="text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Connected</span>
                {settings.google_connected_email && <> as <span className="font-medium">{settings.google_connected_email}</span></>}
                {' '}— every booking you confirm now creates a calendar event (with a Google Meet link) and invites the visitor.
              </p>
            ) : (
              <p className="text-sm text-slate-600">Not connected yet. Save your Google credentials below, then click Connect and sign in once.</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {connected ? (
              <Button type="button" variant="outline" onClick={() => disconnectMutation.mutate()} disabled={disconnectMutation.isPending}>
                <Unlink className="mr-2 h-4 w-4" /> Disconnect
              </Button>
            ) : (
              <a
                href={savedCreds && !dirty ? authUrl : undefined}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => { if (!savedCreds || dirty) e.preventDefault(); }}
                className={`inline-flex h-10 items-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 ${(!savedCreds || dirty) ? 'pointer-events-none opacity-50' : ''}`}
              >
                <CalendarDays className="mr-2 h-4 w-4" /> Connect Google Calendar
              </a>
            )}
            {dirty && <span className="text-xs font-medium text-amber-600">You have unsaved changes — save them before connecting.</span>}
            {!savedCreds && !dirty && <span className="text-xs text-slate-500">Add the Client ID and Secret below and save first.</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Google credentials</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Client ID</Label>
            <Input className="mt-1" value={form.google_client_id} onChange={(e) => setForm((f) => ({ ...f, google_client_id: e.target.value }))} placeholder="…apps.googleusercontent.com" />
          </div>
          <div>
            <Label>Client Secret</Label>
            <Input className="mt-1" type="password" value={form.google_client_secret} onChange={(e) => setForm((f) => ({ ...f, google_client_secret: e.target.value }))} placeholder="GOCSPX-…" />
          </div>
          <div>
            <Label>Consultation length</Label>
            <select
              className="mt-1 flex h-10 w-44 rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={form.meeting_minutes}
              onChange={(e) => setForm((f) => ({ ...f, meeting_minutes: Number(e.target.value) }))}
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Redirect URI — paste this into Google Cloud Console</p>
            <p className="mt-1 break-all font-mono text-xs text-slate-700">{redirectUri}</p>
          </div>
          <Button type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save className="mr-2 h-4 w-4" /> Save calendar settings
          </Button>
          <p className="text-xs text-slate-500">Credentials live in the same admin-only settings row as your SMTP password. The connection uses a long-lived Google refresh token stored there too — it never expires unless you disconnect.</p>
        </CardContent>
      </Card>
    </div>
  );
}

const TABS = [
  { key: 'settings', label: 'Settings', Icon: Settings2 },
  { key: 'templates', label: 'Templates', Icon: FileText },
  { key: 'calendar', label: 'Calendar', Icon: CalendarDays },
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
        {tab === 'calendar' && <CalendarTab />}
        {tab === 'log' && <LogTab />}
      </div>
    </AdminLayout>
  );
}

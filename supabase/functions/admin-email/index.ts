// Admin-triggered emails: test send, booking confirmation, acknowledgement resend.
// Called from the admin panel with the admin's Supabase session token —
// unauthenticated calls are rejected. Sending uses the SMTP settings the
// admin saved in Admin → Email (email_settings table, read with the secret key).
import { createClient } from 'npm:@supabase/supabase-js@2';
// @ts-ignore: npm specifier without bundled types in the editor; deploys fine.
import nodemailer from 'npm:nodemailer@6.9.14';

const DEFAULT_ORIGINS = [
  'https://mc1services.com',
  'https://www.mc1services.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

const configuredList = (name: string, defaults: string[]) =>
  (Deno.env.get(name) || defaults.join(','))
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

const allowedOrigins = new Set(configuredList('ALLOWED_ORIGINS', DEFAULT_ORIGINS));

const responseHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin && allowedOrigins.has(origin) ? origin : DEFAULT_ORIGINS[0],
  'Access-Control-Allow-Headers': 'apikey, authorization, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
  'Vary': 'Origin'
});

const jsonResponse = (origin: string | null, status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: responseHeaders(origin) });

const getDefaultSecretKey = () => {
  const rawKeys = Deno.env.get('SUPABASE_SECRET_KEYS');
  if (!rawKeys) return null;
  try {
    const keys = JSON.parse(rawKeys) as Record<string, string>;
    return keys.default || null;
  } catch {
    return null;
  }
};

const SOURCE_LABELS: Record<string, string> = {
  contact: 'Contact Form', estimator: 'Cost Estimate', booking: 'Booking', assistant: 'Website Assistant'
};
const SERVICE_LABELS: Record<string, string> = {
  web_development: 'Web Development', app_development: 'App Development', custom_software: 'Custom Software',
  digital_marketing: 'Digital Marketing', branding: 'Branding & Design', seo: 'SEO',
  social_media: 'Social Media', it_consulting: 'IT Services & Consulting', other: 'Other'
};

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const htmlWrap = (text: string) =>
  `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;line-height:1.6;font-size:15px">${escapeHtml(text).replace(/\n/g, '<br>')}</body></html>`;

const renderTemplate = (text: string, vars: Record<string, string>) =>
  text.replace(/\{(\w+)\}/g, (_match, key) => vars[key] ?? '');

const parseBookingContext = (message: string) => {
  const grab = (pattern: RegExp) => message.match(pattern)?.[1]?.trim() || '';
  return {
    topic: grab(/Topic:\s*(.+)/),
    date: grab(/Preferred date:\s*(.+)/),
    time: grab(/Preferred time:\s*(.+?)(?:\s*\(|$)/)
  };
};

Deno.serve(async (request) => {
  const origin = request.headers.get('origin');
  if (origin && !allowedOrigins.has(origin)) {
    return jsonResponse(origin, 403, { error: 'Origin not allowed.' });
  }
  if (request.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: responseHeaders(origin) });
  }
  if (request.method !== 'POST') {
    return jsonResponse(origin, 405, { error: 'Method not allowed.' });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseSecretKey = getDefaultSecretKey();
  if (!supabaseUrl || !supabaseSecretKey) {
    return jsonResponse(origin, 503, { error: 'Email service is unavailable.' });
  }
  const admin = createClient(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  // The caller must be a signed-in admin.
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return jsonResponse(origin, 401, { error: 'Sign-in required.' });
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData?.user) return jsonResponse(origin, 401, { error: 'Sign-in required.' });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(origin, 400, { error: 'Invalid request.' });
  }

  const { data: settings } = await admin.from('email_settings').select('*').eq('id', 1).maybeSingle();
  if (!settings?.smtp_host || !settings?.smtp_user || !settings?.smtp_password) {
    return jsonResponse(origin, 422, { error: 'Email is not configured yet. Add your SMTP settings in Admin → Email first.' });
  }

  const { data: templateRows } = await admin.from('email_templates').select('*');
  const templates = new Map((templateRows || []).map((row: Record<string, unknown>) => [row.key, row]));

  const transport = nodemailer.createTransport({
    host: settings.smtp_host,
    port: settings.smtp_port ?? 465,
    secure: settings.smtp_secure !== false,
    auth: { user: settings.smtp_user, pass: settings.smtp_password }
  });
  const fromName = String(settings.from_name || 'MCS Consultancy').replace(/"/g, '');
  const from = settings.from_email ? `"${fromName}" <${settings.from_email}>` : settings.smtp_user;

  const log = async (row: Record<string, unknown>) => {
    try { await admin.from('email_logs').insert(row); } catch { /* best-effort */ }
  };

  const sendTemplate = async (templateKey: string, to: string, vars: Record<string, string>, submissionId?: string) => {
    const template = templates.get(templateKey) as Record<string, unknown> | undefined;
    if (!template) return { ok: false, error: `Template "${templateKey}" is missing.` };
    if (template.enabled === false) return { ok: false, error: `Template "${templateKey}" is switched off.` };
    const subject = renderTemplate(String(template.subject || ''), vars);
    const text = renderTemplate(String(template.body || ''), vars);
    try {
      await transport.sendMail({ from, to, subject, text, html: htmlWrap(text) });
      await log({ to_email: to, subject, template_key: templateKey, submission_id: submissionId || null, status: 'sent' });
      return { ok: true };
    } catch (sendError) {
      await log({ to_email: to, subject, template_key: templateKey, submission_id: submissionId || null, status: 'failed', error: String(sendError).slice(0, 500) });
      return { ok: false, error: String(sendError).slice(0, 300) };
    }
  };

  const action = body.action;

  if (action === 'test') {
    const to = typeof body.to === 'string' && body.to.includes('@')
      ? body.to
      : (settings.notify_email || settings.from_email || settings.smtp_user);
    const result = await sendTemplate('test_email', to, { name: 'Admin' });
    return result.ok
      ? jsonResponse(origin, 200, { ok: true, to })
      : jsonResponse(origin, 502, { error: result.error || 'Test email failed.' });
  }

  if (action === 'booking_confirmed' || action === 'resend_ack') {
    const submissionId = typeof body.submission_id === 'string' ? body.submission_id : '';
    if (!submissionId) return jsonResponse(origin, 400, { error: 'Missing submission_id.' });
    const { data: sub } = await admin.from('contact_submissions').select('*').eq('id', submissionId).maybeSingle();
    if (!sub) return jsonResponse(origin, 404, { error: 'Inquiry not found.' });
    const booking = parseBookingContext(String(sub.message || ''));
    const vars: Record<string, string> = {
      name: sub.name || '', email: sub.email || '', phone: sub.phone || '—', company: sub.company || '—',
      service: SERVICE_LABELS[sub.service_interest || ''] || sub.service_interest || 'General',
      source_label: SOURCE_LABELS[sub.source || ''] || 'Inquiry',
      message: sub.message || '',
      topic: booking.topic, date: booking.date, time: booking.time,
      estimate: '', timeline: '', project: '',
      admin_url: 'https://mc1services.com/admin/inquiries'
    };
    const templateKey = action === 'booking_confirmed' ? 'booking_confirmed' : `ack_${sub.source || 'contact'}`;
    const result = await sendTemplate(templateKey, sub.email, vars, sub.id);
    return result.ok
      ? jsonResponse(origin, 200, { ok: true })
      : jsonResponse(origin, 502, { error: result.error || 'Email failed to send.' });
  }

  return jsonResponse(origin, 400, { error: 'Unknown action.' });
});

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

const LOGO_URL = 'https://qcnxmagbeymybjtfbtzn.supabase.co/storage/v1/object/public/public/branding/1789078710707_MCS-Consultancy---logo.png';

// Turn plain template text into structured, styled HTML: ordinary lines
// become paragraphs, and runs of "Key: value" lines become a detail box.
const bodyToHtml = (text: string) => {
  const lines = String(text || '').split('\n');
  const out: string[] = [];
  let kv: string[] = [];
  const flushKv = () => {
    if (!kv.length) return;
    out.push(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin:14px 0"><tr><td style="padding:10px 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${kv.join('')}</table></td></tr></table>`);
    kv = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushKv(); continue; }
    const m = line.match(/^([^:<>]{2,40}):\s+(.+)$/);
    if (m) {
      kv.push(`<tr><td style="padding:5px 12px 5px 0;color:#64748b;font-size:13px;vertical-align:top;white-space:nowrap">${escapeHtml(m[1].trim())}</td><td style="padding:5px 0;color:#0f172a;font-size:13.5px;font-weight:600">${escapeHtml(m[2].trim())}</td></tr>`);
    } else {
      flushKv();
      out.push(`<p style="margin:0 0 12px">${escapeHtml(line)}</p>`);
    }
  }
  flushKv();
  return out.join('');
};

// Branded corporate shell for every email the system sends: navy header
// band with the MCS logo, the structured body, a proper signature block,
// and a disclaimer footer. The plain-text part is unchanged.
const htmlWrap = (text: string) => `<!doctype html><html><body style="margin:0;padding:0;background:#e8edf3;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e8edf3"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="700" cellpadding="0" cellspacing="0" style="max-width:700px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#0b2447;padding:22px 28px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="background:#ffffff;border-radius:10px;padding:7px 12px;width:1%"><img src="${LOGO_URL}" width="132" alt="MCS Consultancy" style="display:block;border:0"></td>
<td align="right" style="color:#bfdbfe;font-size:11px;letter-spacing:2.5px;font-weight:700">CUSTOM SOFTWARE &middot; AI &middot; GROWTH</td>
</tr></table>
</td></tr>
<tr><td style="padding:28px 28px 6px;color:#0f172a;font-size:15px;line-height:1.65">${bodyToHtml(text)}</td></tr>
<tr><td style="padding:10px 28px 4px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-top:1px solid #e2e8f0;padding-top:16px">
<p style="margin:0;font-size:15px;font-weight:700;color:#0f172a">MCS Consultancy</p>
<p style="margin:2px 0 8px;font-size:12.5px;color:#64748b">Manhatin Computer Software Consultancy</p>
<p style="margin:0;font-size:13px;color:#334155"><a href="tel:+971508322799" style="color:#2563eb;text-decoration:none">+971 50 832 2799</a> &nbsp;&middot;&nbsp; <a href="mailto:info@mc1services.com" style="color:#2563eb;text-decoration:none">info@mc1services.com</a> &nbsp;&middot;&nbsp; <a href="https://mc1services.com" style="color:#2563eb;text-decoration:none">mc1services.com</a></p>
</td></tr></table>
</td></tr>
<tr><td style="background:#f1f5f9;padding:18px 28px;color:#64748b;font-size:11.5px;line-height:1.65">
<p style="margin:0 0 8px">Corniche St, Al Majaz District, Sharjah, United Arab Emirates</p>
<p style="margin:0 0 8px">This email and any attachments are confidential and intended solely for the named recipient. If you received it in error, please notify the sender and delete it. You are receiving this message because you submitted a request through mc1services.com or are in an ongoing conversation with our team.</p>
<p style="margin:0">&copy; ${new Date().getFullYear()} MCS Consultancy. All rights reserved.</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;

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

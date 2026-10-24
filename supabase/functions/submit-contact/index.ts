import { createClient } from 'npm:@supabase/supabase-js@2';
// @ts-ignore: npm specifier without bundled types in the editor; deploys fine.
import nodemailer from 'npm:nodemailer@6.9.14';

const DEFAULT_ORIGINS = [
  'https://mc1services.com',
  'https://www.mc1services.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

const DEFAULT_HOSTNAMES = ['mc1services.com', 'www.mc1services.com', 'localhost', '127.0.0.1'];
const MAX_BODY_BYTES = 16 * 1024;
const SERVICE_INTERESTS = new Set([
  'web_development', 'app_development', 'custom_software', 'digital_marketing',
  'branding', 'seo', 'social_media', 'it_consulting', 'other'
]);

const SOURCES = new Set(['contact', 'estimator', 'booking', 'assistant']);
const SOURCE_LABELS: Record<string, string> = {
  contact: 'Contact Form', estimator: 'Cost Estimate', booking: 'Booking', assistant: 'Website Assistant'
};
const SERVICE_LABELS: Record<string, string> = {
  web_development: 'Web Development', app_development: 'App Development', custom_software: 'Custom Software',
  digital_marketing: 'Digital Marketing', branding: 'Branding & Design', seo: 'SEO',
  social_media: 'Social Media', it_consulting: 'IT Services & Consulting', other: 'Other'
};

const configuredList = (name: string, defaults: string[]) =>
  (Deno.env.get(name) || defaults.join(','))
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

const allowedOrigins = new Set(configuredList('ALLOWED_ORIGINS', DEFAULT_ORIGINS));
const allowedHostnames = new Set(configuredList('TURNSTILE_ALLOWED_HOSTNAMES', DEFAULT_HOSTNAMES));

const responseHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin && allowedOrigins.has(origin) ? origin : DEFAULT_ORIGINS[0],
  'Access-Control-Allow-Headers': 'apikey, authorization, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
  'Vary': 'Origin'
});

const jsonResponse = (origin: string | null, status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: responseHeaders(origin) });

const requiredText = (value: unknown, minimum: number, maximum: number) => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length >= minimum && normalized.length <= maximum ? normalized : null;
};

const optionalText = (value: unknown, maximum: number) => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized.length <= maximum ? normalized : undefined;
};

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

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return jsonResponse(origin, 415, { error: 'Unsupported content type.' });
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return jsonResponse(origin, 413, { error: 'Request is too large.' });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return jsonResponse(origin, 400, { error: 'Invalid request.' });
  }

  if (body.website) return jsonResponse(origin, 400, { error: 'Invalid request.' });

  const name = requiredText(body.name, 2, 120);
  const email = requiredText(body.email, 3, 254)?.toLowerCase() || null;
  const phone = optionalText(body.phone, 40);
  const company = optionalText(body.company, 160);
  const message = requiredText(body.message, 10, 5000);
  const serviceInterest = optionalText(body.service_interest, 80);
  const source = typeof body.source === 'string' && SOURCES.has(body.source) ? body.source : 'contact';
  const rawContext = (body.context && typeof body.context === 'object' && !Array.isArray(body.context))
    ? body.context as Record<string, unknown> : {};
  const context: Record<string, string> = {};
  for (const key of ['date', 'time', 'topic', 'estimate', 'timeline', 'project']) {
    const value = optionalText(rawContext[key], 300);
    if (typeof value === 'string' && value) context[key] = value;
  }
  const turnstileToken = requiredText(body.turnstileToken, 1, 2048);
  const emailIsValid = email && /^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$/i.test(email);

  if (!name || !emailIsValid || phone === undefined || company === undefined || !message ||
      serviceInterest === undefined || (serviceInterest && !SERVICE_INTERESTS.has(serviceInterest)) || !turnstileToken) {
    return jsonResponse(origin, 400, { error: 'Please check the submitted information.' });
  }

  const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY');
  if (!turnstileSecret) {
    console.error('TURNSTILE_SECRET_KEY is not configured');
    return jsonResponse(origin, 503, { error: 'Security verification is unavailable.' });
  }

  const verificationResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: turnstileSecret, response: turnstileToken })
  });

  if (!verificationResponse.ok) {
    console.error('Turnstile Siteverify request failed');
    return jsonResponse(origin, 503, { error: 'Security verification is unavailable.' });
  }

  const verification = await verificationResponse.json() as {
    success?: boolean;
    hostname?: string;
    action?: string;
  };

  if (!verification.success || !verification.hostname || !allowedHostnames.has(verification.hostname) ||
      verification.action !== 'contact_form') {
    return jsonResponse(origin, 400, { error: 'Security verification failed.' });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseSecretKey = getDefaultSecretKey();
  if (!supabaseUrl || !supabaseSecretKey) {
    console.error('Supabase Edge Function default secrets are unavailable');
    return jsonResponse(origin, 503, { error: 'Contact service is unavailable.' });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data, error } = await supabaseAdmin
    .from('contact_submissions')
    .insert({
      name,
      email,
      phone,
      company,
      service_interest: serviceInterest,
      message,
      subject: `New Inquiry: ${serviceInterest || 'General'}`,
      status: 'new',
      source
    })
    .select('id')
    .single();

  if (error) {
    console.error('Contact submission database insert failed');
    return jsonResponse(origin, 500, { error: 'Contact submission failed.' });
  }

  // Best-effort emails: a mail failure must never fail the submission.
  try {
    await sendInquiryEmails(supabaseAdmin, {
      id: data.id, name, email, phone, company, serviceInterest, message, source, context
    });
  } catch (emailError) {
    console.error('Inquiry email step failed', emailError);
  }

  return jsonResponse(origin, 201, { ok: true, id: data.id });
});

// ---------- Email helpers (settings/templates live in the database) ----------

type AdminClient = ReturnType<typeof createClient>;

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

async function logEmail(admin: AdminClient, row: Record<string, unknown>) {
  try { await admin.from('email_logs').insert(row); } catch { /* logging is best-effort */ }
}

async function sendInquiryEmails(admin: AdminClient, sub: {
  id: string; name: string; email: string; phone: string | null; company: string | null;
  serviceInterest: string | null; message: string; source: string; context: Record<string, string>;
}) {
  const { data: settings } = await admin.from('email_settings').select('*').eq('id', 1).maybeSingle();
  if (!settings?.smtp_host || !settings?.smtp_user || !settings?.smtp_password) return; // email not configured yet

  const { data: templateRows } = await admin.from('email_templates').select('*');
  const templates = new Map((templateRows || []).map((row: Record<string, unknown>) => [row.key, row]));

  const booking = sub.source === 'booking' ? parseBookingContext(sub.message) : { topic: '', date: '', time: '' };
  const vars: Record<string, string> = {
    name: sub.name,
    email: sub.email,
    phone: sub.phone || '—',
    company: sub.company || '—',
    service: SERVICE_LABELS[sub.serviceInterest || ''] || sub.serviceInterest || 'General',
    source_label: SOURCE_LABELS[sub.source] || 'Inquiry',
    message: sub.message,
    topic: sub.context.topic || booking.topic || '',
    date: sub.context.date || booking.date || '',
    time: sub.context.time || booking.time || '',
    estimate: sub.context.estimate || '',
    timeline: sub.context.timeline || '',
    project: sub.context.project || '',
    admin_url: 'https://mc1services.com/admin/inquiries'
  };

  const transport = nodemailer.createTransport({
    host: settings.smtp_host,
    port: settings.smtp_port ?? 465,
    secure: settings.smtp_secure !== false,
    auth: { user: settings.smtp_user, pass: settings.smtp_password }
  });
  const fromName = String(settings.from_name || 'MCS Consultancy').replace(/"/g, '');
  const from = settings.from_email ? `"${fromName}" <${settings.from_email}>` : settings.smtp_user;

  const send = async (templateKey: string, to: string) => {
    const template = templates.get(templateKey) as Record<string, unknown> | undefined;
    if (!template || template.enabled === false || !to) return;
    const subject = renderTemplate(String(template.subject || ''), vars);
    const text = renderTemplate(String(template.body || ''), vars);
    try {
      await transport.sendMail({ from, to, subject, text, html: htmlWrap(text) });
      await logEmail(admin, { to_email: to, subject, template_key: templateKey, submission_id: sub.id, status: 'sent' });
    } catch (sendError) {
      await logEmail(admin, {
        to_email: to, subject, template_key: templateKey, submission_id: sub.id,
        status: 'failed', error: String(sendError).slice(0, 500)
      });
    }
  };

  if (settings.notify_admin !== false) {
    await send('admin_notification', settings.notify_email || settings.from_email || settings.smtp_user);
  }
  if (settings.ack_visitor !== false) {
    await send(`ack_${sub.source}`, sub.email);
  }
}


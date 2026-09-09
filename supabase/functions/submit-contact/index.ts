import { createClient } from 'npm:@supabase/supabase-js@2';

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
      status: 'new'
    })
    .select('id')
    .single();

  if (error) {
    console.error('Contact submission database insert failed');
    return jsonResponse(origin, 500, { error: 'Contact submission failed.' });
  }

  return jsonResponse(origin, 201, { ok: true, id: data.id });
});


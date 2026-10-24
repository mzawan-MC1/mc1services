// Google Calendar OAuth callback for mc1services.
// Google redirects the admin's browser here after consent (GET, no JWT —
// deploy this function with "Verify JWT" turned OFF). It exchanges the
// authorization code for a refresh token and stores it in email_settings
// (read/written with the secret key only; the row is admin-only under RLS).
import { createClient } from 'npm:@supabase/supabase-js@2';

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

const page = (title: string, message: string, ok: boolean) => new Response(
  `<!doctype html><html><head><meta charset="utf-8"><title>${title} — MCS Consultancy</title></head>
<body style="margin:0;background:#e8edf3;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:520px;margin:60px auto;background:#ffffff;border-radius:16px;overflow:hidden">
<div style="background:#0b2447;color:#ffffff;padding:20px 28px;font-weight:700;letter-spacing:1px">MCS CONSULTANCY</div>
<div style="padding:28px;color:#0f172a">
<h1 style="font-size:20px;margin:0 0 10px">${ok ? '✓ ' : ''}${title}</h1>
<p style="color:#475569;line-height:1.6;margin:0">${message}</p>
<p style="margin:18px 0 0"><a href="https://mc1services.com/admin/email" style="color:#2563eb">← Back to Admin → Email</a></p>
</div></div></body></html>`,
  { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
);

Deno.serve(async (request) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const oauthError = url.searchParams.get('error');
  if (oauthError) {
    return page('Connection cancelled', `Google reported: ${oauthError}. Nothing was connected — you can close this tab and try again from Admin → Email → Calendar.`, false);
  }
  if (!code) {
    return page('Nothing to do here', 'This address is the Google Calendar sign-in callback for the MCS website. Start the connection from Admin → Email → Calendar.', false);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseSecretKey = getDefaultSecretKey();
  if (!supabaseUrl || !supabaseSecretKey) {
    return page('Server not ready', 'The calendar service is unavailable right now. Please try again later.', false);
  }
  const admin = createClient(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data: settings } = await admin.from('email_settings').select('*').eq('id', 1).maybeSingle();
  if (!settings?.google_client_id || !settings?.google_client_secret) {
    return page('Credentials missing', 'Save your Google Client ID and Client Secret in Admin → Email → Calendar first, then click Connect again.', false);
  }

  const redirectUri = `${supabaseUrl}/functions/v1/google-calendar-callback`;
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: settings.google_client_id,
      client_secret: settings.google_client_secret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })
  });
  const tokens = await tokenRes.json().catch(() => ({}));
  if (!tokenRes.ok || !tokens.refresh_token) {
    return page('No refresh token received', 'Google did not return a long-term token. Disconnect the app under your Google Account → Security → Third-party access, then click Connect again (the consent screen must be approved with offline access).', false);
  }

  let connectedEmail = '';
  try {
    const infoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    const info = await infoRes.json().catch(() => ({}));
    connectedEmail = info.email || '';
  } catch { /* email label is cosmetic */ }

  const { error: saveError } = await admin.from('email_settings')
    .update({ google_refresh_token: tokens.refresh_token, google_connected_email: connectedEmail || null })
    .eq('id', 1);
  if (saveError) {
    return page('Could not save the connection', 'Google approved the sign-in but saving it failed. Run the google-calendar-setup.sql in the SQL Editor, then connect again.', false);
  }

  return page('Google Calendar connected', `Bookings you confirm will now create events on ${connectedEmail ? `<b>${connectedEmail}</b>'s` : 'your'} calendar and invite the visitor automatically. You can close this tab.`, true);
});

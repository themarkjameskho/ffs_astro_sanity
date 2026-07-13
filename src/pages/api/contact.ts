import type { APIRoute } from 'astro';

export const prerender = false;

const WEBHOOK_URL = process.env.AUTOMATION_WEBHOOK_URL ?? process.env.PUBLIC_AUTOMATION_WEBHOOK_URL;

// Cloudflare Turnstile secret key — server-only, never exposed to the
// browser. If missing or still set to the .env placeholder we treat
// verification as DISABLED and let submissions through (so a stale
// Vercel env or missing secret doesn't silently swallow every lead).
// Once Cory provides the keys, set TURNSTILE_SECRET_KEY in Vercel
// Project Settings → Environment Variables and verification kicks in.
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const TURNSTILE_ENABLED =
  typeof TURNSTILE_SECRET_KEY === 'string' &&
  TURNSTILE_SECRET_KEY.length > 0 &&
  !TURNSTILE_SECRET_KEY.startsWith('__PASTE_');
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'X-Forwarded-By': `${process.env.BRAND_SLUG ?? process.env.PUBLIC_BRAND_SLUG ?? 'ffs-pest-control'}-contact-form`
} as const;

/**
 * Verify a Turnstile token by posting it back to Cloudflare's siteverify
 * endpoint along with our secret key and the caller's IP. Returns true
 * iff Cloudflare confirms the token came from a human (or test mode).
 * Anything else — missing token, invalid signature, replay, expired —
 * returns false so the lead is rejected without reaching the webhook.
 */
async function verifyTurnstile(token: string | null, remoteIp: string | null): Promise<boolean> {
  if (!TURNSTILE_ENABLED) return true;            // keys not configured → skip
  if (!token || token.length < 10) return false;  // obvious fail
  try {
    const body = new URLSearchParams();
    body.set('secret', TURNSTILE_SECRET_KEY!);
    body.set('response', token);
    if (remoteIp) body.set('remoteip', remoteIp);
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });
    if (!res.ok) {
      console.error('Turnstile verify HTTP', res.status);
      return false;
    }
    const json = (await res.json()) as { success?: boolean; 'error-codes'?: string[] };
    if (!json.success) {
      console.warn('Turnstile rejected token:', json['error-codes']?.join(', '));
    }
    return json.success === true;
  } catch (err) {
    console.error('Turnstile verify threw:', err);
    return false;
  }
}

async function buildSearchParams(request: Request) {
  const contentType = request.headers.get('content-type') ?? '';
  const params = new URLSearchParams();

  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        params.append(key, value);
      }
    }
  } else {
    const body = await request.text();
    if (body) {
      try {
        const parsed = JSON.parse(body) as Record<string, string | string[]>;
        Object.entries(parsed).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((entry) => params.append(key, entry));
          } else if (typeof value === 'string') {
            params.append(key, value);
          }
        });
      } catch {
        params.append('rawPayload', body);
      }
    }
  }

  return params;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!WEBHOOK_URL) {
    console.error('WEBHOOK_URL is not configured. Check AUTOMATION_WEBHOOK_URL or PUBLIC_AUTOMATION_WEBHOOK_URL environment variables.');
    return new Response(
      JSON.stringify({ success: false, error: 'Automation webhook is not configured.' }),
      { status: 500 }
    );
  }

  try {
    const params = await buildSearchParams(request);
    if (!params.has('submittedAt')) {
      params.append('submittedAt', new Date().toISOString());
    }

    // Cloudflare Turnstile gate. The widget injects `cf-turnstile-response`
    // into the form data; we verify it server-side before forwarding to
    // n8n. When Turnstile keys aren't set we let the request through
    // (verifyTurnstile returns true) so leads keep flowing during the
    // grace period between code deploy and Cloudflare key creation.
    const turnstileToken = params.get('cf-turnstile-response');
    const remoteIp =
      request.headers.get('cf-connecting-ip') ??
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      clientAddress ??
      null;
    const turnstileOk = await verifyTurnstile(turnstileToken, remoteIp);
    if (!turnstileOk) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Security check failed. Please refresh the page and try again.'
        }),
        { status: 403 }
      );
    }
    // Token is single-use — strip it before forwarding to keep the n8n
    // payload clean of Cloudflare-internal fields.
    params.delete('cf-turnstile-response');

    console.log('Forwarding to webhook:', WEBHOOK_URL);
    console.log('Form data keys:', Array.from(params.keys()).join(', '));

    const upstream = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers,
      body: params.toString()
    });

    console.log('Webhook response status:', upstream.status);

    if (!upstream.ok) {
      const errorText = await upstream.text();
      console.error('Webhook error response:', errorText);
      return new Response(
        JSON.stringify({
          success: false,
          error: errorText || 'Automation webhook rejected the request.'
        }),
        { status: 502 }
      );
    }

    console.log('Form submission successful');
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Contact form submission failed:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Unexpected error while submitting the form.'
      }),
      { status: 500 }
    );
  }
};

export const ALL: APIRoute = () =>
  new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
    status: 405,
    headers: { Allow: 'POST' }
  });

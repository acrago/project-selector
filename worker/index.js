/**
 * Cloudflare Worker: proxy for Discussions summarization (calls MaaS).
 * Request: POST with body { prompt: string }
 * Response: { summary: string } or { error: string }
 *
 * Set MAAS_API_KEY (required) and optionally MAAS_ENDPOINT_URL via:
 *   npx wrangler secret put MAAS_API_KEY
 *   npx wrangler secret put MAAS_ENDPOINT_URL
 */

const DEFAULT_MAAS_BASE =
  'https://llama-3-2-3b-maas-apicast-production.apps.prod.rhoai.rh-aiservices-bu.com';
const MAAS_PATH = '/v1/chat/completions';

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request, env, _ctx) {
    const origin = request.headers.get('Origin') || '*';

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders(origin),
      });
    }

    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
      );
    }

    const apiKey = env.MAAS_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'Summarization not configured. Set MAAS_API_KEY secret.',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
      );
    }

    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Missing or empty prompt' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
      );
    }

    const baseUrl = (env.MAAS_ENDPOINT_URL || DEFAULT_MAAS_BASE).replace(/\/+$/, '');
    const endpointUrl = baseUrl + (baseUrl.includes('/v1') ? '' : MAAS_PATH);

    const maasBody = JSON.stringify({
      model: 'llama-3-2-3b',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.3,
    });

    try {
      const resp = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: maasBody,
      });

      const data = await resp.json().catch(() => ({}));
      const summary =
        data.choices?.[0]?.message?.content ??
        data.choices?.[0]?.text ??
        data.output?.[0] ??
        '';

      if (resp.ok) {
        return new Response(
          JSON.stringify({ summary: String(summary).trim() }),
          { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
        );
      }

      return new Response(
        JSON.stringify({
          error: data.error?.message || resp.statusText || 'MaaS request failed',
        }),
        {
          status: resp.status,
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
        }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message || 'Upstream request failed' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
      );
    }
  },
};

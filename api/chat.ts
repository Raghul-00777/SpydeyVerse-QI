// Vercel serverless function — proxies chat requests to OpenAI.
// The OpenAI key is a SERVER-ONLY env var (OPENAI_API_KEY), never exposed to the client.
import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Do NOT log the key. Return a clear, safe message the client can surface.
    res.status(500).json({ error: 'OpenAI API key is not configured on the server (set OPENAI_API_KEY).' });
    return;
  }

  const { messages, model = DEFAULT_MODEL, max_tokens = 1024, temperature = 0.7 } = (req.body || {}) as {
    messages?: unknown;
    model?: string;
    max_tokens?: number;
    temperature?: number;
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Missing messages array.' });
    return;
  }

  try {
    const upstream = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, max_tokens, temperature }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      const message =
        (data && typeof data.error === 'object' && data.error && typeof data.error.message === 'string'
          ? data.error.message
          : typeof data?.error === 'string'
            ? data.error
            : upstream.statusText) || `OpenAI error ${upstream.status}`;
      res.status(upstream.status).json({ error: message, status: upstream.status });
      return;
    }

    const content: string =
      data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.message?.reasoning ?? '';
    res.status(200).json({ content });
  } catch {
    res.status(502).json({ error: 'Failed to reach OpenAI.', status: 502 });
  }
}

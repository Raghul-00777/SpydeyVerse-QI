// Vercel serverless function — proxies decision-engine requests to Groq.
// The Groq key is a SERVER-ONLY env var (GROQ_API_KEY), never exposed to the client.
import type { VercelRequest, VercelResponse } from '@vercel/node';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

type RecType = 'classical' | 'ai' | 'quantum-inspired' | 'future-quantum';

const typeMap: Record<string, RecType> = {
  classical: 'classical',
  ai: 'ai',
  'quantum-inspired': 'quantum-inspired',
  'quantum inspired': 'quantum-inspired',
  'future quantum': 'future-quantum',
  'future-quantum': 'future-quantum',
};

function buildPrompt(query: string): string {
  return `You are an AI decision engine specializing in optimization and algorithms. Analyze this query and recommend the best computing approaches.

User query: "${query}"

Respond ONLY with valid JSON:
{
  "category": "Optimization|AI/ML|Finance|Science|Security|Logistics|Healthcare|Infrastructure|Energy|Robotics|NLP|General",
  "recommendations": [
    {
      "type": "classical|ai|quantum-inspired|future-quantum",
      "title": "specific solution name",
      "confidence": 0-100,
      "reason": "detailed explanation of why this approach works",
      "algorithm": "exact algorithm name",
      "complexity": "big-O notation",
      "pros": ["specific advantage 1", "specific advantage 2", "specific advantage 3"],
      "cons": ["specific limitation 1", "specific limitation 2"],
      "difficulty": "Low|Medium|High|Very High",
      "estimatedCost": "$XXK-$XXK",
      "timeToImplement": "X-Y months"
    }
  ]
}

Rules:
1. Provide exactly 4 recommendations
2. Mix classical, AI, and quantum-inspired approaches
3. Make recommendations specific to the query domain
4. Use real algorithm names and realistic complexity estimates
5. Confidence scores should reflect real-world effectiveness`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Groq API key is not configured on the server (set GROQ_API_KEY).' });
    return;
  }

  const { query } = (req.body || {}) as { query?: string };
  if (!query || !query.trim()) {
    res.status(400).json({ error: 'Missing query.' });
    return;
  }

  try {
    const upstream = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: buildPrompt(query) }],
        max_tokens: 2500,
        temperature: 0.2,
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      const message =
        (data && typeof data.error === 'object' && data.error && typeof data.error.message === 'string'
          ? data.error.message
          : typeof data?.error === 'string'
            ? data.error
            : upstream.statusText) || `Groq error ${upstream.status}`;
      res.status(upstream.status).json({ error: message, status: upstream.status });
      return;
    }

    const content: string = data?.choices?.[0]?.message?.content ?? '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      res.status(502).json({ error: 'Could not parse Groq response.', status: 502 });
      return;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const recommendations = (parsed.recommendations || []).map((r: Record<string, unknown>) => {
      const type = typeof r.type === 'string' && typeMap[r.type] ? typeMap[r.type] : 'ai';
      const confidence = typeof r.confidence === 'number' ? r.confidence : parseInt(String(r.confidence)) || 75;
      const pros = Array.isArray(r.pros) ? r.pros : [String(r.pros ?? 'Effective solution')];
      const cons = Array.isArray(r.cons) ? r.cons : [String(r.cons ?? 'Requires setup')];
      const difficulty =
        typeof r.difficulty === 'string' && ['Low', 'Medium', 'High', 'Very High'].includes(r.difficulty)
          ? r.difficulty
          : 'Medium';
      return { ...r, type, confidence, pros, cons, difficulty };
    });

    res.status(200).json({
      recommendations,
      category: parsed.category || 'General',
      categoryLabel: parsed.category || 'General',
    });
  } catch {
    res.status(502).json({ error: 'Failed to reach Groq.', status: 502 });
  }
}

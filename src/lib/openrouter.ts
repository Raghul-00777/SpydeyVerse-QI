const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const VISION_MODEL = 'google/gemini-3.6-flash';
export const CHAT_MODEL = 'google/gemini-3.6-flash';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<Record<string, unknown>>;
}

export interface OpenRouterOptions {
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

export class OpenRouterError extends Error {
  public status: number;
  public isConfigError: boolean;
  constructor(message: string, status = 0, isConfigError = false) {
    super(message);
    this.name = 'OpenRouterError';
    this.status = status;
    this.isConfigError = isConfigError;
  }
}

export function isOpenRouterConfigured(): boolean {
  return Boolean(OPENROUTER_API_KEY && OPENROUTER_API_KEY.length > 10);
}

export async function openRouterChat(
  messages: ChatMessage[],
  options: OpenRouterOptions = {}
): Promise<string> {
  if (!isOpenRouterConfigured()) {
    throw new OpenRouterError('OpenRouter API key not configured', 401, true);
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
      'X-Title': 'SpydeyVerse',
    },
    body: JSON.stringify({
      model: options.model ?? CHAT_MODEL,
      messages,
      max_tokens: options.max_tokens ?? 2048,
      temperature: options.temperature ?? 0.7,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errMsg =
      data?.error?.message ||
      data?.errors?.[0]?.message ||
      `OpenRouter API error: ${response.status}`;
    throw new OpenRouterError(errMsg, response.status);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new OpenRouterError('No response content from OpenRouter', response.status);
  }
  return content;
}

export async function analyzeImage(
  imageDataUrl: string,
  prompt: string
): Promise<string> {
  if (!isOpenRouterConfigured()) {
    throw new OpenRouterError('OpenRouter API key not configured', 401, true);
  }

  return openRouterChat(
    [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageDataUrl } },
        ],
      },
    ],
    { model: VISION_MODEL, max_tokens: 1500, temperature: 0.3 }
  );
}

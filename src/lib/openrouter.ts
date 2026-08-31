import {
  getChatReplyDemo,
  getEcoScanDemo,
  generateReportDemo,
  analyzeImageDemo,
  isDemoModeEnabled,
} from './demoMode';

export { getChatReplyDemo, getEcoScanDemo, generateReportDemo, analyzeImageDemo, isDemoModeEnabled };

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const VISION_MODEL = 'gpt-4o-mini';
export const CHAT_MODEL = 'gpt-4o-mini';

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
  public isCreditsError: boolean;
  public isRateLimitError: boolean;
  constructor(message: string, status = 0, isConfigError = false, isCreditsError = false, isRateLimitError = false) {
    super(message);
    this.name = 'OpenRouterError';
    this.status = status;
    this.isConfigError = isConfigError;
    this.isCreditsError = isCreditsError;
    this.isRateLimitError = isRateLimitError;
  }
}

export function isOpenRouterConfigured(): boolean {
  return Boolean((OPENAI_API_KEY && OPENAI_API_KEY.length > 10) || (OPENROUTER_API_KEY && OPENROUTER_API_KEY.length > 10));
}

function classifyError(data: unknown, status: number): OpenRouterError {
  const dataObj = data as Record<string, unknown>;
  let rawMsg = `OpenRouter API error: ${status}`;

  const errorMessage = dataObj.error;
  if (typeof errorMessage === 'string') {
    rawMsg = errorMessage;
  } else if (errorMessage && typeof errorMessage === 'object' && 'message' in errorMessage) {
    rawMsg = String((errorMessage as Record<string, unknown>).message);
  }

  const firstError = dataObj.errors;
  if (rawMsg.startsWith('OpenRouter API error') && Array.isArray(firstError) && firstError.length > 0) {
    const item = firstError[0];
    if (typeof item === 'string') {
      rawMsg = item;
    } else if (item && typeof item === 'object' && 'message' in item) {
      rawMsg = String((item as Record<string, unknown>).message);
    }
  }

  const msg = rawMsg.toLowerCase();
  const isCreditsError = status === 402 || msg.includes('credits') || msg.includes('payment');
  const isConfigError = status === 401 || msg.includes('invalid api key') || msg.includes('unauthorized');
  const isRateLimitError = status === 429 || msg.includes('rate limit') || msg.includes('too many requests') || msg.includes('quota');

  return new OpenRouterError(rawMsg, status, isConfigError, isCreditsError, isRateLimitError);
}

function contentToText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value
      .map(item => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && 'text' in item) {
          return String((item as Record<string, unknown>).text ?? '');
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }
  if (value && typeof value === 'object' && 'text' in value) {
    return String((value as Record<string, unknown>).text ?? '');
  }
  return '';
}

export async function openRouterChat(
  messages: ChatMessage[],
  options: OpenRouterOptions = {}
): Promise<string> {
  const apiKey = OPENAI_API_KEY || OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new OpenRouterError('OpenAI/OpenRouter API key not configured', 401, true);
  }

  const maxTokens = Math.min(options.max_tokens ?? 512, 512);
  const usingOpenAI = Boolean(OPENAI_API_KEY);
  const apiUrl = usingOpenAI ? OPENAI_API_URL : OPENROUTER_API_URL;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...(usingOpenAI ? {} : {
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
        'X-Title': 'SpydeyVerse',
      }),
    },
    body: JSON.stringify({
      model: options.model ?? CHAT_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: options.temperature ?? 0.7,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw classifyError(data, response.status);
  }

  const chatData = data as { choices?: Array<{ message?: { content?: unknown; reasoning?: unknown } }> };
  const message = chatData.choices?.[0]?.message;
  const content = contentToText(message?.content);
  const reasoning = contentToText(message?.reasoning);
  if (!content && !reasoning) {
    throw new OpenRouterError('No response content from AI provider', response.status);
  }
  return content || reasoning || '';
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
    { model: VISION_MODEL, max_tokens: 500, temperature: 0.3 }
  );
}

import { AIProviderError, RateLimitError } from '../errors';
import { rateLimiter } from '../rate-limiter';
import { prisma } from '@/lib/prisma';

export type AIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type AIOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  userId?: string;
};

export type AIResponse = {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

type ProviderConfig = {
  provider: string;
  apiKey: string;
  baseUrl: string | null;
  model: string | null;
};

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1';
const DEFAULT_MODEL = process.env.AI_MODEL || 'llama3.2:latest';

const PROVIDER_DEFAULTS: Record<string, { baseUrl: string; model: string }> = {
  openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o' },
  anthropic: { baseUrl: 'https://api.anthropic.com/v1', model: 'claude-sonnet-4-20250514' },
  google: { baseUrl: 'https://generativelanguage.googleapis.com/v1beta', model: 'gemini-2.0-flash' },
  ollama: { baseUrl: OLLAMA_BASE_URL, model: DEFAULT_MODEL },
};

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  attempt = 1
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error');
      throw new Error(`HTTP ${response.status}: ${errorBody}`);
    }
    return response;
  } catch (error) {
    if (attempt >= maxRetries) throw error;
    const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
    await sleep(delay);
    return fetchWithRetry(url, options, maxRetries, attempt + 1);
  }
}

async function resolveProvider(userId?: string): Promise<ProviderConfig> {
  if (userId) {
    const stored = await prisma.aiProvider.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    if (stored) {
      return {
        provider: stored.provider,
        apiKey: stored.apiKey,
        baseUrl: stored.baseUrl,
        model: stored.model,
      };
    }
  }

  return {
    provider: 'ollama',
    apiKey: '',
    baseUrl: OLLAMA_BASE_URL,
    model: DEFAULT_MODEL,
  };
}

function getHeaders(config: ProviderConfig): Record<string, string> {
  if (config.provider === 'anthropic') {
    return {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    };
  }
  if (config.provider === 'google') {
    return {
      'Content-Type': 'application/json',
    };
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
  };
}

function getEndpoint(config: ProviderConfig): string {
  const base = config.baseUrl || PROVIDER_DEFAULTS[config.provider]?.baseUrl || OLLAMA_BASE_URL;
  const model = config.model || PROVIDER_DEFAULTS[config.provider]?.model || DEFAULT_MODEL;

  if (config.provider === 'anthropic') {
    return `${base}/messages`;
  }
  if (config.provider === 'google') {
    return `${base}/models/${model}:streamGenerateContent?alt=sse&key=${config.apiKey}`;
  }
  return `${base}/chat/completions`;
}

function buildBody(config: ProviderConfig, messages: AIMessage[], options: AIOptions, stream: boolean) {
  const model = options.model || config.model || PROVIDER_DEFAULTS[config.provider]?.model || DEFAULT_MODEL;

  if (config.provider === 'anthropic') {
    const systemMsg = messages.find((m) => m.role === 'system');
    const nonSystem = messages.filter((m) => m.role !== 'system');
    return {
      model,
      max_tokens: options.maxTokens ?? 4096,
      temperature: options.temperature ?? 0.7,
      stream,
      ...(systemMsg ? { system: systemMsg.content } : {}),
      messages: nonSystem.map((m) => ({ role: m.role, content: m.content })),
    };
  }

  if (config.provider === 'google') {
    const systemMsg = messages.find((m) => m.role === 'system');
    const nonSystem = messages.filter((m) => m.role !== 'system');
    return {
      contents: nonSystem.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      ...(systemMsg ? { systemInstruction: { parts: [{ text: systemMsg.content }] } } : {}),
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 4096,
      },
    };
  }

  return {
    model,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 4096,
    stream,
  };
}

function parseResponse(config: ProviderConfig, data: Record<string, unknown>): string {
  if (config.provider === 'anthropic') {
    const content = (data as { content?: { type: string; text: string }[] }).content;
    return content?.[0]?.text || '';
  }
  if (config.provider === 'google') {
    const candidates = (data as { candidates?: { content?: { parts?: { text: string }[] } }[] }).candidates;
    return candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
  const choices = (data as { choices?: { message?: { content: string } }[] }).choices;
  return choices?.[0]?.message?.content || '';
}

async function callProvider(
  messages: AIMessage[],
  options: AIOptions
): Promise<{ content: string; usage: AIResponse['usage'] }> {
  const config = await resolveProvider(options.userId);
  const endpoint = getEndpoint(config);
  const body = buildBody(config, messages, options, false);
  const headers = getHeaders(config);

  const response = await fetchWithRetry(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await response.json();
  const content = parseResponse(config, data);

  if (!content) {
    throw new AIProviderError(config.provider, 'No content in response', data);
  }

  const usage = config.provider === 'anthropic'
    ? { promptTokens: data.usage?.input_tokens ?? 0, completionTokens: data.usage?.output_tokens ?? 0, totalTokens: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0) }
    : config.provider === 'google'
    ? { promptTokens: data.usageMetadata?.promptTokenCount ?? 0, completionTokens: data.usageMetadata?.candidatesTokenCount ?? 0, totalTokens: data.usageMetadata?.totalTokenCount ?? 0 }
    : { promptTokens: data.usage?.prompt_tokens ?? estimateTokens(messages.map((m) => m.content).join('')), completionTokens: data.usage?.completion_tokens ?? estimateTokens(content), totalTokens: data.usage?.total_tokens ?? 0 };

  return { content, usage };
}

async function callProviderStream(
  messages: AIMessage[],
  options: AIOptions
): Promise<ReadableStream<Uint8Array>> {
  const config = await resolveProvider(options.userId);
  const endpoint = getEndpoint(config);
  const body = buildBody(config, messages, options, true);
  const headers = getHeaders(config);

  const response = await fetchWithRetry(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.body) {
    throw new AIProviderError(config.provider, 'No response body');
  }

  const provider = config.provider;

  return new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });

          if (provider === 'anthropic') {
            const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));
            for (const line of lines) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: parsed.delta.text })}\n\n`));
                }
              } catch { /* skip */ }
            }
          } else if (provider === 'google') {
            const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));
            for (const line of lines) {
              const data = line.slice(6);
              try {
                const parsed = JSON.parse(data);
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: text })}\n\n`));
                }
              } catch { /* skip */ }
            }
          } else {
            const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));
            for (const line of lines) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              } catch { /* skip */ }
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });
}

export async function chat(messages: AIMessage[], options: AIOptions = {}): Promise<AIResponse> {
  await rateLimiter.enforce('ai:chat', 30, 60_000);

  try {
    return await callProvider(messages, options);
  } catch (error) {
    if (error instanceof RateLimitError || error instanceof AIProviderError) throw error;
    throw new AIProviderError('ai', (error as Error).message || 'Request failed', error);
  }
}

export async function generate(prompt: string, options: AIOptions = {}): Promise<AIResponse> {
  return chat([{ role: 'user', content: prompt }], options);
}

export async function chatStream(
  messages: AIMessage[],
  options: AIOptions = {}
): Promise<ReadableStream<Uint8Array>> {
  await rateLimiter.enforce('ai:chat', 30, 60_000);

  try {
    return await callProviderStream(messages, options);
  } catch (error) {
    if (error instanceof RateLimitError || error instanceof AIProviderError) throw error;
    throw new AIProviderError('ai', (error as Error).message || 'Stream failed', error);
  }
}

export function countTokens(text: string): number {
  return estimateTokens(text);
}

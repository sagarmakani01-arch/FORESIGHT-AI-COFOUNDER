import { AIProviderError, RateLimitError } from '../errors';
import { rateLimiter } from '../rate-limiter';

export type AIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type AIOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
};

export type AIResponse = {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

type ProviderType = 'openai' | 'anthropic' | 'gemini' | 'ollama';

interface ProviderConfig {
  type: ProviderType;
  apiKey: string;
  baseUrl: string;
  models: string[];
  rateLimitKey: string;
}

const PROVIDER_CONFIGS: Record<ProviderType, ProviderConfig> = {
  openai: {
    type: 'openai',
    apiKey: process.env.OPENAI_API_KEY || '',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo', 'o1', 'o3-mini'],
    rateLimitKey: 'openai',
  },
  anthropic: {
    type: 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    baseUrl: 'https://api.anthropic.com',
    models: ['claude-sonnet-4-20250514', 'claude-opus-4-20250514', 'claude-3-5-haiku-20241022', 'claude-3-haiku-20240307'],
    rateLimitKey: 'anthropic',
  },
  gemini: {
    type: 'gemini',
    apiKey: process.env.GOOGLE_AI_API_KEY || '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    rateLimitKey: 'gemini',
  },
  ollama: {
    type: 'ollama',
    apiKey: 'ollama',
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
    models: ['llama3.2', 'qwen2.5-coder', 'deepseek-coder', 'qwen2.5'],
    rateLimitKey: 'ollama',
  },
};

const DEFAULT_MODEL = process.env.AI_MODEL || 'llama3.2';

function detectProvider(modelName: string): ProviderType {
  const lower = modelName.toLowerCase();
  if (lower.startsWith('claude') || lower.startsWith('anthropic')) return 'anthropic';
  if (lower.startsWith('gemini') || lower.startsWith('google')) return 'gemini';
  if (
    lower.startsWith('llama') ||
    lower.startsWith('qwen') ||
    lower.startsWith('deepseek') ||
    lower.startsWith('gemma') ||
    lower.startsWith('phi') ||
    lower.startsWith('mistral') ||
    lower.startsWith('codellama') ||
    lower.startsWith('llava')
  ) {
    return 'ollama';
  }
  return 'openai';
}

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

async function callOpenAI(
  messages: AIMessage[],
  options: AIOptions,
  provider: ProviderConfig
): Promise<{ content: string; usage: AIResponse['usage'] }> {
  const model = options.model || 'gpt-4o';
  const body = {
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 4096,
    stream: false,
  };

  const response = await fetchWithRetry(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  const choice = data.choices?.[0];
  if (!choice?.message?.content) {
    throw new AIProviderError('openai', 'No content in response', data);
  }

  return {
    content: choice.message.content,
    usage: {
      promptTokens: data.usage?.prompt_tokens ?? estimateTokens(messages.map((m) => m.content).join('')),
      completionTokens: data.usage?.completion_tokens ?? estimateTokens(choice.message.content),
      totalTokens: data.usage?.total_tokens ?? 0,
    },
  };
}

async function callOpenAIStream(
  messages: AIMessage[],
  options: AIOptions,
  provider: ProviderConfig
): Promise<ReadableStream<Uint8Array>> {
  const model = options.model || 'gpt-4o';
  const body = {
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 4096,
    stream: true,
  };

  const response = await fetchWithRetry(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.body) {
    throw new AIProviderError('openai', 'No response body');
  }

  return new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
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
            } catch {
              // skip invalid JSON lines
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });
}

async function callAnthropic(
  messages: AIMessage[],
  options: AIOptions,
  provider: ProviderConfig
): Promise<{ content: string; usage: AIResponse['usage'] }> {
  const model = options.model || 'claude-sonnet-4-20250514';
  const systemMsg = messages.find((m) => m.role === 'system');
  const nonSystemMsgs = messages.filter((m) => m.role !== 'system');

  const body = {
    model,
    system: systemMsg?.content || '',
    messages: nonSystemMsgs.map((m) => ({ role: m.role, content: m.content })),
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 4096,
  };

  const response = await fetchWithRetry(`${provider.baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': provider.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  const textBlock = data.content?.find((b: { type: string }) => b.type === 'text');
  if (!textBlock?.text) {
    throw new AIProviderError('anthropic', 'No content in response', data);
  }

  return {
    content: textBlock.text,
    usage: {
      promptTokens: data.usage?.input_tokens ?? estimateTokens(messages.map((m) => m.content).join('')),
      completionTokens: data.usage?.output_tokens ?? estimateTokens(textBlock.text),
      totalTokens: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
    },
  };
}

async function callAnthropicStream(
  messages: AIMessage[],
  options: AIOptions,
  provider: ProviderConfig
): Promise<ReadableStream<Uint8Array>> {
  const model = options.model || 'claude-sonnet-4-20250514';
  const systemMsg = messages.find((m) => m.role === 'system');
  const nonSystemMsgs = messages.filter((m) => m.role !== 'system');

  const body = {
    model,
    system: systemMsg?.content || '',
    messages: nonSystemMsgs.map((m) => ({ role: m.role, content: m.content })),
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 4096,
    stream: true,
  };

  const response = await fetchWithRetry(`${provider.baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': provider.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!response.body) {
    throw new AIProviderError('anthropic', 'No response body');
  }

  return new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));
          for (const line of lines) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: parsed.delta.text })}\n\n`));
              }
            } catch {
              // skip invalid JSON lines
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });
}

async function callGemini(
  messages: AIMessage[],
  options: AIOptions,
  provider: ProviderConfig
): Promise<{ content: string; usage: AIResponse['usage'] }> {
  const model = options.model || 'gemini-2.0-flash';
  const systemMsg = messages.find((m) => m.role === 'system');
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 4096,
    },
  };

  if (systemMsg?.content) {
    body.systemInstruction = { parts: [{ text: systemMsg.content }] };
  }

  const url = `${provider.baseUrl}/models/${model}:generateContent?key=${provider.apiKey}`;
  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new AIProviderError('gemini', 'No content in response', data);
  }

  const usage = data.usageMetadata;
  return {
    content: text,
    usage: {
      promptTokens: usage?.promptTokenCount ?? estimateTokens(messages.map((m) => m.content).join('')),
      completionTokens: usage?.candidatesTokenCount ?? estimateTokens(text),
      totalTokens: usage?.totalTokenCount ?? 0,
    },
  };
}

async function callGeminiStream(
  messages: AIMessage[],
  options: AIOptions,
  provider: ProviderConfig
): Promise<ReadableStream<Uint8Array>> {
  const model = options.model || 'gemini-2.0-flash';
  const systemMsg = messages.find((m) => m.role === 'system');
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 4096,
    },
  };

  if (systemMsg?.content) {
    body.systemInstruction = { parts: [{ text: systemMsg.content }] };
  }

  const url = `${provider.baseUrl}/models/${model}:streamGenerateContent?key=${provider.apiKey}&alt=sse`;
  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.body) {
    throw new AIProviderError('gemini', 'No response body');
  }

  return new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));
          for (const line of lines) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (content) {
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
            } catch {
              // skip invalid JSON lines
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });
}

const STREAM_CALLERS: Record<ProviderType, typeof callOpenAIStream> = {
  openai: callOpenAIStream,
  anthropic: callAnthropicStream,
  gemini: callGeminiStream,
  ollama: callOpenAIStream,
};

const NON_STREAM_CALLERS: Record<ProviderType, typeof callOpenAI> = {
  openai: callOpenAI,
  anthropic: callAnthropic,
  gemini: callGemini,
  ollama: callOpenAI,
};

export async function chat(messages: AIMessage[], options: AIOptions = {}): Promise<AIResponse> {
  const model = options.model || DEFAULT_MODEL;
  const providerType = detectProvider(model);
  const provider = PROVIDER_CONFIGS[providerType];

  if (providerType !== 'ollama' && !provider.apiKey) {
    throw new AIProviderError(providerType, `API key not configured for ${providerType}`);
  }

  await rateLimiter.enforce(`ai:${providerType}`, 20, 60_000);

  const caller = NON_STREAM_CALLERS[providerType];
  try {
    return await caller(messages, options, provider);
  } catch (error) {
    if (error instanceof RateLimitError || error instanceof AIProviderError) throw error;
    throw new AIProviderError(providerType, (error as Error).message || 'Request failed', error);
  }
}

export async function generate(prompt: string, options: AIOptions = {}): Promise<AIResponse> {
  return chat([{ role: 'user', content: prompt }], options);
}

export async function chatStream(
  messages: AIMessage[],
  options: AIOptions = {}
): Promise<ReadableStream<Uint8Array>> {
  const model = options.model || DEFAULT_MODEL;
  const providerType = detectProvider(model);
  const provider = PROVIDER_CONFIGS[providerType];

  if (providerType !== 'ollama' && !provider.apiKey) {
    throw new AIProviderError(providerType, `API key not configured for ${providerType}`);
  }

  await rateLimiter.enforce(`ai:${providerType}`, 20, 60_000);

  const caller = STREAM_CALLERS[providerType];
  try {
    return await caller(messages, options, provider);
  } catch (error) {
    if (error instanceof RateLimitError || error instanceof AIProviderError) throw error;
    throw new AIProviderError(providerType, (error as Error).message || 'Stream failed', error);
  }
}

export async function embed(texts: string[], model?: string): Promise<number[][]> {
  const providerType = model ? detectProvider(model) : 'openai';
  const provider = PROVIDER_CONFIGS[providerType];

  if (providerType !== 'ollama' && !provider.apiKey) {
    throw new AIProviderError(providerType, `API key not configured for ${providerType}`);
  }

  if (providerType === 'openai') {
    const response = await fetchWithRetry(`${provider.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'text-embedding-3-small',
        input: texts,
      }),
    });
    const data = await response.json();
    return data.data.map((d: { embedding: number[] }) => d.embedding);
  }

  throw new AIProviderError(providerType, `Embedding not supported for ${providerType}`);
}

export function countTokens(text: string): number {
  return estimateTokens(text);
}

import { chat, chatStream, type AIMessage, type AIOptions } from './provider';
import { getSystemPrompt, type AIMode } from './prompts';
import { buildContext, updateMemoryFromConversation } from './memory';
import { Company } from '@/types';
import { generateId } from '../utils';

interface ConversationMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface BuildSystemPromptOptions {
  company?: Company | null;
  conversationHistory?: ConversationMessage[];
  mode?: AIMode;
  customContext?: string;
}

export function buildSystemPrompt(options: BuildSystemPromptOptions): string {
  const { company, conversationHistory, mode = 'cofounder', customContext } = options;
  const parts: string[] = [];

  parts.push(getSystemPrompt(mode));

  if (company) {
    parts.push(`\n## Company Context\n\nYou are advising ${company.name}.`);
    parts.push(`Industry: ${company.industry}`);
    parts.push(`Stage: ${company.stage}`);
    parts.push(`Team Size: ${company.teamSize}`);
    if (company.location) parts.push(`Location: ${company.location}`);
    if (company.vision) parts.push(`Vision: ${company.vision}`);
    if (company.mission) parts.push(`Mission: ${company.mission}`);
    if (company.description) parts.push(`Description: ${company.description}`);
  }

  if (company?.id) {
    const memoryContext = buildContext(company.id);
    if (memoryContext) {
      parts.push(`\n${memoryContext}`);
    }
  }

  if (conversationHistory && conversationHistory.length > 0) {
    const recentHistory = conversationHistory.slice(-20);
    parts.push(`\n## Recent Conversation`);
    for (const msg of recentHistory) {
      const label = msg.role === 'user' ? 'User' : 'Assistant';
      parts.push(`**${label}**: ${msg.content.substring(0, 500)}${msg.content.length > 500 ? '...' : ''}`);
    }
  }

  if (customContext) {
    parts.push(`\n## Additional Context\n${customContext}`);
  }

  return parts.join('\n');
}

export async function generateResponse(
  messages: AIMessage[],
  options: AIOptions = {}
): Promise<{ content: string; usage: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
  return chat(messages, {
    model: options.model || 'gpt-4o',
    temperature: options.temperature ?? 0.7,
    maxTokens: options.maxTokens ?? 4096,
  });
}

export async function streamResponse(
  messages: AIMessage[],
  options: AIOptions = {}
): Promise<ReadableStream<Uint8Array>> {
  return chatStream(messages, {
    model: options.model || 'gpt-4o',
    temperature: options.temperature ?? 0.7,
    maxTokens: options.maxTokens ?? 4096,
    stream: true,
  });
}

interface ReasoningStep {
  step: number;
  label: string;
  content: string;
}

export function processReasoningSteps(content: string): { steps: ReasoningStep[]; cleanedContent: string } {
  const steps: ReasoningStep[] = [];
  let cleanedContent = content;

  const stepPatterns = [
    /(?:step\s+(\d+))[:\s]+(.+?)(?=step\s+\d+|$)/gi,
    /(?:\d+\.\s+)(.+?)(?=\d+\.|$)/g,
    /(?:\*\*step\s+\d+\*\*)[:\s]+(.+?)(?=\*\*step|$)/gi,
    /(?:thinking|reasoning|analysis)[:\s]+(.+?)(?=##|$)/gi,
  ];

  let stepCounter = 1;

  for (const pattern of stepPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const stepContent = (match[2] || match[1] || '').trim();
      if (stepContent.length > 10) {
        steps.push({
          step: stepCounter++,
          label: `Step ${stepCounter - 1}`,
          content: stepContent.substring(0, 200),
        });
      }
    }
  }

  cleanedContent = cleanedContent
    .replace(/(?:step\s+\d+)[:\s]+/gi, '')
    .replace(/(?:\*\*step\s+\d+\*\*)[:\s]+/gi, '')
    .replace(/(?:thinking|reasoning|analysis)[:\s]+/gi, '')
    .trim();

  return { steps, cleanedContent };
}

const conversationStore = new Map<string, ConversationMessage[]>();

export async function saveConversation(
  userId: string,
  companyId: string,
  messages: ConversationMessage[]
): Promise<void> {
  const key = `${userId}:${companyId}`;
  conversationStore.set(key, messages);

  updateMemoryFromConversation(
    companyId,
    messages.map((m) => ({ role: m.role, content: m.content }))
  );
}

export function getConversation(userId: string, companyId: string): ConversationMessage[] {
  const key = `${userId}:${companyId}`;
  return conversationStore.get(key) || [];
}

export function createMessage(role: 'user' | 'assistant', content: string): ConversationMessage {
  return {
    id: generateId(),
    role,
    content,
    timestamp: new Date().toISOString(),
  };
}

export async function chatWithCompany(
  companyId: string,
  userId: string,
  userMessage: string,
  mode: AIMode = 'cofounder',
  company?: Company | null
): Promise<{ response: string; steps: ReasoningStep[] }> {
  const history = getConversation(userId, companyId);
  const systemPrompt = buildSystemPrompt({ company, conversationHistory: history, mode });

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-20).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ];

  const aiResponse = await generateResponse(messages);
  const { steps, cleanedContent } = processReasoningSteps(aiResponse.content);

  const userMsg = createMessage('user', userMessage);
  const assistantMsg = createMessage('assistant', aiResponse.content);

  const updatedHistory = [...history, userMsg, assistantMsg];
  await saveConversation(userId, companyId, updatedHistory);

  return { response: cleanedContent, steps };
}

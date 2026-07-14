import { generateId } from '../utils';
import { DatabaseError } from '../errors';

export type MemoryType =
  | 'company_facts'
  | 'decisions'
  | 'preferences'
  | 'goals'
  | 'people'
  | 'products'
  | 'technical';

export interface MemoryEntry {
  id: string;
  companyId: string;
  type: MemoryType;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

const memoryStore = new Map<string, MemoryEntry[]>();

function getStorageKey(companyId: string): string {
  return `memories:${companyId}`;
}

export function getMemory(companyId: string, type?: MemoryType): MemoryEntry[] {
  const entries = memoryStore.get(getStorageKey(companyId)) || [];
  if (type) {
    return entries.filter((e) => e.type === type);
  }
  return [...entries];
}

export function setMemory(
  companyId: string,
  key: string,
  value: string,
  type: MemoryType = 'company_facts'
): MemoryEntry {
  const entries = memoryStore.get(getStorageKey(companyId)) || [];
  const existing = entries.find((e) => e.key === key && e.type === type);

  const now = new Date().toISOString();

  if (existing) {
    existing.value = value;
    existing.updatedAt = now;
    memoryStore.set(getStorageKey(companyId), entries);
    return existing;
  }

  const entry: MemoryEntry = {
    id: generateId(),
    companyId,
    type,
    key,
    value,
    createdAt: now,
    updatedAt: now,
  };

  entries.push(entry);
  memoryStore.set(getStorageKey(companyId), entries);
  return entry;
}

export function deleteMemory(companyId: string, key: string): boolean {
  const entries = memoryStore.get(getStorageKey(companyId)) || [];
  const idx = entries.findIndex((e) => e.key === key);
  if (idx === -1) return false;
  entries.splice(idx, 1);
  memoryStore.set(getStorageKey(companyId), entries);
  return true;
}

export function searchMemory(companyId: string, query: string): MemoryEntry[] {
  const entries = memoryStore.get(getStorageKey(companyId)) || [];
  const lowerQuery = query.toLowerCase();
  const queryTerms = lowerQuery.split(/\s+/).filter(Boolean);

  return entries
    .map((entry) => {
      let score = 0;
      const keyLower = entry.key.toLowerCase();
      const valueLower = entry.value.toLowerCase();
      const combined = `${keyLower} ${valueLower}`;

      for (const term of queryTerms) {
        if (keyLower.includes(term)) score += 2;
        if (valueLower.includes(term)) score += 1;
      }

      if (combined === lowerQuery) score += 10;

      return { entry, score };
    })
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((e) => e.entry);
}

export function buildContext(companyId: string): string {
  const entries = getMemory(companyId);
  if (entries.length === 0) return '';

  const grouped = entries.reduce(
    (acc, entry) => {
      if (!acc[entry.type]) acc[entry.type] = [];
      acc[entry.type].push(entry);
      return acc;
    },
    {} as Record<MemoryType, MemoryEntry[]>
  );

  const typeLabels: Record<MemoryType, string> = {
    company_facts: 'Company Facts',
    decisions: 'Past Decisions',
    preferences: 'Preferences',
    goals: 'Goals & Objectives',
    people: 'People & Contacts',
    products: 'Products & Features',
    technical: 'Technical Details',
  };

  const lines: string[] = ['## Stored Context'];

  for (const [type, typeEntries] of Object.entries(grouped)) {
    lines.push(`\n### ${typeLabels[type as MemoryType] || type}`);
    for (const entry of typeEntries) {
      lines.push(`- **${entry.key}**: ${entry.value}`);
    }
  }

  return lines.join('\n');
}

function extractFactsFromMessage(content: string): Array<{ key: string; value: string; type: MemoryType }> {
  const facts: Array<{ key: string; value: string; type: MemoryType }> = [];
  const sentences = content.split(/[.!?\n]+/).filter((s) => s.trim().length > 10);

  const decisionPatterns = [
    /(?:we decided|decided to|going with|chosen|selected|picked|will use|going to use|i want to|i plan to|i intend to|i will)\s+(.+)/i,
  ];

  const goalPatterns = [
    /(?:goal|objective|target|aim|want to achieve|plan to reach|strive for)\s+(.+)/i,
    /(?:need to|must|should|have to)\s+(.+)/i,
  ];

  const personPatterns = [
    /(?:my name is|i'm|i am|founder|cto|ceo|coo|cmo|head of|lead|manager|director)\s+(.+)/i,
    /(?:contact|reach out|email|phone)\s+(.+)/i,
  ];

  const productPatterns = [
    /(?:our product|our app|our platform|our tool|the product|the app|the platform|building|feature|functionality)\s+(.+)/i,
  ];

  const techPatterns = [
    /(?:using|using|built with|tech stack|framework|database|api|architecture|deploy)\s+(.+)/i,
  ];

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length < 15) continue;

    for (const pattern of decisionPatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        facts.push({ key: 'Decision', value: match[1].trim().substring(0, 200), type: 'decisions' });
      }
    }

    for (const pattern of goalPatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        facts.push({ key: 'Goal', value: match[1].trim().substring(0, 200), type: 'goals' });
      }
    }

    for (const pattern of personPatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        facts.push({ key: 'Person', value: match[1].trim().substring(0, 200), type: 'people' });
      }
    }

    for (const pattern of productPatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        facts.push({ key: 'Product', value: match[1].trim().substring(0, 200), type: 'products' });
      }
    }

    for (const pattern of techPatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        facts.push({ key: 'Technical', value: match[1].trim().substring(0, 200), type: 'technical' });
      }
    }
  }

  return facts;
}

export function updateMemoryFromConversation(
  companyId: string,
  messages: Array<{ role: string; content: string }>
): number {
  let stored = 0;

  for (const message of messages) {
    if (message.role !== 'user') continue;
    const facts = extractFactsFromMessage(message.content);
    for (const fact of facts) {
      const existing = searchMemory(companyId, fact.key);
      const isDuplicate = existing.some(
        (e) => e.key === fact.key && e.value.toLowerCase() === fact.value.toLowerCase()
      );
      if (!isDuplicate) {
        setMemory(companyId, fact.key, fact.value, fact.type);
        stored++;
      }
    }
  }

  return stored;
}

export function clearMemory(companyId: string): void {
  memoryStore.delete(getStorageKey(companyId));
}

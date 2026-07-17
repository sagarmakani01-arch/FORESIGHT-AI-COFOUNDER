import { chat, type AIMessage } from './provider';
import { Company } from '@/types';

interface PitchDeckData {
  companyName: string;
  tagline: string;
  problem: string;
  solution: string;
  marketSize: string;
  businessModel: string;
  traction: string;
  team: string;
  financials: string;
  ask: string;
}

interface BusinessPlanData {
  executiveSummary: string;
  marketAnalysis: string;
  products: string;
  marketingStrategy: string;
  operationsPlan: string;
  managementTeam: string;
  financialPlan: string;
  fundingRequirements: string;
}

interface SWOTData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface LeanCanvas {
  problem: string[];
  solution: string[];
  keyMetrics: string[];
  uniqueValueProposition: string;
  unfairAdvantage: string;
  channels: string[];
  customerSegments: string[];
  costStructure: string[];
  revenueStreams: string[];
}

interface _FinancialProjection {
  year: number;
  revenue: number;
  expenses: number;
  profit: number;
  headcount: number;
  burnRate: number;
  runway: number;
}

interface GoToMarketData {
  targetMarket: string;
  positioning: string;
  pricingStrategy: string;
  channels: string[];
  launchPlan: string[];
  metrics: string[];
}

interface CompetitorData {
  name: string;
  features: string[];
  pricing: string;
  strengths: string[];
  weaknesses: string[];
}

interface HiringPlanData {
  roles: Array<{
    title: string;
    department: string;
    priority: 'high' | 'medium' | 'low';
    timeline: string;
    salary: number;
    rationale: string;
  }>;
  totalBudget: number;
  hiringTimeline: string;
}

interface InvestorMemoData {
  executiveSummary: string;
  investmentHighlights: string[];
  marketOpportunity: string;
  businessModel: string;
  competitiveLandscape: string;
  financialHighlights: string;
  teamAssessment: string;
  riskFactors: string[];
  exitStrategy: string;
}

interface PRDData {
  productName: string;
  vision: string;
  goals: string[];
  userStories: string[];
  features: Array<{
    name: string;
    description: string;
    priority: 'must-have' | 'should-have' | 'could-have' | 'won\'t-have';
    effort: string;
  }>;
  technicalRequirements: string[];
  successMetrics: string[];
  timeline: string;
}

function buildMessages(systemPrompt: string, userPrompt: string): AIMessage[] {
  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
}

async function generateStructured<T>(systemPrompt: string, userPrompt: string): Promise<T> {
  const messages = buildMessages(systemPrompt, userPrompt);
  const response = await chat(messages, { temperature: 0.3, maxTokens: 8192 });

  let content = response.content.trim();
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    content = jsonMatch[1].trim();
  }

  try {
    return JSON.parse(content) as T;
  } catch {
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      return JSON.parse(content.substring(start, end + 1)) as T;
    }
    throw new Error('Failed to parse AI response as JSON');
  }
}

export async function generatePitchDeck(
  company: Company,
  data: PitchDeckData
): Promise<Record<string, unknown>> {
  const systemPrompt = `You are an expert pitch deck creator. Generate a structured JSON pitch deck with exactly 10 slides. Each slide should have "title" and "content" fields. Return valid JSON only.`;

  const userPrompt = `Create a pitch deck for ${company.name} (${company.industry}, ${company.stage}).

Company data:
- Tagline: ${data.tagline}
- Problem: ${data.problem}
- Solution: ${data.solution}
- Market Size: ${data.marketSize}
- Business Model: ${data.businessModel}
- Traction: ${data.traction}
- Team: ${data.team}
- Financials: ${data.financials}
- Ask: ${data.ask}

Return JSON with "slides" array containing 10 slides, each with "title" and "content" fields. Also include a "companyName" field.`;

  return generateStructured<Record<string, unknown>>(systemPrompt, userPrompt);
}

export async function generateBusinessPlan(
  company: Company,
  data: BusinessPlanData
): Promise<Record<string, unknown>> {
  const systemPrompt = `You are an expert business plan writer. Generate a comprehensive business plan as structured JSON. Include all standard business plan sections with detailed content.`;

  const userPrompt = `Write a business plan for ${company.name}.

Data:
- Executive Summary: ${data.executiveSummary}
- Market Analysis: ${data.marketAnalysis}
- Products/Services: ${data.products}
- Marketing Strategy: ${data.marketingStrategy}
- Operations Plan: ${data.operationsPlan}
- Management Team: ${data.managementTeam}
- Financial Plan: ${data.financialPlan}
- Funding Requirements: ${data.fundingRequirements}

Return JSON with fields: executiveSummary, companyOverview, marketAnalysis, products, marketingStrategy, operationsPlan, managementTeam, financialPlan, fundingRequirements, appendix. Each should have "title" and "content" fields.`;

  return generateStructured<Record<string, unknown>>(systemPrompt, userPrompt);
}

export async function generateSWOT(
  company: Company,
  competitors: CompetitorData[]
): Promise<SWOTData> {
  const systemPrompt = `You are a strategic analyst. Generate a SWOT analysis as structured JSON with arrays for strengths, weaknesses, opportunities, and threats.`;

  const competitorInfo = competitors
    .map(
      (c) =>
        `${c.name}: Features: ${c.features.join(', ')}. Pricing: ${c.pricing}. Strengths: ${c.strengths.join(', ')}. Weaknesses: ${c.weaknesses.join(', ')}.`
    )
    .join('\n');

  const userPrompt = `Conduct a SWOT analysis for ${company.name} (${company.industry}, ${company.stage}).

Company description: ${company.description}
Vision: ${company.vision}
Mission: ${company.mission}

Competitors:
${competitorInfo || 'No competitor data available.'}

Return JSON with: { strengths: string[], weaknesses: string[], opportunities: string[], threats: string[] }. Each array should have 5-7 items.`;

  return generateStructured<SWOTData>(systemPrompt, userPrompt);
}

export async function generateLeanCanvas(
  company: Company
): Promise<LeanCanvas> {
  const systemPrompt = `You are a lean startup expert. Generate a Lean Canvas as structured JSON with all 9 blocks. Each block should be an array of 2-4 key items.`;

  const userPrompt = `Create a Lean Canvas for ${company.name}.

Industry: ${company.industry}
Stage: ${company.stage}
Description: ${company.description}
Vision: ${company.vision}
Mission: ${company.mission}

Return JSON with: { problem: string[], solution: string[], keyMetrics: string[], uniqueValueProposition: string, unfairAdvantage: string, channels: string[], customerSegments: string[], costStructure: string[], revenueStreams: string[] }.`;

  return generateStructured<LeanCanvas>(systemPrompt, userPrompt);
}

export async function generateFinancialModel(
  company: Company,
  financeData: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const systemPrompt = `You are a financial modeling expert. Generate a 5-year financial projection as structured JSON with detailed yearly breakdowns.`;

  const userPrompt = `Create a financial model for ${company.name}.

Industry: ${company.industry}
Stage: ${company.stage}
Current financials: ${JSON.stringify(financeData)}

Return JSON with:
{
  "projections": [{ year, revenue, expenses, profit, headcount, burnRate, runway }],
  "assumptions": string[],
  "keyMetrics": { monthlyBurn, runway, breakEvenMonth, year1Revenue, year3Revenue, year5Revenue },
  "scenarios": { best: {...}, base: {...}, worst: {...} }
}

Include realistic growth rates for the ${company.industry} industry at ${company.stage} stage.`;

  return generateStructured<Record<string, unknown>>(systemPrompt, userPrompt);
}

export async function generateGoToMarket(
  company: Company,
  marketData: Record<string, unknown>
): Promise<GoToMarketData> {
  const systemPrompt = `You are a go-to-market strategist. Generate a comprehensive GTM strategy as structured JSON.`;

  const userPrompt = `Create a go-to-market strategy for ${company.name}.

Industry: ${company.industry}
Stage: ${company.stage}
Description: ${company.description}
Market data: ${JSON.stringify(marketData)}

Return JSON with: { targetMarket, positioning, pricingStrategy, channels: string[], launchPlan: string[], metrics: string[], budget, timeline }.`;

  return generateStructured<GoToMarketData>(systemPrompt, userPrompt);
}

export async function generateCompetitorAnalysis(
  company: Company,
  competitors: CompetitorData[]
): Promise<Record<string, unknown>> {
  const systemPrompt = `You are a competitive intelligence analyst. Generate a detailed competitor analysis matrix as structured JSON.`;

  const userPrompt = `Analyze competitors for ${company.name} (${company.industry}).

Company: ${company.description}
Competitors: ${JSON.stringify(competitors)}

Return JSON with:
{
  "matrix": [{ name, marketShare, pricing, features, strengths, weaknesses, threatLevel }],
  "positioning": { company: { x, y }, competitors: [{ name, x, y }] },
  "recommendations": string[],
  "differentiationOpportunities": string[]
}`;

  return generateStructured<Record<string, unknown>>(systemPrompt, userPrompt);
}

export async function generateHiringPlan(
  company: Company,
  goals: Record<string, unknown>
): Promise<HiringPlanData> {
  const systemPrompt = `You are an HR and talent strategy expert. Generate a hiring plan as structured JSON with detailed role breakdowns.`;

  const userPrompt = `Create a hiring plan for ${company.name}.

Industry: ${company.industry}
Stage: ${company.stage}
Team size: ${company.teamSize}
Goals: ${JSON.stringify(goals)}

Return JSON with:
{
  "roles": [{ title, department, priority, timeline, salary, rationale }],
  "totalBudget": number,
  "hiringTimeline": string,
  "cultureValues": string[],
  "hiringProcess": string[]
}

Include 5-8 key roles for a ${company.stage} stage company.`;

  return generateStructured<HiringPlanData>(systemPrompt, userPrompt);
}

export async function generateInvestorMemo(
  company: Company,
  metrics: Record<string, unknown>
): Promise<InvestorMemoData> {
  const systemPrompt = `You are an investment analyst. Generate a comprehensive investor memo as structured JSON that would be presented to potential investors.`;

  const userPrompt = `Write an investor memo for ${company.name}.

Industry: ${company.industry}
Stage: ${company.stage}
Description: ${company.description}
Metrics: ${JSON.stringify(metrics)}

Return JSON with:
{
  "executiveSummary": string,
  "investmentHighlights": string[],
  "marketOpportunity": string,
  "businessModel": string,
  "competitiveLandscape": string,
  "financialHighlights": string,
  "teamAssessment": string,
  "riskFactors": string[],
  "exitStrategy": string,
  "valuationConsiderations": string
}`;

  return generateStructured<InvestorMemoData>(systemPrompt, userPrompt);
}

export async function generateProductRequirements(
  company: Company,
  vision: string
): Promise<PRDData> {
  const systemPrompt = `You are a product management expert. Generate a comprehensive Product Requirements Document (PRD) as structured JSON.`;

  const userPrompt = `Create a PRD for ${company.name}.

Product vision: ${vision}
Industry: ${company.industry}
Stage: ${company.stage}
Description: ${company.description}

Return JSON with:
{
  "productName": string,
  "vision": string,
  "goals": string[],
  "userStories": string[],
  "features": [{ name, description, priority, effort }],
  "technicalRequirements": string[],
  "successMetrics": string[],
  "timeline": string,
  "dependencies": string[],
  "risks": string[]
}

Include 8-12 features with MoSCoW prioritization.`;

  return generateStructured<PRDData>(systemPrompt, userPrompt);
}

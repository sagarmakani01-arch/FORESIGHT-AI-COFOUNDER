import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

async function getAuthUserId() {
  const session = await getServerSession();
  if (!session?.user) return null;
  return (session.user as { id: string }).id;
}

type GenerateType =
  | "pitch-deck"
  | "business-plan"
  | "swot"
  | "lean-canvas"
  | "financial-model"
  | "go-to-market"
  | "competitive-analysis"
  | "user-personas"
  | "okr-framework"
  | "elevator-pitch";

interface GenerationResult {
  type: GenerateType;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
}

async function generateContent(
  type: GenerateType,
  context: string,
  companyName: string,
  industry: string
): Promise<GenerationResult> {
  const generators: Record<GenerateType, () => GenerationResult> = {
    "pitch-deck": () => ({
      type: "pitch-deck",
      title: `${companyName} - Investor Pitch Deck`,
      content: `# ${companyName} Pitch Deck\n\n## 1. Problem\n${context || "Identifying a significant pain point in the market that affects millions of users."}\n\n## 2. Solution\n${companyName} provides an innovative solution that addresses this problem through technology and design excellence.\n\n## 3. Market Size\n- TAM: $50B+\n- SAM: $10B\n- SOM: $500M (Year 3)\n\n## 4. Product\n- Core features that differentiate from competitors\n- AI-powered capabilities\n- Mobile-first approach\n\n## 5. Traction\n- Key metrics and growth indicators\n- Customer testimonials\n- Revenue milestones\n\n## 6. Business Model\n- Revenue streams and pricing strategy\n- Unit economics\n- Path to profitability\n\n## 7. Team\n- Founders and key hires\n- Advisory board\n- Key technical capabilities\n\n## 8. Financials\n- Revenue projections (3 years)\n- Expense forecast\n- Funding requirements\n\n## 9. Ask\n- Funding amount: $[Amount]\n- Use of funds breakdown\n- Expected milestones`,
      metadata: { slides: 9, estimatedDuration: "10-15 minutes" },
    }),
    "business-plan": () => ({
      type: "business-plan",
      title: `${companyName} - Business Plan`,
      content: `# ${companyName} Business Plan\n\n## Executive Summary\n${companyName} is a ${industry} company focused on delivering innovative solutions.\n\n## Company Description\n- Mission: To innovate in the ${industry} space\n- Vision: To become a market leader\n- Legal structure: Private Limited Company\n\n## Market Analysis\n### Industry Overview\nThe ${industry} industry is experiencing rapid growth with increasing demand for innovative solutions.\n\n### Target Market\n- Primary: Tech-savvy consumers and businesses\n- Secondary: Traditional industries undergoing digital transformation\n\n### Competitive Landscape\n- Direct competitors: 5-10 established players\n- Indirect competitors: Adjacent industries\n- Differentiation: AI-first approach, superior UX\n\n## Organization & Management\n- Founding team with complementary skills\n- Advisory board with industry expertise\n- Hiring plan for next 12 months\n\n## Products & Services\n- Core product offering\n- Feature roadmap\n- Intellectual property strategy\n\n## Marketing & Sales\n- Go-to-market strategy\n- Customer acquisition channels\n- Pricing strategy\n\n## Financial Projections\n- Year 1: $[X] revenue\n- Year 2: $[X] revenue (2x growth)\n- Year 3: $[X] revenue (3x growth)\n\n## Funding Requirements\n- Total funding needed: $[X]\n- Use of funds\n- Expected ROI`,
      metadata: { sections: 10, estimatedPages: 25 },
    }),
    swot: () => ({
      type: "swot",
      title: `${companyName} - SWOT Analysis`,
      content: `# SWOT Analysis - ${companyName}\n\n## Strengths\n- Strong technical team and AI capabilities\n- First-mover advantage in niche market\n- Scalable technology infrastructure\n- Strong brand vision and mission\n- Lean operational model\n\n## Weaknesses\n- Limited brand awareness compared to established players\n- Smaller team size may limit execution speed\n- Dependency on technology partners\n- Early-stage revenue model\n- Limited geographic presence\n\n## Opportunities\n- Growing market demand for ${industry} solutions\n- Expansion into adjacent markets\n- Strategic partnerships with established brands\n- AI/ML advancements enabling new capabilities\n- Regulatory changes creating new opportunities\n- Underserved customer segments\n\n## Threats\n- Increasing competition from well-funded startups\n- Regulatory uncertainty in key markets\n- Economic downturn affecting customer spending\n- Rapid technology changes requiring constant adaptation\n- Key talent poaching by larger companies\n- Platform dependency risks\n\n## Strategic Implications\n1. Leverage strengths to capture market share\n2. Address weaknesses through strategic hires and partnerships\n3. Capitalize on opportunities with focused investments\n4. Mitigate threats through diversification and risk management`,
      metadata: {
        categories: ["strengths", "weaknesses", "opportunities", "threats"],
        itemsPerCategory: 6,
      },
    }),
    "lean-canvas": () => ({
      type: "lean-canvas",
      title: `${companyName} - Lean Canvas`,
      content: `# Lean Canvas - ${companyName}\n\n## Problem\n- Top 3 problems being solved\n- Existing alternatives in the market\n\n## Solution\n- Key features addressing each problem\n- Unique value proposition\n\n## Key Metrics\n- North star metric\n- Supporting KPIs\n- Leading indicators\n\n## Unique Value Proposition\n- Single clear message\n- High-level concept\n\n## Unfair Advantage\n- What can't be easily copied\n- Proprietary technology or data\n\n## Channels\n- Customer acquisition channels\n- Distribution strategy\n- Partnership opportunities\n\n## Customer Segments\n- Early adopters profile\n- Target customer personas\n- Beachhead market\n\n## Cost Structure\n- Fixed costs\n- Variable costs\n- Key resources needed\n\n## Revenue Streams\n- Primary revenue model\n- Pricing strategy\n- Revenue projections`,
      metadata: { blocks: 9, canvasVersion: "1.0" },
    }),
    "financial-model": () => ({
      type: "financial-model",
      title: `${companyName} - Financial Model`,
      content: `# Financial Model - ${companyName}\n\n## Revenue Projections\n### Year 1\n- Monthly Recurring Revenue (MRR): $[X]\n- Annual Recurring Revenue (ARR): $[X]\n- Revenue Growth Rate: [X]%\n\n### Year 2\n- MRR: $[X]\n- ARR: $[X]\n- Revenue Growth Rate: [X]%\n\n### Year 3\n- MRR: $[X]\n- ARR: $[X]\n- Revenue Growth Rate: [X]%\n\n## Expense Forecast\n### Fixed Costs\n- Salaries & Benefits: $[X]/month\n- Infrastructure: $[X]/month\n- Office & Operations: $[X]/month\n\n### Variable Costs\n- Marketing & Acquisition: $[X]/month\n- Sales Commissions: $[X]/month\n- Customer Support: $[X]/month\n\n## Unit Economics\n- Customer Acquisition Cost (CAC): $[X]\n- Lifetime Value (LTV): $[X]\n- LTV/CAC Ratio: [X]x\n- Payback Period: [X] months\n\n## Cash Flow\n- Monthly Burn Rate: $[X]\n- Current Runway: [X] months\n- Break-even Point: Month [X]\n\n## Funding Requirements\n- Total Needed: $[X]\n- Use of Funds:\n  - Product Development: [X]%\n  - Sales & Marketing: [X]%\n  - Operations: [X]%\n  - Reserve: [X]%`,
      metadata: {
        projections: 36,
        currency: "USD",
        discountRate: "10%",
      },
    }),
    "go-to-market": () => ({
      type: "go-to-market",
      title: `${companyName} - Go-to-Market Strategy`,
      content: `# Go-to-Market Strategy - ${companyName}\n\n## Target Market\n- Primary segment: [Description]\n- Secondary segment: [Description]\n- Buyer personas: [Details]\n\n## Value Proposition\n- Core value proposition\n- Key differentiators\n- Proof points and social proof\n\n## Pricing Strategy\n- Pricing model: [Freemium/Subscription/Usage-based]\n- Price points: [Details]\n- Discounts and promotions\n\n## Sales Channels\n- Direct sales\n- Online/self-service\n- Partner/channel sales\n- Marketplace listings\n\n## Marketing Channels\n- Content marketing\n- SEO/SEM\n- Social media\n- Email marketing\n- Events and conferences\n- PR and media\n\n## Customer Acquisition\n- CAC targets by channel\n- Conversion funnel optimization\n- Lead generation strategy\n\n## Launch Plan\n### Phase 1: Pre-Launch (Month 1-2)\n- Beta testing and feedback\n- Influencer seeding\n- Waitlist building\n\n### Phase 2: Launch (Month 3)\n- Product launch\n- PR blitz\n- Launch event\n\n### Phase 3: Growth (Month 4-6)\n- Scale marketing\n- Optimize conversion\n- Expand channels\n\n## Success Metrics\n- Revenue targets\n- Customer acquisition targets\n- Engagement metrics\n- Retention metrics`,
      metadata: { phases: 3, timeline: "6 months" },
    }),
    "competitive-analysis": () => ({
      type: "competitive-analysis",
      title: `${companyName} - Competitive Analysis`,
      content: `# Competitive Analysis - ${companyName}\n\n## Market Overview\nThe ${industry} market includes several key players with varying strengths and market positions.\n\n## Direct Competitors\n\n### Competitor 1: [Name]\n- **Strengths:** [List]\n- **Weaknesses:** [List]\n- **Market Share:** [X]%\n- **Pricing:** [Details]\n\n### Competitor 2: [Name]\n- **Strengths:** [List]\n- **Weaknesses:** [List]\n- **Market Share:** [X]%\n- **Pricing:** [Details]\n\n### Competitor 3: [Name]\n- **Strengths:** [List]\n- **Weaknesses:** [List]\n- **Market Share:** [X]%\n- **Pricing:** [Details]\n\n## Competitive Positioning\n- Price vs. Value matrix\n- Feature comparison\n- Market positioning map\n\n## Our Competitive Advantages\n1. Technology differentiation\n2. User experience\n3. Pricing model\n4. Customer service\n5. Speed to market\n\n## Barriers to Entry\n- Technology moat\n- Network effects\n- Brand recognition\n- Regulatory requirements\n\n## Opportunities\n- Underserved segments\n- Emerging technologies\n- Partnership potential\n- Market gaps`,
      metadata: { competitors: 3, analysisType: "comprehensive" },
    }),
    "user-personas": () => ({
      type: "user-personas",
      title: `${companyName} - User Personas`,
      content: `# User Personas - ${companyName}\n\n## Persona 1: The Early Adopter\n### Demographics\n- Age: 25-35\n- Role: Tech-savvy professional\n- Income: $60K-$100K\n- Location: Urban areas\n\n### Goals\n- Stay ahead of technology trends\n- Improve productivity\n- Find innovative solutions\n\n### Pain Points\n- Overwhelmed by choices\n- Limited time for research\n- Needs quick, reliable solutions\n\n### Behavior\n- Active on social media\n- Reads tech blogs\n- Early product adopter\n\n### How We Help\n- Simplify complex processes\n- Save time with automation\n- Provide cutting-edge features\n\n## Persona 2: The Decision Maker\n### Demographics\n- Age: 35-50\n- Role: Business leader/Manager\n- Income: $100K-$200K\n- Location: Major cities\n\n### Goals\n- Drive business growth\n- Reduce costs\n- Improve team efficiency\n\n### Pain Points\n- Complex vendor management\n- Budget constraints\n- Need for measurable ROI\n\n### Behavior\n- Data-driven decisions\n- Values reliability\n- Network-focused\n\n### How We Help\n- Clear ROI demonstration\n- Enterprise-grade reliability\n- Dedicated support\n\n## Persona 3: The Enterprise User\n### Demographics\n- Age: 30-45\n- Role: Department head\n- Income: $80K-$150K\n- Location: Global\n\n### Goals\n- Scale operations\n- Ensure compliance\n- Integrate with existing tools\n\n### Pain Points\n- Integration challenges\n- Security concerns\n- Change management\n\n### Behavior\n- Process-oriented\n- Values security\n- Team collaborator\n\n### How We Help\n- Seamless integrations\n- Enterprise security\n- Implementation support`,
      metadata: { personaCount: 3, researchMethod: "hypothetical" },
    }),
    "okr-framework": () => ({
      type: "okr-framework",
      title: `${companyName} - OKR Framework`,
      content: `# OKR Framework - ${companyName}\n\n## Company-Level OKRs (Quarterly)\n\n### Objective 1: Achieve Product-Market Fit\n- KR1: Reach [X] monthly active users\n- KR2: Achieve [X]% week-1 retention\n- KR3: Get NPS score above [X]\n\n### Objective 2: Build Scalable Infrastructure\n- KR1: Achieve 99.9% uptime\n- KR2: Reduce API response time to <200ms\n- KR3: Implement automated testing at [X]% coverage\n\n### Objective 3: Establish Market Presence\n- KR1: Generate $[X] MRR\n- KR2: Acquire [X] paying customers\n- KR3: Achieve [X]% month-over-month growth\n\n## Team-Level OKRs\n\n### Engineering\n- KR1: Ship [X] features per sprint\n- KR2: Reduce bug count by [X]%\n- KR3: Improve deployment frequency\n\n### Product\n- KR1: Complete [X] user interviews\n- KR2: Validate [X] assumptions\n- KR3: Define roadmap for next quarter\n\n### Marketing\n- KR1: Generate [X] leads per month\n- KR2: Achieve [X]% conversion rate\n- KR3: Grow social media following by [X]%\n\n### Sales\n- KR1: Close [X] deals per month\n- KR2: Achieve $[X] average deal size\n- KR3: Maintain [X]% win rate\n\n## Individual OKRs\n- Align with team OKRs\n- Personal development goals\n- Cross-functional collaboration targets\n\n## Review Cadence\n- Weekly: Quick check-ins\n- Monthly: Progress reviews\n- Quarterly: OKR setting and retrospective`,
      metadata: { objectiveCount: 3, teamCount: 4, cadence: "quarterly" },
    }),
    "elevator-pitch": () => ({
      type: "elevator-pitch",
      title: `${companyName} - Elevator Pitch`,
      content: `# Elevator Pitches - ${companyName}\n\n## 30-Second Pitch\n"${companyName} is a ${industry} company that helps [target audience] solve [problem] through [solution]. Unlike existing alternatives, we [unique differentiator], resulting in [key benefit]. We've achieved [traction proof point] and are looking to [next milestone]."\n\n## 60-Second Pitch\n"Every [time period], [target audience] struggles with [pain point]. Current solutions are [problem with existing solutions]. ${companyName} solves this by [solution approach]. Our AI-powered platform [key feature] that delivers [measurable benefit]. We've already [traction metric] and our users report [testimonial/benefit]. With [funding ask], we'll [use of funds] to capture [market opportunity] of the $[TAM] market."\n\n## Investor Pitch\n"${companyName} is addressing the $[TAM] ${industry} market with an AI-powered solution that [core value prop]. Our traction includes [metrics], with [growth rate] month-over-month growth. The founding team brings [relevant experience]. We're raising $[amount] to [use of funds] and expect to reach [milestone] within [timeframe]. Our unit economics show [LTV/CAC ratio] with [payback period] payback."\n\n## Partner Pitch\n"${companyName} offers a strategic partnership opportunity in the ${industry} space. Our technology [capability] can enhance your [offering] by [benefit]. We bring [assets] to the partnership, and together we can [mutual benefit]."\n\n## Key Messages\n1. **Problem:** [Clear problem statement]\n2. **Solution:** [Simple solution description]\n3. **Traction:** [Proof of concept]\n4. **Opportunity:** [Market potential]\n5. **Ask:** [What you need]`,
      metadata: {
        versions: 5,
        audiences: ["general", "investor", "partner", "media"],
      },
    }),
  };

  return generators[type]();
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const company = await prisma.company.findUnique({
      where: { userId },
      select: { name: true, industry: true },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: "No company found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { type, context } = body;

    if (!type) {
      return NextResponse.json(
        { success: false, error: "Type is required" },
        { status: 400 }
      );
    }

    const validTypes: GenerateType[] = [
      "pitch-deck",
      "business-plan",
      "swot",
      "lean-canvas",
      "financial-model",
      "go-to-market",
      "competitive-analysis",
      "user-personas",
      "okr-framework",
      "elevator-pitch",
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const result = await generateContent(type, context || "", company.name, company.industry);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate content" },
      { status: 500 }
    );
  }
}

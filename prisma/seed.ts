import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data in dependency order
  await prisma.auditLog.deleteMany();
  await prisma.researchReport.deleteMany();
  await prisma.memory.deleteMany();
  await prisma.knowledgeEntry.deleteMany();
  await prisma.roadmapPhase.deleteMany();
  await prisma.roadmap.deleteMany();
  await prisma.investor.deleteMany();
  await prisma.financeEntry.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.competitor.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.document.deleteMany();
  await prisma.taskDependency.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.onboarding.deleteMany();
  await prisma.company.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  console.log("Cleaned existing data.");

  // --- User ---
  const hashedPassword = await bcrypt.hash("password123", 12);
  const user = await prisma.user.create({
    data: {
      id: "user-1",
      name: "Sagar Makani",
      email: "sagar@nexuspay.io",
      password: hashedPassword,
      role: "ADMIN",
      createdAt: new Date("2025-01-15T00:00:00Z"),
    },
  });
  console.log(`Created user: ${user.name}`);

  // --- Company ---
  const company = await prisma.company.create({
    data: {
      id: "company-1",
      name: "NexusPay",
      industry: "fintech",
      stage: "SEED",
      vision: "To democratize financial access for underbanked populations globally through AI-powered micro-lending and payment infrastructure.",
      mission: "Build frictionless financial tools that empower small businesses and individuals in emerging markets to grow, save, and transact without barriers.",
      description: "NexusPay is a fintech platform providing AI-driven micro-lending, digital wallets, and payment rails for underserved markets in South Asia and Southeast Asia.",
      website: "https://nexuspay.io",
      location: "Mumbai, India",
      teamSize: 14,
      foundedDate: new Date("2024-06-01"),
      targetMarket: "Small businesses and individuals in South and Southeast Asia",
      businessModel: "B2B2C with transaction fees, subscription tiers, and lending interest",
      revenueStreams: ["Merchant transaction fees", "Premium subscriptions", "API access fees", "Lending interest income"],
      fundingStatus: "Seed round closed ($2.1M). Series A planned for Q4 2026.",
      monthlyBurn: 142000,
      runway: 14,
      keyMetrics: ["18,000+ active users", "2,400 registered merchants", "$88,700 MRR", "4.2x MoM growth in transactions"],
      challenges: ["Scaling credit model accuracy", "Regulatory complexity across markets", "Competing with established players", "Hiring senior ML talent"],
      goals: ["Launch AI credit scoring by Q4 2026", "Reach 10,000 merchants by Q3 2026", "Close Series A by end of 2026", "Expand to 2 new markets by H1 2027"],
      userId: "user-1",
    },
  });
  console.log(`Created company: ${company.name}`);

  // --- Onboarding ---
  await prisma.onboarding.create({
    data: {
      userId: "user-1",
      completed: true,
      step: 5,
      data: {
        companyName: "NexusPay",
        industry: "fintech",
        stage: "seed",
        teamSize: 14,
        vision: "To democratize financial access for underbanked populations globally.",
        mission: "Build frictionless financial tools that empower small businesses and individuals in emerging markets.",
        description: "AI-powered micro-lending and payment infrastructure for underserved markets.",
        website: "https://nexuspay.io",
        location: "Mumbai, India",
        foundedDate: "2024-06-01",
        targetMarket: "Small businesses and individuals in South and Southeast Asia",
        businessModel: "B2B2C with transaction fees, subscription tiers, and lending interest",
        revenueStreams: ["Merchant transaction fees", "Premium subscriptions", "API access fees", "Lending interest income"],
        fundingStatus: "Seed round closed ($2.1M). Series A planned for Q4 2026.",
        monthlyBurn: 142000,
        runway: 14,
        keyMetrics: ["18,000+ active users", "2,400 registered merchants", "$88,700 MRR", "4.2x MoM growth in transactions"],
        challenges: ["Scaling credit model accuracy", "Regulatory complexity across markets", "Competing with established players", "Hiring senior ML talent"],
        goals: ["Launch AI credit scoring by Q4 2026", "Reach 10,000 merchants by Q3 2026", "Close Series A by end of 2026", "Expand to 2 new markets by H1 2027"],
      },
    },
  });
  console.log("Created onboarding.");

  // --- Projects ---
  const projectsData = [
    { id: "proj-1", name: "Mobile Wallet v2.0", description: "Complete redesign of the mobile wallet with biometric auth, P2P transfers, and merchant payments.", status: "IN_PROGRESS" as const, priority: "HIGH" as const, deadline: new Date("2026-09-30"), createdAt: new Date("2026-04-01T00:00:00Z"), updatedAt: new Date("2026-07-08T00:00:00Z") },
    { id: "proj-2", name: "AI Credit Scoring Engine", description: "Machine learning model to assess creditworthiness using alternative data sources for unbanked users.", status: "IN_PROGRESS" as const, priority: "URGENT" as const, deadline: new Date("2026-08-15"), createdAt: new Date("2026-03-01T00:00:00Z"), updatedAt: new Date("2026-07-12T00:00:00Z") },
    { id: "proj-3", name: "Merchant Dashboard", description: "Analytics and management dashboard for registered merchants to track payments, refunds, and customer insights.", status: "PLANNING" as const, priority: "MEDIUM" as const, deadline: new Date("2026-10-31"), createdAt: new Date("2026-06-15T00:00:00Z"), updatedAt: new Date("2026-06-15T00:00:00Z") },
    { id: "proj-4", name: "Regulatory Compliance Portal", description: "Internal portal for managing KYC/AML compliance, audit trails, and regulatory reporting across jurisdictions.", status: "COMPLETED" as const, priority: "HIGH" as const, deadline: new Date("2026-06-30"), createdAt: new Date("2026-01-10T00:00:00Z"), updatedAt: new Date("2026-06-28T00:00:00Z") },
    { id: "proj-5", name: "API Gateway Migration", description: "Migrate legacy REST APIs to a unified GraphQL gateway for better performance and developer experience.", status: "ON_HOLD" as const, priority: "LOW" as const, deadline: null, createdAt: new Date("2026-05-20T00:00:00Z"), updatedAt: new Date("2026-06-01T00:00:00Z") },
  ];

  for (const p of projectsData) {
    await prisma.project.create({ data: { ...p, companyId: "company-1" } });
  }
  console.log(`Created ${projectsData.length} projects.`);

  // --- Tasks ---
  const tasksData = [
    { id: "task-1", title: "Implement biometric authentication flow", description: "Add fingerprint and face recognition for wallet login and transaction approval.", status: "IN_PROGRESS" as const, priority: "HIGH" as const, assigneeId: "user-1", deadline: new Date("2026-08-01"), projectId: "proj-1", createdAt: new Date("2026-07-01T00:00:00Z"), updatedAt: new Date("2026-07-10T00:00:00Z") },
    { id: "task-2", title: "Train credit scoring model v3", description: "Retrain model with expanded dataset including telecom and utility payment history.", status: "IN_PROGRESS" as const, priority: "URGENT" as const, assigneeId: "user-2", deadline: new Date("2026-07-30"), projectId: "proj-2", createdAt: new Date("2026-07-05T00:00:00Z"), updatedAt: new Date("2026-07-12T00:00:00Z") },
    { id: "task-3", title: "Design merchant dashboard wireframes", description: "Create low-fidelity wireframes for all merchant dashboard screens.", status: "TODO" as const, priority: "MEDIUM" as const, deadline: new Date("2026-08-15"), projectId: "proj-3", createdAt: new Date("2026-07-10T00:00:00Z"), updatedAt: new Date("2026-07-10T00:00:00Z") },
    { id: "task-4", title: "Submit RBI compliance documentation", description: "Finalize and submit all required documents to Reserve Bank of India for payment aggregator license.", status: "DONE" as const, priority: "HIGH" as const, assigneeId: "user-1", deadline: new Date("2026-06-25"), projectId: "proj-4", createdAt: new Date("2026-06-15T00:00:00Z"), updatedAt: new Date("2026-06-25T00:00:00Z") },
    { id: "task-5", title: "Collect and clean alternative data sources", description: "Aggregate telecom, utility, and mobile money data from partner APIs for credit model training.", status: "DONE" as const, priority: "HIGH" as const, assigneeId: "user-2", deadline: new Date("2026-07-10"), projectId: "proj-2", createdAt: new Date("2026-06-20T00:00:00Z"), updatedAt: new Date("2026-07-08T00:00:00Z") },
    { id: "task-6", title: "Set up P2P transfer backend", description: "Build and test the backend service for peer-to-peer money transfers with idempotency.", status: "REVIEW" as const, priority: "HIGH" as const, assigneeId: "user-1", deadline: new Date("2026-07-20"), projectId: "proj-1", createdAt: new Date("2026-07-02T00:00:00Z"), updatedAt: new Date("2026-07-12T00:00:00Z") },
    { id: "task-7", title: "Integrate KYC verification API", description: "Connect third-party KYC provider for real-time identity verification during onboarding.", status: "BLOCKED" as const, priority: "URGENT" as const, deadline: new Date("2026-07-25"), projectId: "proj-1", createdAt: new Date("2026-07-01T00:00:00Z"), updatedAt: new Date("2026-07-11T00:00:00Z") },
    { id: "task-8", title: "Write unit tests for wallet service", description: "Achieve 90%+ code coverage for all wallet-related services and API routes.", status: "TODO" as const, priority: "MEDIUM" as const, deadline: new Date("2026-08-10"), projectId: "proj-1", createdAt: new Date("2026-07-10T00:00:00Z"), updatedAt: new Date("2026-07-10T00:00:00Z") },
    { id: "task-9", title: "Prepare investor deck for Series A", description: "Create compelling pitch deck with updated metrics, market analysis, and growth roadmap.", status: "IN_PROGRESS" as const, priority: "HIGH" as const, assigneeId: "user-1", deadline: new Date("2026-08-05"), projectId: "proj-3", createdAt: new Date("2026-07-08T00:00:00Z"), updatedAt: new Date("2026-07-12T00:00:00Z") },
    { id: "task-10", title: "Deploy staging environment on AWS", description: "Set up isolated staging environment with CI/CD pipeline for pre-release testing.", status: "TODO" as const, priority: "LOW" as const, assigneeId: "user-2", deadline: new Date("2026-08-20"), projectId: "proj-5", createdAt: new Date("2026-07-10T00:00:00Z"), updatedAt: new Date("2026-07-10T00:00:00Z") },
  ];

  for (const t of tasksData) {
    await prisma.task.create({ data: t });
  }
  console.log(`Created ${tasksData.length} tasks.`);

  // --- Task Dependencies ---
  const deps = [
    { taskId: "task-2", dependsOnId: "task-5" },
    { taskId: "task-6", dependsOnId: "task-1" },
    { taskId: "task-7", dependsOnId: "task-4" },
    { taskId: "task-8", dependsOnId: "task-6" },
  ];
  for (const d of deps) {
    await prisma.taskDependency.create({ data: d });
  }
  console.log(`Created ${deps.length} task dependencies.`);

  // --- Documents ---
  const documentsData = [
    { id: "doc-1", title: "Q3 2026 Growth Strategy", content: "NexusPay targets 3x user growth in Q3 through merchant partnerships in Tier-2 Indian cities. Key initiatives include referral program expansion, localized onboarding in Hindi and Tamil, and integration with UPI collect requests. Budget allocation: 40% performance marketing, 30% field partnerships, 20% product-led growth, 10% brand.", folder: "STRATEGY" as const, companyId: "company-1", createdAt: new Date("2026-07-01T00:00:00Z"), updatedAt: new Date("2026-07-10T00:00:00Z") },
    { id: "doc-2", title: "Monthly Burn Rate Analysis - June 2026", content: "Total burn: $142,000. Engineering: $68,000 (48%), Marketing: $31,000 (22%), Operations: $24,000 (17%), Admin: $19,000 (13%). Runway: 14 months at current burn. Key observation: Marketing CAC decreased 18% MoM due to organic referral growth. Recommendation: Increase engineering headcount by 2 to accelerate wallet v2.0 launch.", folder: "FINANCE" as const, companyId: "company-1", createdAt: new Date("2026-07-05T00:00:00Z"), updatedAt: new Date("2026-07-05T00:00:00Z") },
    { id: "doc-3", title: "Employment Agreement Template", content: "Standard employment agreement for full-time employees of NexusPay Technologies Pvt. Ltd. Includes: at-will employment, IP assignment, non-disclosure, non-solicitation (12 months), equity vesting schedule (4-year with 1-year cliff), benefits enrollment, and dispute resolution via arbitration in Mumbai.", folder: "LEGAL" as const, companyId: "company-1", createdAt: new Date("2025-06-15T00:00:00Z"), updatedAt: new Date("2025-06-15T00:00:00Z") },
    { id: "doc-4", title: "Product Roadmap 2026-2027", content: "Phase 1 (Q3 2026): Mobile Wallet v2.0 with biometric auth and P2P transfers. Phase 2 (Q4 2026): AI Credit Scoring launch with 3 partner data providers. Phase 3 (Q1 2027): Merchant Dashboard and analytics suite. Phase 4 (Q2 2027): International expansion to Indonesia and Philippines. Phase 5 (H2 2027): Embedded finance APIs for third-party developers.", folder: "PRODUCT" as const, companyId: "company-1", createdAt: new Date("2026-01-10T00:00:00Z"), updatedAt: new Date("2026-07-01T00:00:00Z") },
    { id: "doc-5", title: "Brand Guidelines v2.0", content: "Primary color: Electric Blue (#3B82F6). Secondary: Deep Purple (#8B5CF6). Accent: Cyan (#06B6D4). Typography: Inter for body, Geist Mono for code/data. Logo usage: minimum clear space 1.5x logo height. Photography style: diverse, authentic, low-light urban settings. Tone of voice: confident, approachable, technically credible. Do not use stock photos with obvious staging.", folder: "MARKETING" as const, companyId: "company-1", createdAt: new Date("2025-09-20T00:00:00Z"), updatedAt: new Date("2026-03-15T00:00:00Z") },
    { id: "doc-6", title: "Engineering Hiring Plan - H2 2026", content: "Open positions: 2x Senior Backend Engineers (Go/Node.js), 1x ML Engineer (Python/PyTorch), 1x Frontend Engineer (React/React Native), 1x DevOps/SRE. Total budget: $420,000 annual. Timeline: All hires by September 30, 2026. Recruiting channels: LinkedIn (40%), referrals (30%), AngelList (20%), university networks (10%).", folder: "HR" as const, companyId: "company-1", createdAt: new Date("2026-07-08T00:00:00Z"), updatedAt: new Date("2026-07-08T00:00:00Z") },
    { id: "doc-7", title: "Merchant Partnership Agreement - BharatPe", content: "Integration agreement for BharatPe QR code acceptance through NexusPay wallet. Revenue split: 0.5% per transaction to NexusPay. Settlement: T+1 for transactions under INR 50,000, T+2 for above. Minimum commitment: 10,000 merchants in first 6 months. Support SLA: 4-hour response for P1 issues.", folder: "OPERATIONS" as const, companyId: "company-1", createdAt: new Date("2026-06-20T00:00:00Z"), updatedAt: new Date("2026-06-25T00:00:00Z") },
    { id: "doc-8", title: "API Documentation - Wallet Service", content: "Base URL: api.nexuspay.io/v2. Authentication: Bearer JWT tokens. Endpoints: POST /wallet/create, GET /wallet/{id}/balance, POST /wallet/transfer, POST /wallet/top-up, GET /wallet/transactions. Rate limits: 100 req/min per user. Webhooks available for transaction events. SDKs available for JavaScript, Python, and Go.", folder: "PRODUCT" as const, companyId: "company-1", createdAt: new Date("2026-05-10T00:00:00Z"), updatedAt: new Date("2026-07-05T00:00:00Z") },
  ];

  for (const d of documentsData) {
    await prisma.document.create({ data: d });
  }
  console.log(`Created ${documentsData.length} documents.`);

  // --- Document Versions ---
  const docVersions = [
    { documentId: "doc-1", content: documentsData[0].content, version: 1, createdAt: new Date("2026-07-01T00:00:00Z") },
    { documentId: "doc-1", content: documentsData[0].content, version: 2, createdAt: new Date("2026-07-10T00:00:00Z") },
    { documentId: "doc-2", content: documentsData[1].content, version: 1, createdAt: new Date("2026-07-05T00:00:00Z") },
    { documentId: "doc-4", content: documentsData[3].content, version: 1, createdAt: new Date("2026-01-10T00:00:00Z") },
    { documentId: "doc-4", content: documentsData[3].content, version: 2, createdAt: new Date("2026-07-01T00:00:00Z") },
    { documentId: "doc-8", content: documentsData[7].content, version: 1, createdAt: new Date("2026-05-10T00:00:00Z") },
    { documentId: "doc-8", content: documentsData[7].content, version: 2, createdAt: new Date("2026-07-05T00:00:00Z") },
  ];
  for (const v of docVersions) {
    await prisma.documentVersion.create({ data: v });
  }
  console.log(`Created ${docVersions.length} document versions.`);

  // --- Competitors ---
  const competitorsData = [
    { name: "Paytm", industry: "fintech", website: "https://paytm.com", features: ["Digital wallet", "UPI payments", "Merchant QR", "Bill payments", "Gold investment", "Insurance"], pricing: "Free for consumers; 1.5-2% for merchants", strengths: ["Massive user base (300M+)", "Brand recognition", "Full-stack payments", "Banking license"], weaknesses: ["Complex UX for rural users", "Slow international expansion", "Regulatory scrutiny", "High cash burn"], lastUpdated: new Date("2026-06-15"), companyId: "company-1" },
    { name: "PhonePe", industry: "fintech", website: "https://phonepe.com", features: ["UPI payments", "Wallet", "Insurance", "Mutual funds", "Gold", "Flight/train booking"], pricing: "Free for consumers; 1-2% for merchants", strengths: ["Highest UPI market share", "Walmart/Flipkart backing", "Strong merchant network", "Product diversification"], weaknesses: ["Limited international presence", "Dependency on UPI ecosystem", "Profitability challenges", "No standalone lending"], lastUpdated: new Date("2026-06-15"), companyId: "company-1" },
    { name: "Kuda Bank", industry: "fintech", website: "https://kuda.com", features: ["Digital banking", "Savings accounts", "Cards", "Budget tools", "Business accounts", "Loans"], pricing: "Free basic account; premium at $5/month", strengths: ["Modern UX design", "No-fee banking model", "Strong in Nigeria/UK", "Full banking license"], weaknesses: ["Limited product range", "Narrow geographic focus", "Smaller user base", "Limited merchant solutions"], lastUpdated: new Date("2026-05-20"), companyId: "company-1" },
    { name: "Branch", industry: "fintech", website: "https://branch.co", features: ["Instant loans", "Savings", "Payments", "Credit scoring", "Salary advances"], pricing: "Loan interest 15-35% APR; savings earn 7-12%", strengths: ["AI-powered credit scoring", "Fast loan disbursement", "Strong in emerging markets", "Low default rates"], weaknesses: ["No full banking suite", "Limited payment options", "Regulatory challenges", "Customer support issues"], lastUpdated: new Date("2026-06-01"), companyId: "company-1" },
    { name: "Razorpay", industry: "fintech", website: "https://razorpay.com", features: ["Payment gateway", "Subscriptions", "Invoicing", "Payment links", "Marketplace settlements"], pricing: "2% per transaction; enterprise custom pricing", strengths: ["Developer-friendly APIs", "Strong ecosystem", "Wide payment method support", "Fast settlement"], weaknesses: ["B2B focused only", "No consumer-facing products", "Limited international coverage", "Higher pricing than competitors"], lastUpdated: new Date("2026-06-10"), companyId: "company-1" },
    { name: "OPay", industry: "fintech", website: "https://opay.com", features: ["Mobile money", "Payments", "Ride-hailing", "Food delivery", "Loans", "Savings"], pricing: "Free transfers; 1% merchant fee", strengths: ["Super-app strategy", "Opera backing", "Strong in Nigeria", "Diverse services"], weaknesses: ["Regulatory issues in Nigeria", "Unsustainable subsidies", "Quality concerns", "Limited credit products"], lastUpdated: new Date("2026-05-15"), companyId: "company-1" },
  ];
  for (const c of competitorsData) {
    await prisma.competitor.create({ data: c });
  }
  console.log(`Created ${competitorsData.length} competitors.`);

  // --- Milestones ---
  const milestonesData = [
    { title: "Mobile Wallet v2.0 Beta Launch", status: "IN_PROGRESS" as const, deadline: new Date("2026-08-31"), progress: 45, description: "Release beta version of the redesigned mobile wallet with biometric auth and P2P transfers to 1,000 test users.", companyId: "company-1" },
    { title: "10,000 Active Merchants", status: "IN_PROGRESS" as const, deadline: new Date("2026-09-30"), progress: 62, description: "Onboard 10,000 active merchants to the NexusPay platform through partnership and direct sales channels.", companyId: "company-1" },
    { title: "RBI Payment Aggregator License", status: "COMPLETED" as const, deadline: new Date("2026-06-30"), progress: 100, description: "Obtain Payment Aggregator license from Reserve Bank of India to operate as a payment intermediary.", companyId: "company-1" },
    { title: "Series A Fundraise ($8M)", status: "PENDING" as const, deadline: new Date("2026-12-31"), progress: 15, description: "Close Series A funding round of $8M to fuel product development and geographic expansion.", companyId: "company-1" },
    { title: "AI Credit Scoring GA Release", status: "PENDING" as const, deadline: new Date("2026-10-15"), progress: 30, description: "General availability of the AI credit scoring engine with partner integrations and API access.", companyId: "company-1" },
  ];
  for (const m of milestonesData) {
    await prisma.milestone.create({ data: m });
  }
  console.log(`Created ${milestonesData.length} milestones.`);

  // --- Finance Entries ---
  const financeData = [
    { type: "REVENUE" as const, amount: 18500, category: "SALES" as const, date: new Date("2026-06-01"), description: "Merchant transaction fees" },
    { type: "REVENUE" as const, amount: 12200, category: "SALES" as const, date: new Date("2026-06-05"), description: "Premium wallet subscriptions" },
    { type: "REVENUE" as const, amount: 8900, category: "SALES" as const, date: new Date("2026-06-10"), description: "API access fees from partners" },
    { type: "REVENUE" as const, amount: 22000, category: "SALES" as const, date: new Date("2026-06-15"), description: "Merchant transaction fees" },
    { type: "REVENUE" as const, amount: 15800, category: "SALES" as const, date: new Date("2026-06-20"), description: "Premium wallet subscriptions" },
    { type: "REVENUE" as const, amount: 11300, category: "SALES" as const, date: new Date("2026-06-25"), description: "API access fees from partners" },
    { type: "EXPENSE" as const, amount: 68000, category: "SALARY" as const, date: new Date("2026-06-01"), description: "Engineering team salaries" },
    { type: "EXPENSE" as const, amount: 18500, category: "MARKETING" as const, date: new Date("2026-06-03"), description: "Performance marketing - Google Ads" },
    { type: "EXPENSE" as const, amount: 12800, category: "INFRASTRUCTURE" as const, date: new Date("2026-06-05"), description: "AWS hosting and services" },
    { type: "EXPENSE" as const, amount: 8500, category: "OPERATIONS" as const, date: new Date("2026-06-08"), description: "Office rent and utilities" },
    { type: "EXPENSE" as const, amount: 4200, category: "LEGAL" as const, date: new Date("2026-06-10"), description: "RBI compliance consulting" },
    { type: "EXPENSE" as const, amount: 7200, category: "MARKETING" as const, date: new Date("2026-06-12"), description: "Content marketing and PR" },
    { type: "EXPENSE" as const, amount: 3800, category: "RD" as const, date: new Date("2026-06-15"), description: "ML model training compute" },
    { type: "EXPENSE" as const, amount: 5500, category: "OFFICE" as const, date: new Date("2026-06-18"), description: "Co-working space and supplies" },
    { type: "EXPENSE" as const, amount: 4800, category: "SALARY" as const, date: new Date("2026-06-20"), description: "Contractor payments" },
    { type: "INVESTMENT" as const, amount: 2100000, category: "OTHER" as const, date: new Date("2025-11-15"), description: "Seed round - Sequoia Capital" },
    { type: "REVENUE" as const, amount: 19200, category: "SALES" as const, date: new Date("2026-07-01"), description: "Merchant transaction fees" },
    { type: "REVENUE" as const, amount: 14100, category: "SALES" as const, date: new Date("2026-07-05"), description: "Premium wallet subscriptions" },
    { type: "EXPENSE" as const, amount: 68000, category: "SALARY" as const, date: new Date("2026-07-01"), description: "Engineering team salaries" },
    { type: "EXPENSE" as const, amount: 15200, category: "MARKETING" as const, date: new Date("2026-07-05"), description: "Performance marketing - blended" },
  ];
  for (const f of financeData) {
    await prisma.financeEntry.create({ data: { ...f, companyId: "company-1" } });
  }
  console.log(`Created ${financeData.length} finance entries.`);

  // --- Investors ---
  const investorsData = [
    { name: "Anand Piramal", firm: "Sequoia Capital India", stage: "SERIES_A" as const, status: "DUE_DILIGENCE" as const, email: "anand@sequoiacap.com", phone: null, notes: "Very interested in the AI credit scoring angle. Wants to see model performance metrics before term sheet.", lastContact: new Date("2026-07-08"), companyId: "company-1" },
    { name: "Meera Sharma", firm: "Accel Partners", stage: "SERIES_A" as const, status: "MEETING_SCHEDULED" as const, email: "meera@accel.com", phone: null, notes: "Fintech-focused partner. Impressed by merchant growth metrics. Meeting scheduled for July 18 to discuss expansion plans.", lastContact: new Date("2026-07-05"), companyId: "company-1" },
    { name: "Rajesh Kumar", firm: "Lightspeed Venture Partners", stage: "SERIES_A" as const, status: "CONTACTED" as const, email: "rajesh@lsvp.com", phone: null, notes: "Initial outreach via warm introduction from Sequoia. Awaiting response from their fintech team.", lastContact: new Date("2026-06-28"), companyId: "company-1" },
    { name: "Sarah Chen", firm: "Y Combinator", stage: "SEED" as const, status: "CLOSED" as const, email: "sarah@ycombinator.com", phone: null, notes: "Participated in seed round. Provides ongoing mentorship and quarterly reviews. Strong network in Silicon Valley.", lastContact: new Date("2025-09-15"), companyId: "company-1" },
    { name: "Vikram Patel", firm: "Tiger Global", stage: "SERIES_B" as const, status: "PROSPECTING" as const, email: null, phone: null, notes: "Target for Series B in 2027. Known for aggressive term sheets but massive capital deployment. Keep warm through quarterly updates.", lastContact: new Date("2026-06-01"), companyId: "company-1" },
  ];
  for (const i of investorsData) {
    await prisma.investor.create({ data: i });
  }
  console.log(`Created ${investorsData.length} investors.`);

  // --- Roadmaps ---
  const roadmap1 = await prisma.roadmap.create({
    data: { id: "roadmap-1", title: "Product Roadmap 2026-2027", startDate: new Date("2026-04-01"), endDate: new Date("2027-06-30"), companyId: "company-1" },
  });
  await prisma.roadmapPhase.createMany({
    data: [
      { id: "phase-1", title: "Foundation", roadmapId: roadmap1.id, sortOrder: 0, description: "Core wallet infrastructure, security, and compliance.", startDate: new Date("2026-04-01"), endDate: new Date("2026-06-30"), tasks: ["Wallet v1.0 launch", "RBI compliance", "KYC integration", "Basic P2P transfers"] },
      { id: "phase-2", title: "Intelligence", roadmapId: roadmap1.id, sortOrder: 1, description: "AI-powered credit scoring and personalized financial products.", startDate: new Date("2026-07-01"), endDate: new Date("2026-09-30"), tasks: ["AI Credit Scoring Engine", "Wallet v2.0 with biometrics", "Personalized loan offers", "Risk assessment API"] },
      { id: "phase-3", title: "Ecosystem", roadmapId: roadmap1.id, sortOrder: 2, description: "Merchant tools, analytics, and developer platform.", startDate: new Date("2026-10-01"), endDate: new Date("2026-12-31"), tasks: ["Merchant Dashboard", "Analytics suite", "Developer API portal", "Partner integrations"] },
      { id: "phase-4", title: "Expansion", roadmapId: roadmap1.id, sortOrder: 3, description: "International markets and embedded finance.", startDate: new Date("2027-01-01"), endDate: new Date("2027-06-30"), tasks: ["Indonesia launch", "Philippines launch", "Embedded finance APIs", "Cross-border payments"] },
    ],
  });

  const roadmap2 = await prisma.roadmap.create({
    data: { id: "roadmap-2", title: "Series A Fundraise Roadmap", startDate: new Date("2026-07-01"), endDate: new Date("2026-12-31"), companyId: "company-1" },
  });
  await prisma.roadmapPhase.createMany({
    data: [
      { id: "phase-5", title: "Preparation", roadmapId: roadmap2.id, sortOrder: 0, description: "Metrics, deck, and data room preparation.", startDate: new Date("2026-07-01"), endDate: new Date("2026-07-31"), tasks: ["Finalize pitch deck", "Prepare financial model", "Build data room", "Customer testimonials"] },
      { id: "phase-6", title: "Outreach", roadmapId: roadmap2.id, sortOrder: 1, description: "Active investor engagement and meetings.", startDate: new Date("2026-08-01"), endDate: new Date("2026-09-30"), tasks: ["Target investor list", "Warm introductions", "Partner meetings", "Follow-up materials"] },
      { id: "phase-7", title: "Close", roadmapId: roadmap2.id, sortOrder: 2, description: "Term sheet negotiation and legal close.", startDate: new Date("2026-10-01"), endDate: new Date("2026-12-31"), tasks: ["Term sheet review", "Legal diligence", "Board approval", "Funds transfer"] },
    ],
  });
  console.log("Created 2 roadmaps with 7 phases.");

  // --- Conversations ---
  const conversation = await prisma.conversation.create({
    data: { id: "conv-1", title: "Project Status & Financial Overview", userId: "user-1", companyId: "company-1", createdAt: new Date("2026-07-12T10:00:00Z"), updatedAt: new Date("2026-07-12T10:05:03Z") },
  });
  await prisma.message.createMany({
    data: [
      { id: "msg-1", role: "USER", conversationId: conversation.id, content: "What's the current status of the AI credit scoring project?", createdAt: new Date("2026-07-12T10:00:00Z") },
      { id: "msg-2", role: "ASSISTANT", conversationId: conversation.id, content: "The AI Credit Scoring Engine is currently in-progress with urgent priority. The team has completed collecting and cleaning alternative data sources (telecom, utility, mobile money) and is now training model v3. The model is being retrained with the expanded dataset. The deadline is August 15, 2026. One dependency has been cleared, and the project is on track. I recommend scheduling a review by end of this week to assess model accuracy benchmarks.", reasoningSteps: [{ step: 1, status: "completed", label: "Retrieved project data for AI Credit Scoring Engine" }, { step: 2, status: "completed", label: "Analyzed task dependencies and completion status" }, { step: 3, status: "completed", label: "Evaluated timeline and risk factors" }, { step: 4, status: "completed", label: "Generated status summary with recommendation" }], createdAt: new Date("2026-07-12T10:00:05Z") },
      { id: "msg-3", role: "USER", conversationId: conversation.id, content: "How much runway do we have left?", createdAt: new Date("2026-07-12T10:05:00Z") },
      { id: "msg-4", role: "ASSISTANT", conversationId: conversation.id, content: "Based on the latest financial data, NexusPay has approximately 14 months of runway at the current monthly burn rate of $142,000. Total funding received to date is $2.1M. The burn rate has been decreasing month-over-month -- marketing CAC dropped 18% in June due to organic referral growth. To extend runway, consider: (1) accelerating revenue from merchant partnerships, (2) reducing infrastructure costs by 15% through reserved instances, or (3) closing the upcoming Series A round by Q4 2026.", reasoningSteps: [{ step: 1, status: "completed", label: "Aggregated financial data from June 2026 report" }, { step: 2, status: "completed", label: "Calculated current burn rate and runway" }, { step: 3, status: "completed", label: "Analyzed cost reduction opportunities" }, { step: 4, status: "completed", label: "Formulated runway extension strategies" }], createdAt: new Date("2026-07-12T10:05:03Z") },
    ],
  });
  console.log("Created conversation with 4 messages.");

  // --- Audit Logs ---
  const auditLogs = [
    { action: "CREATE", entity: "COMPANY", entityId: "company-1", userId: "user-1" },
    { action: "UPDATE", entity: "PROJECT", entityId: "proj-1", userId: "user-1" },
    { action: "CREATE", entity: "TASK", entityId: "task-1", userId: "user-1" },
    { action: "UPDATE", entity: "FINANCE", entityId: "fin-1", userId: "user-1" },
    { action: "CREATE", entity: "INVESTOR", entityId: "inv-1", userId: "user-1" },
  ];
  for (const log of auditLogs) {
    await prisma.auditLog.create({ data: log });
  }
  console.log(`Created ${auditLogs.length} audit logs.`);

  console.log("\nSeed completed successfully!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data in reverse order of dependencies
  console.log("Clearing existing data...");
  await prisma.financeEntry.deleteMany();
  await prisma.investor.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.competitor.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.document.deleteMany();
  await prisma.taskDependency.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.roadmapPhase.deleteMany();
  await prisma.roadmap.deleteMany();
  await prisma.knowledgeEntry.deleteMany();
  await prisma.memory.deleteMany();
  await prisma.researchReport.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.onboarding.deleteMany();
  await prisma.company.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log("Creating users...");
  const user1 = await prisma.user.create({
    data: {
      name: "Sagar Makani",
      email: "sagar@nexuspay.io",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Priya Mehta",
      email: "priya@nexuspay.io",
    },
  });

  console.log(`  Created ${2} users`);

  // Create company
  console.log("Creating company...");
  const company = await prisma.company.create({
    data: {
      name: "NexusPay",
      industry: "fintech",
      stage: "SEED",
      vision:
        "To democratize financial access for underbanked populations globally through AI-powered micro-lending and payment infrastructure.",
      mission:
        "Build frictionless financial tools that empower small businesses and individuals in emerging markets to grow, save, and transact without barriers.",
      description:
        "NexusPay is a fintech platform providing AI-driven micro-lending, digital wallets, and payment rails for underserved markets in South Asia and Southeast Asia.",
      foundedDate: new Date("2024-06-01"),
      website: "https://nexuspay.io",
      teamSize: 14,
      location: "Mumbai, India",
      userId: user1.id,
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
  });

  console.log(`  Created company: ${company.name}`);

  // Create projects
  console.log("Creating projects...");
  const projectData: Prisma.ProjectCreateManyInput[] = [
    {
      name: "Mobile Wallet v2.0",
      status: "IN_PROGRESS",
      priority: "HIGH",
      deadline: new Date("2026-09-30"),
      description: "Complete redesign of the mobile wallet with biometric auth, P2P transfers, and merchant payments.",
      companyId: company.id,
    },
    {
      name: "AI Credit Scoring Engine",
      status: "IN_PROGRESS",
      priority: "URGENT",
      deadline: new Date("2026-08-15"),
      description: "Machine learning model to assess creditworthiness using alternative data sources for unbanked users.",
      companyId: company.id,
    },
    {
      name: "Merchant Dashboard",
      status: "PLANNING",
      priority: "MEDIUM",
      deadline: new Date("2026-10-31"),
      description: "Analytics and management dashboard for registered merchants to track payments, refunds, and customer insights.",
      companyId: company.id,
    },
    {
      name: "Regulatory Compliance Portal",
      status: "COMPLETED",
      priority: "HIGH",
      deadline: new Date("2026-06-30"),
      description: "Internal portal for managing KYC/AML compliance, audit trails, and regulatory reporting across jurisdictions.",
      companyId: company.id,
    },
    {
      name: "API Gateway Migration",
      status: "ON_HOLD",
      priority: "LOW",
      deadline: null,
      description: "Migrate legacy REST APIs to a unified GraphQL gateway for better performance and developer experience.",
      companyId: company.id,
    },
  ];

  const projects = await Promise.all(
    projectData.map((p) => prisma.project.create({ data: p }))
  );

  console.log(`  Created ${projects.length} projects`);

  // Create tasks (without dependencies first)
  console.log("Creating tasks...");
  const taskData: Prisma.TaskCreateManyInput[] = [
    {
      title: "Implement biometric authentication flow",
      status: "IN_PROGRESS",
      priority: "HIGH",
      deadline: new Date("2026-08-01"),
      projectId: projects[0].id,
      description: "Add fingerprint and face recognition for wallet login and transaction approval.",
    },
    {
      title: "Train credit scoring model v3",
      status: "IN_PROGRESS",
      priority: "URGENT",
      deadline: new Date("2026-07-30"),
      projectId: projects[1].id,
      description: "Retrain model with expanded dataset including telecom and utility payment history.",
    },
    {
      title: "Design merchant dashboard wireframes",
      status: "TODO",
      priority: "MEDIUM",
      deadline: new Date("2026-08-15"),
      projectId: projects[2].id,
      description: "Create low-fidelity wireframes for all merchant dashboard screens.",
    },
    {
      title: "Submit RBI compliance documentation",
      status: "DONE",
      priority: "HIGH",
      deadline: new Date("2026-06-25"),
      projectId: projects[3].id,
      description: "Finalize and submit all required documents to Reserve Bank of India for payment aggregator license.",
    },
    {
      title: "Collect and clean alternative data sources",
      status: "DONE",
      priority: "HIGH",
      deadline: new Date("2026-07-10"),
      projectId: projects[1].id,
      description: "Aggregate telecom, utility, and mobile money data from partner APIs for credit model training.",
    },
    {
      title: "Set up P2P transfer backend",
      status: "REVIEW",
      priority: "HIGH",
      deadline: new Date("2026-07-20"),
      projectId: projects[0].id,
      description: "Build and test the backend service for peer-to-peer money transfers with idempotency.",
    },
    {
      title: "Integrate KYC verification API",
      status: "BLOCKED",
      priority: "URGENT",
      deadline: new Date("2026-07-25"),
      projectId: projects[0].id,
      description: "Connect third-party KYC provider for real-time identity verification during onboarding.",
    },
    {
      title: "Write unit tests for wallet service",
      status: "TODO",
      priority: "MEDIUM",
      deadline: new Date("2026-08-10"),
      projectId: projects[0].id,
      description: "Achieve 90%+ code coverage for all wallet-related services and API routes.",
    },
    {
      title: "Prepare investor deck for Series A",
      status: "IN_PROGRESS",
      priority: "HIGH",
      deadline: new Date("2026-08-05"),
      projectId: projects[2].id,
      description: "Create compelling pitch deck with updated metrics, market analysis, and growth roadmap.",
    },
    {
      title: "Deploy staging environment on AWS",
      status: "TODO",
      priority: "LOW",
      deadline: new Date("2026-08-20"),
      projectId: projects[4].id,
      description: "Set up isolated staging environment with CI/CD pipeline for pre-release testing.",
    },
  ];

  const tasks = await Promise.all(
    taskData.map((t) => prisma.task.create({ data: t }))
  );

  // Create task dependencies
  console.log("Creating task dependencies...");
  // task-2 depends on task-5 (index 1 depends on index 4)
  await prisma.taskDependency.create({
    data: { taskId: tasks[1].id, dependsOnId: tasks[4].id },
  });
  // task-6 depends on task-1 (index 5 depends on index 0)
  await prisma.taskDependency.create({
    data: { taskId: tasks[5].id, dependsOnId: tasks[0].id },
  });
  // task-7 depends on task-4 (index 6 depends on index 3)
  await prisma.taskDependency.create({
    data: { taskId: tasks[6].id, dependsOnId: tasks[3].id },
  });
  // task-8 depends on task-6 (index 7 depends on index 5)
  await prisma.taskDependency.create({
    data: { taskId: tasks[7].id, dependsOnId: tasks[5].id },
  });

  console.log(`  Created ${tasks.length} tasks with dependencies`);

  // Create documents
  console.log("Creating documents...");
  const docData: Prisma.DocumentCreateManyInput[] = [
    {
      title: "Q3 2026 Growth Strategy",
      content: "NexusPay targets 3x user growth in Q3 through merchant partnerships in Tier-2 Indian cities. Key initiatives include referral program expansion, localized onboarding in Hindi and Tamil, and integration with UPI collect requests. Budget allocation: 40% performance marketing, 30% field partnerships, 20% product-led growth, 10% brand.",
      folder: "STRATEGY",
      companyId: company.id,
    },
    {
      title: "Monthly Burn Rate Analysis - June 2026",
      content: "Total burn: $142,000. Engineering: $68,000 (48%), Marketing: $31,000 (22%), Operations: $24,000 (17%), Admin: $19,000 (13%). Runway: 14 months at current burn.",
      folder: "FINANCE",
      companyId: company.id,
    },
    {
      title: "Employment Agreement Template",
      content: "Standard employment agreement for full-time employees of NexusPay Technologies Pvt. Ltd. Includes: at-will employment, IP assignment, non-disclosure, non-solicitation (12 months), equity vesting schedule (4-year with 1-year cliff).",
      folder: "LEGAL",
      companyId: company.id,
    },
    {
      title: "Product Roadmap 2026-2027",
      content: "Phase 1 (Q3 2026): Mobile Wallet v2.0. Phase 2 (Q4 2026): AI Credit Scoring. Phase 3 (Q1 2027): Merchant Dashboard. Phase 4 (Q2 2027): International expansion.",
      folder: "PRODUCT",
      companyId: company.id,
    },
    {
      title: "Brand Guidelines v2.0",
      content: "Primary color: Electric Blue (#3B82F6). Secondary: Deep Purple (#8B5CF6). Accent: Cyan (#06B6D4). Typography: Inter for body, Geist Mono for code/data.",
      folder: "MARKETING",
      companyId: company.id,
    },
    {
      title: "Engineering Hiring Plan - H2 2026",
      content: "Open positions: 2x Senior Backend Engineers, 1x ML Engineer, 1x Frontend Engineer, 1x DevOps/SRE. Total budget: $420,000 annual.",
      folder: "HR",
      companyId: company.id,
    },
    {
      title: "Merchant Partnership Agreement - BharatPe",
      content: "Integration agreement for BharatPe QR code acceptance through NexusPay wallet. Revenue split: 0.5% per transaction.",
      folder: "OPERATIONS",
      companyId: company.id,
    },
    {
      title: "API Documentation - Wallet Service",
      content: "Base URL: api.nexuspay.io/v2. Authentication: Bearer JWT tokens. Endpoints: POST /wallet/create, GET /wallet/{id}/balance, POST /wallet/transfer.",
      folder: "PRODUCT",
      companyId: company.id,
    },
  ];

  const documents = await Promise.all(
    docData.map((d) => prisma.document.create({ data: d }))
  );

  console.log(`  Created ${documents.length} documents`);

  // Create competitors
  console.log("Creating competitors...");
  const compData: Prisma.CompetitorCreateManyInput[] = [
    {
      name: "Paytm",
      features: ["Digital wallet", "UPI payments", "Merchant QR", "Bill payments"],
      pricing: "Free for consumers; 1.5-2% for merchants",
      strengths: ["Massive user base (300M+)", "Brand recognition", "Full-stack payments"],
      weaknesses: ["Complex UX for rural users", "Regulatory scrutiny", "High cash burn"],
      industry: "fintech",
      website: "https://paytm.com",
      companyId: company.id,
    },
    {
      name: "PhonePe",
      features: ["UPI payments", "Wallet", "Insurance", "Mutual funds"],
      pricing: "Free for consumers; 1-2% for merchants",
      strengths: ["Highest UPI market share", "Walmart/Flipkart backing", "Strong merchant network"],
      weaknesses: ["Limited international presence", "Dependency on UPI ecosystem", "Profitability challenges"],
      industry: "fintech",
      website: "https://phonepe.com",
      companyId: company.id,
    },
    {
      name: "Kuda Bank",
      features: ["Digital banking", "Savings accounts", "Cards", "Budget tools"],
      pricing: "Free basic account; premium at $5/month",
      strengths: ["Modern UX design", "No-fee banking model", "Strong in Nigeria/UK"],
      weaknesses: ["Limited product range", "Narrow geographic focus", "Smaller user base"],
      industry: "fintech",
      website: "https://kuda.com",
      companyId: company.id,
    },
    {
      name: "Branch",
      features: ["Instant loans", "Savings", "Payments", "Credit scoring"],
      pricing: "Loan interest 15-35% APR; savings earn 7-12%",
      strengths: ["AI-powered credit scoring", "Fast loan disbursement", "Strong in emerging markets"],
      weaknesses: ["No full banking suite", "Limited payment options", "Regulatory challenges"],
      industry: "fintech",
      website: "https://branch.co",
      companyId: company.id,
    },
    {
      name: "Razorpay",
      features: ["Payment gateway", "Subscriptions", "Invoicing", "Payment links"],
      pricing: "2% per transaction; enterprise custom pricing",
      strengths: ["Developer-friendly APIs", "Strong ecosystem", "Fast settlement"],
      weaknesses: ["B2B focused only", "No consumer-facing products", "Higher pricing"],
      industry: "fintech",
      website: "https://razorpay.com",
      companyId: company.id,
    },
  ];

  const competitors = await Promise.all(
    compData.map((c) => prisma.competitor.create({ data: c }))
  );

  console.log(`  Created ${competitors.length} competitors`);

  // Create milestones
  console.log("Creating milestones...");
  const msData: Prisma.MilestoneCreateManyInput[] = [
    {
      title: "Mobile Wallet v2.0 Beta Launch",
      status: "IN_PROGRESS",
      deadline: new Date("2026-08-31"),
      progress: 45,
      description: "Release beta version of the redesigned mobile wallet with biometric auth and P2P transfers to 1,000 test users.",
      companyId: company.id,
    },
    {
      title: "10,000 Active Merchants",
      status: "IN_PROGRESS",
      deadline: new Date("2026-09-30"),
      progress: 62,
      description: "Onboard 10,000 active merchants to the NexusPay platform through partnership and direct sales channels.",
      companyId: company.id,
    },
    {
      title: "RBI Payment Aggregator License",
      status: "COMPLETED",
      deadline: new Date("2026-06-30"),
      progress: 100,
      description: "Obtain Payment Aggregator license from Reserve Bank of India to operate as a payment intermediary.",
      companyId: company.id,
    },
    {
      title: "Series A Fundraise ($8M)",
      status: "PENDING",
      deadline: new Date("2026-12-31"),
      progress: 15,
      description: "Close Series A funding round of $8M to fuel product development and geographic expansion.",
      companyId: company.id,
    },
    {
      title: "AI Credit Scoring GA Release",
      status: "PENDING",
      deadline: new Date("2026-10-15"),
      progress: 30,
      description: "General availability of the AI credit scoring engine with partner integrations and API access.",
      companyId: company.id,
    },
  ];

  const milestones = await Promise.all(
    msData.map((m) => prisma.milestone.create({ data: m }))
  );

  console.log(`  Created ${milestones.length} milestones`);

  // Create finance entries
  console.log("Creating finance entries...");
  const finData: Prisma.FinanceEntryCreateManyInput[] = [
    { type: "REVENUE", amount: 18500, category: "SALES", date: new Date("2026-06-01"), description: "Merchant transaction fees", companyId: company.id },
    { type: "REVENUE", amount: 12200, category: "SALES", date: new Date("2026-06-05"), description: "Premium wallet subscriptions", companyId: company.id },
    { type: "REVENUE", amount: 8900, category: "SALES", date: new Date("2026-06-10"), description: "API access fees from partners", companyId: company.id },
    { type: "REVENUE", amount: 22000, category: "SALES", date: new Date("2026-06-15"), description: "Merchant transaction fees", companyId: company.id },
    { type: "REVENUE", amount: 15800, category: "SALES", date: new Date("2026-06-20"), description: "Premium wallet subscriptions", companyId: company.id },
    { type: "REVENUE", amount: 11300, category: "SALES", date: new Date("2026-06-25"), description: "API access fees from partners", companyId: company.id },
    { type: "EXPENSE", amount: 68000, category: "SALARY", date: new Date("2026-06-01"), description: "Engineering team salaries", companyId: company.id },
    { type: "EXPENSE", amount: 18500, category: "MARKETING", date: new Date("2026-06-03"), description: "Performance marketing - Google Ads", companyId: company.id },
    { type: "EXPENSE", amount: 12800, category: "INFRASTRUCTURE", date: new Date("2026-06-05"), description: "AWS hosting and services", companyId: company.id },
    { type: "EXPENSE", amount: 8500, category: "OPERATIONS", date: new Date("2026-06-08"), description: "Office rent and utilities", companyId: company.id },
    { type: "EXPENSE", amount: 4200, category: "LEGAL", date: new Date("2026-06-10"), description: "RBI compliance consulting", companyId: company.id },
    { type: "EXPENSE", amount: 7200, category: "MARKETING", date: new Date("2026-06-12"), description: "Content marketing and PR", companyId: company.id },
    { type: "EXPENSE", amount: 3800, category: "RD", date: new Date("2026-06-15"), description: "ML model training compute", companyId: company.id },
    { type: "EXPENSE", amount: 5500, category: "OFFICE", date: new Date("2026-06-18"), description: "Co-working space and supplies", companyId: company.id },
    { type: "EXPENSE", amount: 4800, category: "SALARY", date: new Date("2026-06-20"), description: "Contractor payments", companyId: company.id },
    { type: "INVESTMENT", amount: 2100000, category: "OTHER", date: new Date("2025-11-15"), description: "Seed round - Sequoia Capital", companyId: company.id },
    { type: "REVENUE", amount: 19200, category: "SALES", date: new Date("2026-07-01"), description: "Merchant transaction fees", companyId: company.id },
    { type: "REVENUE", amount: 14100, category: "SALES", date: new Date("2026-07-05"), description: "Premium wallet subscriptions", companyId: company.id },
    { type: "EXPENSE", amount: 68000, category: "SALARY", date: new Date("2026-07-01"), description: "Engineering team salaries", companyId: company.id },
    { type: "EXPENSE", amount: 15200, category: "MARKETING", date: new Date("2026-07-05"), description: "Performance marketing - blended", companyId: company.id },
  ];

  const financeEntries = await Promise.all(
    finData.map((f) => prisma.financeEntry.create({ data: f }))
  );

  console.log(`  Created ${financeEntries.length} finance entries`);

  // Create investors
  console.log("Creating investors...");
  const invData: Prisma.InvestorCreateManyInput[] = [
    {
      name: "Anand Piramal",
      firm: "Sequoia Capital India",
      stage: "SERIES_A",
      status: "DUE_DILIGENCE",
      lastContact: new Date("2026-07-08"),
      notes: "Very interested in the AI credit scoring angle. Wants to see model performance metrics before term sheet.",
      email: "anand@sequoiacap.com",
      companyId: company.id,
    },
    {
      name: "Meera Sharma",
      firm: "Accel Partners",
      stage: "SERIES_A",
      status: "MEETING_SCHEDULED",
      lastContact: new Date("2026-07-05"),
      notes: "Fintech-focused partner. Impressed by merchant growth metrics. Meeting scheduled for July 18.",
      email: "meera@accel.com",
      companyId: company.id,
    },
    {
      name: "Rajesh Kumar",
      firm: "Lightspeed Venture Partners",
      stage: "SERIES_A",
      status: "CONTACTED",
      lastContact: new Date("2026-06-28"),
      notes: "Initial outreach via warm introduction from Sequoia. Awaiting response.",
      email: "rajesh@lsvp.com",
      companyId: company.id,
    },
    {
      name: "Sarah Chen",
      firm: "Y Combinator",
      stage: "SEED",
      status: "CLOSED",
      lastContact: new Date("2025-09-15"),
      notes: "Participated in seed round. Provides ongoing mentorship and quarterly reviews.",
      email: "sarah@ycombinator.com",
      companyId: company.id,
    },
    {
      name: "Vikram Patel",
      firm: "Tiger Global",
      stage: "SERIES_B",
      status: "PROSPECTING",
      lastContact: new Date("2026-06-01"),
      notes: "Target for Series B in 2027. Keep warm through quarterly updates.",
      companyId: company.id,
    },
  ];

  const investors = await Promise.all(
    invData.map((i) => prisma.investor.create({ data: i }))
  );

  console.log(`  Created ${investors.length} investors`);

  // Create roadmaps
  console.log("Creating roadmaps...");
  const roadmap1 = await prisma.roadmap.create({
    data: {
      title: "Product Roadmap 2026-2027",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2027-06-30"),
      companyId: company.id,
      phases: {
        create: [
          {
            title: "Foundation",
            description: "Core wallet infrastructure, security, and compliance.",
            startDate: new Date("2026-04-01"),
            endDate: new Date("2026-06-30"),
            tasks: ["Wallet v1.0 launch", "RBI compliance", "KYC integration", "Basic P2P transfers"],
            sortOrder: 0,
          },
          {
            title: "Intelligence",
            description: "AI-powered credit scoring and personalized financial products.",
            startDate: new Date("2026-07-01"),
            endDate: new Date("2026-09-30"),
            tasks: ["AI Credit Scoring Engine", "Wallet v2.0 with biometrics", "Personalized loan offers"],
            sortOrder: 1,
          },
          {
            title: "Ecosystem",
            description: "Merchant tools, analytics, and developer platform.",
            startDate: new Date("2026-10-01"),
            endDate: new Date("2026-12-31"),
            tasks: ["Merchant Dashboard", "Analytics suite", "Developer API portal"],
            sortOrder: 2,
          },
          {
            title: "Expansion",
            description: "International markets and embedded finance.",
            startDate: new Date("2027-01-01"),
            endDate: new Date("2027-06-30"),
            tasks: ["Indonesia launch", "Philippines launch", "Embedded finance APIs"],
            sortOrder: 3,
          },
        ],
      },
    },
  });

  console.log(`  Created roadmap: ${roadmap1.title}`);

  // Summary
  console.log("\n==========================================");
  console.log("Seed completed successfully!");
  console.log("==========================================");
  console.log(`  Users:         ${2}`);
  console.log(`  Companies:     ${1}`);
  console.log(`  Projects:      ${projects.length}`);
  console.log(`  Tasks:         ${tasks.length}`);
  console.log(`  Documents:     ${documents.length}`);
  console.log(`  Competitors:   ${competitors.length}`);
  console.log(`  Milestones:    ${milestones.length}`);
  console.log(`  Finance:       ${financeEntries.length}`);
  console.log(`  Investors:     ${investors.length}`);
  console.log(`  Roadmaps:      1`);
  console.log("==========================================");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

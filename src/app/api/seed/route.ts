import { authOptions } from "@/lib/auth/config";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = (session.user as { id: string }).id;

    const company = await prisma.company.findUnique({ where: { userId } });
    if (!company) {
      return NextResponse.json(
        { success: false, error: "No company found" },
        { status: 404 }
      );
    }

    const existingProjects = await prisma.project.count({
      where: { companyId: company.id },
    });
    if (existingProjects > 0) {
      return NextResponse.json({
        success: true,
        message: "Data already exists",
      });
    }

    const now = new Date();

    const projects = await Promise.all([
      prisma.project.create({
        data: {
          name: "Product Launch MVP",
          description:
            "Build and ship the minimum viable product for our core offering. Focus on essential features that deliver value to early adopters.",
          status: "IN_PROGRESS",
          priority: "HIGH",
          deadline: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
          companyId: company.id,
        },
      }),
      prisma.project.create({
        data: {
          name: "Go-to-Market Strategy",
          description:
            "Define our go-to-market strategy including positioning, messaging, pricing, and launch plan for the first quarter.",
          status: "PLANNING",
          priority: "MEDIUM",
          deadline: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
          companyId: company.id,
        },
      }),
      prisma.project.create({
        data: {
          name: "Brand Identity & Design System",
          description:
            "Create a complete brand identity including logo, color palette, typography, and a reusable design system for all products.",
          status: "COMPLETED",
          priority: "MEDIUM",
          deadline: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
          companyId: company.id,
        },
      }),
    ]);

    const _tasks = await Promise.all([
      prisma.task.create({
        data: {
          title: "Set up CI/CD pipeline",
          description:
            "Configure automated testing, building, and deployment pipeline for the main repository.",
          status: "DONE",
          priority: "HIGH",
          projectId: projects[0].id,
        },
      }),
      prisma.task.create({
        data: {
          title: "Implement user authentication",
          description:
            "Add sign-up, login, and password reset flows with email verification.",
          status: "IN_PROGRESS",
          priority: "HIGH",
          projectId: projects[0].id,
        },
      }),
      prisma.task.create({
        data: {
          title: "Design landing page wireframes",
          description:
            "Create wireframes for the marketing landing page including hero, features, pricing, and FAQ sections.",
          status: "TODO",
          priority: "MEDIUM",
          projectId: projects[1].id,
        },
      }),
      prisma.task.create({
        data: {
          title: "Research competitor pricing",
          description:
            "Analyze pricing models of top 5 competitors and prepare a comparison report.",
          status: "TODO",
          priority: "LOW",
          projectId: projects[1].id,
        },
      }),
      prisma.task.create({
        data: {
          title: "Finalize brand guidelines document",
          description:
            "Compile the brand guidelines including logo usage, color codes, and typography rules into a shareable document.",
          status: "DONE",
          priority: "MEDIUM",
          projectId: projects[2].id,
        },
      }),
    ]);

    await Promise.all([
      prisma.document.create({
        data: {
          title: "Business Strategy Overview",
          content:
            "# Business Strategy\n\n## Vision\nTo become the leading platform in our space by delivering exceptional value to our users.\n\n## Mission\nWe build tools that simplify complex workflows for growing teams.\n\n## Key Pillars\n1. Product excellence\n2. Customer obsession\n3. Sustainable growth",
          folder: "STRATEGY",
          companyId: company.id,
          versions: {
            create: {
              content:
                "# Business Strategy\n\n## Vision\nTo become the leading platform in our space by delivering exceptional value to our users.\n\n## Mission\nWe build tools that simplify complex workflows for growing teams.\n\n## Key Pillars\n1. Product excellence\n2. Customer obsession\n3. Sustainable growth",
              version: 1,
            },
          },
        },
      }),
      prisma.document.create({
        data: {
          title: "Product Requirements Document",
          content:
            "# Product Requirements\n\n## Core Features\n- Dashboard with real-time analytics\n- Team collaboration tools\n- Automated reporting\n- API integration layer\n\n## User Stories\n- As a user, I want to see my key metrics at a glance\n- As a user, I want to invite team members and assign roles\n- As a user, I want to schedule automated reports",
          folder: "PRODUCT",
          companyId: company.id,
          versions: {
            create: {
              content:
                "# Product Requirements\n\n## Core Features\n- Dashboard with real-time analytics\n- Team collaboration tools\n- Automated reporting\n- API integration layer\n\n## User Stories\n- As a user, I want to see my key metrics at a glance\n- As a user, I want to invite team members and assign roles\n- As a user, I want to schedule automated reports",
              version: 1,
            },
          },
        },
      }),
      prisma.document.create({
        data: {
          title: "Financial Projections FY2026",
          content:
            "# Financial Projections\n\n## Revenue Forecast\n- Q1: $50,000\n- Q2: $120,000\n- Q3: $250,000\n- Q4: $500,000\n\n## Expense Breakdown\n- Salaries: 60%\n- Marketing: 20%\n- Infrastructure: 10%\n- Operations: 10%\n\n## Key Metrics\n- Monthly burn rate: $45,000\n- Runway: 14 months\n- Target CAC: $120",
          folder: "FINANCE",
          companyId: company.id,
          versions: {
            create: {
              content:
                "# Financial Projections\n\n## Revenue Forecast\n- Q1: $50,000\n- Q2: $120,000\n- Q3: $250,000\n- Q4: $500,000\n\n## Expense Breakdown\n- Salaries: 60%\n- Marketing: 20%\n- Infrastructure: 10%\n- Operations: 10%\n\n## Key Metrics\n- Monthly burn rate: $45,000\n- Runway: 14 months\n- Target CAC: $120",
              version: 1,
            },
          },
        },
      }),
    ]);

    await Promise.all([
      prisma.milestone.create({
        data: {
          title: "MVP Beta Launch",
          description:
            "Release the beta version of the product to a select group of early adopters for feedback.",
          status: "IN_PROGRESS",
          deadline: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          progress: 35,
          companyId: company.id,
        },
      }),
      prisma.milestone.create({
        data: {
          title: "First 100 Paying Customers",
          description:
            "Acquire the first 100 paying customers through our go-to-market channels.",
          status: "PENDING",
          deadline: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000),
          progress: 0,
          companyId: company.id,
        },
      }),
    ]);

    await Promise.all([
      prisma.financeEntry.create({
        data: {
          type: "REVENUE",
          amount: 25000,
          category: "SALES",
          date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
          description: "Pre-sales revenue from founding customer agreements",
          companyId: company.id,
        },
      }),
      prisma.financeEntry.create({
        data: {
          type: "EXPENSE",
          amount: 12000,
          category: "SALARY",
          date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          description: "Monthly engineering team salaries",
          companyId: company.id,
        },
      }),
      prisma.financeEntry.create({
        data: {
          type: "EXPENSE",
          amount: 3500,
          category: "MARKETING",
          date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          description: "Digital advertising and content marketing spend",
          companyId: company.id,
        },
      }),
    ]);

    await Promise.all([
      prisma.competitor.create({
        data: {
          name: "CompetitorAlpha",
          industry: company.industry,
          website: "https://competitoralpha.com",
          features: ["Dashboard", "Analytics", "Team Management"],
          pricing: "From $49/month",
          strengths: [
            "Strong brand recognition",
            "Large existing user base",
          ],
          weaknesses: [
            "Complex onboarding",
            "High price point",
            "Slow feature delivery",
          ],
          funding: "$15M Series A",
          companyId: company.id,
        },
      }),
      prisma.competitor.create({
        data: {
          name: "RivalTech",
          industry: company.industry,
          website: "https://rivaltech.io",
          features: ["API-first", "Automation", "Integrations"],
          pricing: "Freemium, from $29/month",
          strengths: [
            "Developer-friendly",
            "Extensive API",
            "Active community",
          ],
          weaknesses: [
            "Limited enterprise features",
            "No phone support",
            "Unreliable uptime",
          ],
          funding: "$5M Seed",
          companyId: company.id,
        },
      }),
    ]);

    await Promise.all([
      prisma.investor.create({
        data: {
          name: "Sarah Chen",
          firm: "Horizon Ventures",
          stage: "SEED",
          status: "CONTACTED",
          email: "sarah.chen@horizonvc.com",
          notes: "Interested in our space. Met at TechCrunch Disrupt.",
          lastContact: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          companyId: company.id,
        },
      }),
      prisma.investor.create({
        data: {
          name: "Marcus Johnson",
          firm: "NextGen Capital",
          stage: "PRE_SEED",
          status: "PROSPECTING",
          email: "marcus@nextgencap.com",
          notes: "Focuses on early-stage SaaS. Referred by a mutual connection.",
          companyId: company.id,
        },
      }),
    ]);

    await prisma.notification.create({
      data: {
        userId,
        title: "Welcome to GENESIS!",
        message: "Your AI co-founder is ready. Explore the dashboard and start building.",
        type: "success",
        link: "/dashboard",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Sample data created",
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed data" },
      { status: 500 }
    );
  }
}

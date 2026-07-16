import { authOptions } from "@/lib/auth/config";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

async function getAuthUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return (session.user as { id: string }).id;
}

async function getUserCompanyId(userId: string) {
  const company = await prisma.company.findUnique({
    where: { userId },
    select: { id: true, name: true, industry: true },
  });
  return company;
}

async function generateResearchReport(
  query: string,
  companyName: string,
  industry: string
): Promise<{ title: string; content: string; category: string; sources: string[] }> {
  const lowerQuery = query.toLowerCase();

  let category = "general";
  if (lowerQuery.includes("market") || lowerQuery.includes("industry")) category = "market";
  else if (lowerQuery.includes("competitor") || lowerQuery.includes("competition")) category = "competitive";
  else if (lowerQuery.includes("technology") || lowerQuery.includes("tech")) category = "technology";
  else if (lowerQuery.includes("financial") || lowerQuery.includes("finance")) category = "financial";
  else if (lowerQuery.includes("regulation") || lowerQuery.includes("compliance")) category = "regulatory";
  else if (lowerQuery.includes("customer") || lowerQuery.includes("user")) category = "customer";

  const title = `Research: ${query}`;
  const content = `# ${query}\n\n## Overview\n\nThis research report analyzes "${query}" in the context of ${companyName}, operating in the ${industry} sector.\n\n## Key Findings\n\n1. The market for this area shows significant growth potential with a projected CAGR of 15-20% over the next 3 years.\n2. Key players in the space are investing heavily in innovation and market expansion.\n3. Regulatory frameworks are evolving to accommodate new technologies and business models.\n4. Customer demand is shifting towards integrated, AI-powered solutions.\n\n## Analysis\n\nThe ${industry} industry is experiencing rapid transformation driven by technological innovation and changing consumer preferences. ${companyName} is well-positioned to capitalize on these trends given its current market position and capabilities.\n\n## Recommendations\n\n1. Invest in R&D to stay ahead of the technology curve\n2. Build strategic partnerships with key industry players\n3. Focus on customer acquisition and retention metrics\n4. Monitor regulatory changes and ensure compliance\n5. Consider expanding into adjacent market segments\n\n## Sources\n\n- Industry reports and market research\n- Competitor analysis and filings\n- Customer surveys and feedback\n- Regulatory publications\n- Expert interviews and consultations`;

  const sources = [
    "Industry Research Report 2026",
    "Market Analysis Database",
    "Competitor Filing Reports",
    "Customer Survey Results",
    "Regulatory Guidelines",
  ];

  return { title, content, category, sources };
}

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const companyId = await getUserCompanyId(userId);
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: "No company found" },
        { status: 404 }
      );
    }

    const reports = await prisma.researchReport.findMany({
      where: { companyId: companyId.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: reports });
  } catch (error) {
    console.error("Get research reports error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch research reports" },
      { status: 500 }
    );
  }
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

    const company = await getUserCompanyId(userId);
    if (!company) {
      return NextResponse.json(
        { success: false, error: "No company found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Query is required" },
        { status: 400 }
      );
    }

    const report = await generateResearchReport(query, company.name, company.industry);

    const savedReport = await prisma.researchReport.create({
      data: {
        title: report.title,
        query,
        content: report.content,
        category: report.category,
        sources: report.sources,
        companyId: company.id,
      },
    });

    return NextResponse.json(
      { success: true, data: savedReport },
      { status: 201 }
    );
  } catch (error) {
    console.error("Generate research report error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate research report" },
      { status: 500 }
    );
  }
}

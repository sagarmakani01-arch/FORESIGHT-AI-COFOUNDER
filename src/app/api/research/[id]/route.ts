import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

async function getAuthUserId() {
  const session = await getServerSession();
  if (!session?.user) return null;
  return (session.user as { id: string }).id;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const report = await prisma.researchReport.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: "Research report not found" },
        { status: 404 }
      );
    }

    const company = await prisma.company.findFirst({
      where: { id: report.companyId, userId },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    console.error("Get research report error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch research report" },
      { status: 500 }
    );
  }
}

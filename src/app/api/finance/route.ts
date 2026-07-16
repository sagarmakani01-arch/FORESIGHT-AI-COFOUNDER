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
    select: { id: true },
  });
  return company?.id;
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: Record<string, unknown> = { companyId };
    if (type) where.type = type.toUpperCase();
    if (category) where.category = category.toUpperCase();
    if (startDate || endDate) {
      where.date = {};
      if (startDate) (where.date as Record<string, unknown>).gte = new Date(startDate);
      if (endDate) (where.date as Record<string, unknown>).lte = new Date(endDate);
    }

    const entries = await prisma.financeEntry.findMany({
      where,
      orderBy: { date: "desc" },
    });

    const totalRevenue = entries
      .filter((e) => e.type === "REVENUE")
      .reduce((sum, e) => sum + e.amount, 0);

    const totalExpenses = entries
      .filter((e) => e.type === "EXPENSE")
      .reduce((sum, e) => sum + e.amount, 0);

    const totalInvestment = entries
      .filter((e) => e.type === "INVESTMENT")
      .reduce((sum, e) => sum + e.amount, 0);

    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recentExpenses = entries
      .filter((e) => e.type === "EXPENSE" && new Date(e.date) >= threeMonthsAgo)
      .reduce((sum, e) => sum + e.amount, 0);

    const burnRate = recentExpenses / 3;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { runway: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        entries,
        summary: {
          totalRevenue,
          totalExpenses,
          totalInvestment,
          burnRate: Math.round(burnRate),
          runway: company?.runway || 0,
        },
      },
    });
  } catch (error) {
    console.error("Get finance entries error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch finance entries" },
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

    const companyId = await getUserCompanyId(userId);
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: "No company found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { type, amount, category, date, description } = body;

    if (!type || amount === undefined || !category || !date || !description) {
      return NextResponse.json(
        { success: false, error: "Type, amount, category, date, and description are required" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    const entry = await prisma.financeEntry.create({
      data: {
        type: type.toUpperCase(),
        amount,
        category: category.toUpperCase(),
        date: new Date(date),
        description,
        companyId,
      },
    });

    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    console.error("Create finance entry error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create finance entry" },
      { status: 500 }
    );
  }
}

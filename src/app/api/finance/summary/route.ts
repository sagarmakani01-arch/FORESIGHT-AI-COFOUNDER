import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

async function getAuthUserId() {
  const session = await getServerSession();
  if (!session?.user) return null;
  return (session.user as { id: string }).id;
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

    const company = await prisma.company.findUnique({
      where: { userId },
      select: { id: true, monthlyBurn: true, runway: true },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: "No company found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const entries = await prisma.financeEntry.findMany({
      where: {
        companyId: company.id,
        date: { gte: twelveMonthsAgo },
      },
      orderBy: { date: "asc" },
    });

    const monthlyData: Record<
      string,
      { revenue: number; expenses: number; investment: number; loan: number }
    > = {};

    for (let i = 0; i < 12; i++) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[key] = { revenue: 0, expenses: 0, investment: 0, loan: 0 };
    }

    for (const entry of entries) {
      const d = new Date(entry.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyData[key]) {
        const type = entry.type.toLowerCase() as keyof (typeof monthlyData)[string];
        monthlyData[key][type] += entry.amount;
      }
    }

    const monthlyRevenueVsExpenses = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        expenses: data.expenses,
        net: data.revenue - data.expenses,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const lastThreeMonthsExpenses = entries
      .filter((e) => {
        const d = new Date(e.date);
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return e.type === "EXPENSE" && d >= threeMonthsAgo;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const burnRate = lastThreeMonthsExpenses / 3;

    const totalInvestment = entries
      .filter((e) => e.type === "INVESTMENT")
      .reduce((sum, e) => sum + e.amount, 0);

    const totalRevenue = entries
      .filter((e) => e.type === "REVENUE")
      .reduce((sum, e) => sum + e.amount, 0);

    const totalExpenses = entries
      .filter((e) => e.type === "EXPENSE")
      .reduce((sum, e) => sum + e.amount, 0);

    const runway = burnRate > 0 ? Math.floor(totalInvestment / burnRate) : 0;

    const categoryBreakdown: Record<string, number> = {};
    for (const entry of entries) {
      if (entry.type === "EXPENSE") {
        const cat = entry.category.toLowerCase();
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + entry.amount;
      }
    }

    const growthTrends = monthlyRevenueVsExpenses.slice(-6).map((m, i, arr) => {
      const prev = i > 0 ? arr[i - 1].revenue : 0;
      const growth = prev > 0 ? ((m.revenue - prev) / prev) * 100 : 0;
      return { month: m.month, revenue: m.revenue, growth: Math.round(growth * 10) / 10 };
    });

    return NextResponse.json({
      success: true,
      data: {
        monthlyRevenueVsExpenses,
        burnRate: Math.round(burnRate),
        runway,
        totalRevenue,
        totalExpenses,
        totalInvestment,
        categoryBreakdown,
        growthTrends,
      },
    });
  } catch (error) {
    console.error("Get financial summary error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch financial summary" },
      { status: 500 }
    );
  }
}

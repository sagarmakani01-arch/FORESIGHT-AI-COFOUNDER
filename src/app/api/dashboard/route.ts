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
      select: {
        id: true,
        name: true,
        industry: true,
        stage: true,
        teamSize: true,
      },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: "No company found" },
        { status: 404 }
      );
    }

    const companyId = company.id;

    const [
      projectCount,
      taskCount,
      documentCount,
      milestoneCount,
      competitorCount,
      investorCount,
      roadmapCount,
      projectsByStatus,
      tasksByStatus,
      recentProjects,
      upcomingMilestones,
      activeInvestors,
      financeEntries,
    ] = await Promise.all([
      prisma.project.count({ where: { companyId } }),
      prisma.task.count({ where: { project: { companyId } } }),
      prisma.document.count({ where: { companyId } }),
      prisma.milestone.count({ where: { companyId } }),
      prisma.competitor.count({ where: { companyId } }),
      prisma.investor.count({ where: { companyId } }),
      prisma.roadmap.count({ where: { companyId } }),
      prisma.project.groupBy({
        by: ["status"],
        where: { companyId },
        _count: true,
      }),
      prisma.task.groupBy({
        by: ["status"],
        where: { project: { companyId } },
        _count: true,
      }),
      prisma.project.findMany({
        where: { companyId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, name: true, status: true, priority: true, updatedAt: true },
      }),
      prisma.milestone.findMany({
        where: {
          companyId,
          deadline: { gte: new Date() },
          status: { notIn: ["COMPLETED", "CANCELLED"] },
        },
        orderBy: { deadline: "asc" },
        take: 5,
      }),
      prisma.investor.findMany({
        where: {
          companyId,
          status: { notIn: ["CLOSED", "PASSED"] },
        },
        orderBy: { lastContact: "desc" },
        take: 5,
      }),
      prisma.financeEntry.findMany({
        where: { companyId },
        orderBy: { date: "desc" },
        take: 10,
      }),
    ]);

    const totalTasks = taskCount;
    const completedTasksRow = tasksByStatus.find((s: { status: string; _count: number }) => s.status === "DONE");
    const completedTasks = completedTasksRow?._count || 0;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recentExpenses = financeEntries
      .filter((e) => e.type === "EXPENSE" && new Date(e.date) >= threeMonthsAgo)
      .reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);

    const burnRate = recentExpenses / 3;

    const recentRevenue = financeEntries
      .filter((e) => e.type === "REVENUE" && new Date(e.date) >= threeMonthsAgo)
      .reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);

    const monthlyRevenue = recentRevenue / 3;

    const totalInvestment = financeEntries
      .filter((e) => e.type === "INVESTMENT")
      .reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);

    const runway = burnRate > 0 ? Math.floor((totalInvestment - recentExpenses) / burnRate) : 0;

    const projectStatusSummary = projectsByStatus.map((s: { status: string; _count: number }) => ({
      status: s.status,
      count: s._count,
    }));

    const taskStatusSummary = tasksByStatus.map((s: { status: string; _count: number }) => ({
      status: s.status,
      count: s._count,
    }));

    return NextResponse.json({
      success: true,
      data: {
        company,
        metrics: {
          totalProjects: projectCount,
          totalTasks,
          taskCompletionRate,
          totalDocuments: documentCount,
          totalMilestones: milestoneCount,
          totalCompetitors: competitorCount,
          totalInvestors: investorCount,
          totalRoadmaps: roadmapCount,
          monthlyRevenue: Math.round(monthlyRevenue),
          burnRate: Math.round(burnRate),
          runway,
        },
        projectStatusSummary,
        taskStatusSummary,
        recentProjects,
        upcomingMilestones,
        activeInvestors,
        recentActivity: financeEntries.slice(0, 5),
      },
    });
  } catch (error) {
    console.error("Get dashboard data error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

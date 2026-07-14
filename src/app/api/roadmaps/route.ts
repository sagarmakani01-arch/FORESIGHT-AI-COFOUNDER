import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

async function getAuthUserId() {
  const session = await getServerSession();
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

    const roadmaps = await prisma.roadmap.findMany({
      where: { companyId },
      include: {
        phases: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: roadmaps });
  } catch (error) {
    console.error("Get roadmaps error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch roadmaps" },
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
    const { title, startDate, endDate, phases } = body;

    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "Title, startDate, and endDate are required" },
        { status: 400 }
      );
    }

    const roadmap = await prisma.roadmap.create({
      data: {
        title,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        companyId,
        phases: phases?.length
          ? {
              create: phases.map(
                (
                  phase: {
                    title: string;
                    description: string;
                    startDate: string;
                    endDate: string;
                    tasks: string[];
                  },
                  index: number
                ) => ({
                  title: phase.title,
                  description: phase.description,
                  startDate: new Date(phase.startDate),
                  endDate: new Date(phase.endDate),
                  tasks: phase.tasks || [],
                  sortOrder: index,
                })
              ),
            }
          : undefined,
      },
      include: {
        phases: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json(
      { success: true, data: roadmap },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create roadmap error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create roadmap" },
      { status: 500 }
    );
  }
}

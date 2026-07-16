import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

async function getAuthUserId() {
  const session = await getServerSession(authOptions);
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

    const roadmap = await prisma.roadmap.findUnique({
      where: { id },
      include: {
        phases: { orderBy: { sortOrder: "asc" } },
        company: { select: { userId: true } },
      },
    });

    if (!roadmap) {
      return NextResponse.json(
        { success: false, error: "Roadmap not found" },
        { status: 404 }
      );
    }

    if (roadmap.company.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { company: _company, ...roadmapData } = roadmap;
    return NextResponse.json({ success: true, data: roadmapData });
  } catch (error) {
    console.error("Get roadmap error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch roadmap" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const existingRoadmap = await prisma.roadmap.findUnique({
      where: { id },
      include: { company: { select: { userId: true } } },
    });

    if (!existingRoadmap) {
      return NextResponse.json(
        { success: false, error: "Roadmap not found" },
        { status: 404 }
      );
    }

    if (existingRoadmap.company.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, startDate, endDate, phases } = body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);

    if (phases !== undefined) {
      await prisma.roadmapPhase.deleteMany({ where: { roadmapId: id } });
      if (phases.length > 0) {
        await prisma.roadmapPhase.createMany({
          data: phases.map(
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
              roadmapId: id,
              title: phase.title,
              description: phase.description,
              startDate: new Date(phase.startDate),
              endDate: new Date(phase.endDate),
              tasks: phase.tasks || [],
              sortOrder: index,
            })
          ),
        });
      }
    }

    const roadmap = await prisma.roadmap.update({
      where: { id },
      data: updateData,
      include: {
        phases: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json({ success: true, data: roadmap });
  } catch (error) {
    console.error("Update roadmap error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update roadmap" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const existingRoadmap = await prisma.roadmap.findUnique({
      where: { id },
      include: { company: { select: { userId: true } } },
    });

    if (!existingRoadmap) {
      return NextResponse.json(
        { success: false, error: "Roadmap not found" },
        { status: 404 }
      );
    }

    if (existingRoadmap.company.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.roadmap.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("Delete roadmap error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete roadmap" },
      { status: 500 }
    );
  }
}

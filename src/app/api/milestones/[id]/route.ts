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

    const existingMilestone = await prisma.milestone.findUnique({
      where: { id },
      include: { company: { select: { userId: true } } },
    });

    if (!existingMilestone) {
      return NextResponse.json(
        { success: false, error: "Milestone not found" },
        { status: 404 }
      );
    }

    if (existingMilestone.company.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, deadline, progress, status } = body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (deadline !== undefined) updateData.deadline = new Date(deadline);
    if (progress !== undefined) updateData.progress = Math.min(100, Math.max(0, progress));
    if (status !== undefined) updateData.status = status.toUpperCase();

    const milestone = await prisma.milestone.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: milestone });
  } catch (error) {
    console.error("Update milestone error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update milestone" },
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

    const existingMilestone = await prisma.milestone.findUnique({
      where: { id },
      include: { company: { select: { userId: true } } },
    });

    if (!existingMilestone) {
      return NextResponse.json(
        { success: false, error: "Milestone not found" },
        { status: 404 }
      );
    }

    if (existingMilestone.company.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.milestone.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("Delete milestone error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete milestone" },
      { status: 500 }
    );
  }
}

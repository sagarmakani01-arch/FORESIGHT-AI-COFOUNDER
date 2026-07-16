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

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true, companyId: true },
        },
        dependencies: { select: { dependsOnId: true } },
        dependents: { select: { taskId: true } },
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    const company = await prisma.company.findFirst({
      where: { userId, id: task.project.companyId },
    });
    if (!company) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error("Get task error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch task" },
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

    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: { project: { select: { companyId: true } } },
    });

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    const company = await prisma.company.findFirst({
      where: { userId, id: existingTask.project.companyId },
    });
    if (!company) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, status, priority, assigneeId, deadline, dependencyIds } = body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined)
      updateData.status = status.toUpperCase().replace("-", "_");
    if (priority !== undefined) updateData.priority = priority.toUpperCase();
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null;
    if (deadline !== undefined)
      updateData.deadline = deadline ? new Date(deadline) : null;

    if (dependencyIds !== undefined) {
      await prisma.taskDependency.deleteMany({ where: { taskId: id } });
      if (dependencyIds.length > 0) {
        await prisma.taskDependency.createMany({
          data: dependencyIds.map((dependsOnId: string) => ({
            taskId: id,
            dependsOnId,
          })),
        });
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        dependencies: { select: { dependsOnId: true } },
      },
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update task" },
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

    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: { project: { select: { companyId: true } } },
    });

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    const company = await prisma.company.findFirst({
      where: { userId, id: existingTask.project.companyId },
    });
    if (!company) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete task" },
      { status: 500 }
    );
  }
}

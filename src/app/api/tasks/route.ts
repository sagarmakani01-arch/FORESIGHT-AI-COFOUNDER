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
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const projectId = searchParams.get("projectId");
    const assignee = searchParams.get("assignee");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {
      project: { companyId },
    };

    if (status) where.status = status.toUpperCase().replace("-", "_");
    if (priority) where.priority = priority.toUpperCase();
    if (projectId) where.projectId = projectId;
    if (assignee) where.assigneeId = assignee;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        dependencies: { select: { dependsOnId: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tasks" },
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
    const { title, description, status, priority, assigneeId, deadline, projectId, dependencyIds } = body;

    if (!title || !description || !projectId) {
      return NextResponse.json(
        { success: false, error: "Title, description, and projectId are required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, companyId },
    });
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: (status?.toUpperCase().replace("-", "_") || "TODO") as never,
        priority: (priority?.toUpperCase() || "MEDIUM") as never,
        assigneeId: assigneeId || null,
        deadline: deadline ? new Date(deadline) : null,
        projectId,
        dependencies: dependencyIds?.length
          ? {
              create: dependencyIds.map((dependsOnId: string) => ({
                dependsOnId,
              })),
            }
          : undefined,
      },
      include: {
        dependencies: { select: { dependsOnId: true } },
      },
    });

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create task" },
      { status: 500 }
    );
  }
}

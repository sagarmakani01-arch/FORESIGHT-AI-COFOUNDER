import { authOptions } from "@/lib/auth/config";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

async function getAuthUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return (session.user as { id: string }).id;
}

async function getUserCompany(userId: string) {
  return prisma.company.findUnique({ where: { userId } });
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

    const company = await getUserCompany(userId);
    if (!company) {
      return NextResponse.json(
        { success: false, error: "No company found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { companyId: company.id };
    if (status) where.status = status.toUpperCase().replace("-", "_");
    if (priority) where.priority = priority.toUpperCase();
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        _count: { select: { tasks: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch projects" },
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

    const company = await getUserCompany(userId);
    if (!company) {
      return NextResponse.json(
        { success: false, error: "No company found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, status, priority, deadline } = body;

    if (!name || !description) {
      return NextResponse.json(
        { success: false, error: "Name and description are required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status: (status?.toUpperCase().replace("-", "_") || "PLANNING") as never,
        priority: (priority?.toUpperCase() || "MEDIUM") as never,
        deadline: deadline ? new Date(deadline) : null,
        companyId: company.id,
      },
    });

    await logAudit({
      action: "CREATE",
      entity: "project",
      entityId: project.id,
      userId,
      metadata: { name },
    });

    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create project" },
      { status: 500 }
    );
  }
}

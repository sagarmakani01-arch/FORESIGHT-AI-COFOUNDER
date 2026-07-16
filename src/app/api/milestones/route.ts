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

    const milestones = await prisma.milestone.findMany({
      where: { companyId },
      orderBy: { deadline: "asc" },
    });

    return NextResponse.json({ success: true, data: milestones });
  } catch (error) {
    console.error("Get milestones error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch milestones" },
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
    const { title, description, deadline, progress, status } = body;

    if (!title || !description || !deadline) {
      return NextResponse.json(
        { success: false, error: "Title, description, and deadline are required" },
        { status: 400 }
      );
    }

    const milestone = await prisma.milestone.create({
      data: {
        title,
        description,
        deadline: new Date(deadline),
        progress: progress || 0,
        status: (status?.toUpperCase() || "PENDING") as never,
        companyId,
      },
    });

    return NextResponse.json(
      { success: true, data: milestone },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create milestone error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create milestone" },
      { status: 500 }
    );
  }
}

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
    const search = searchParams.get("search");
    const type = searchParams.get("type");

    const where: Record<string, unknown> = { companyId };
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { content: { contains: search, mode: "insensitive" } },
        { type: { contains: search, mode: "insensitive" } },
      ];
    }

    const entries = await prisma.knowledgeEntry.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    console.error("Get knowledge entries error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch knowledge entries" },
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
    const { type, content, metadata } = body;

    if (!type || !content) {
      return NextResponse.json(
        { success: false, error: "Type and content are required" },
        { status: 400 }
      );
    }

    const entry = await prisma.knowledgeEntry.create({
      data: {
        type,
        content,
        metadata: metadata || undefined,
        companyId,
      },
    });

    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    console.error("Create knowledge entry error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create knowledge entry" },
      { status: 500 }
    );
  }
}

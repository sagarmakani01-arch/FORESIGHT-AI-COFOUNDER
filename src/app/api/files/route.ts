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
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ success: true, data: [] });
    }

    const entries = await prisma.fileEntry.findMany({
      where: { companyId: company.id },
      include: { children: true },
    });

    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    console.error("Get files error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch files" },
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

    const company = await prisma.company.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: "No company found. Complete onboarding first." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, type, parentId, content } = body;

    if (!name || !type) {
      return NextResponse.json(
        { success: false, error: "Name and type are required" },
        { status: 400 }
      );
    }

    if (parentId) {
      const parent = await prisma.fileEntry.findUnique({
        where: { id: parentId },
        select: { id: true, companyId: true },
      });

      if (!parent || parent.companyId !== company.id) {
        return NextResponse.json(
          { success: false, error: "Invalid parent folder" },
          { status: 400 }
        );
      }
    }

    const entry = await prisma.fileEntry.create({
      data: {
        name,
        type,
        companyId: company.id,
        parentId: parentId || null,
        content: type === "file" ? (content || "") : "",
        aiNotes: "",
      },
    });

    await logAudit({
      action: "CREATE",
      entity: "file",
      entityId: entry.id,
      userId,
      metadata: { name, type },
    });

    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    console.error("Create file error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create file" },
      { status: 500 }
    );
  }
}

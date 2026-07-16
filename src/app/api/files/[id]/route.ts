import { authOptions } from "@/lib/auth/config";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

async function getAuthUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return (session.user as { id: string }).id;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
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
        { success: false, error: "No company found" },
        { status: 404 }
      );
    }

    const existing = await prisma.fileEntry.findUnique({
      where: { id },
      select: { companyId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    if (existing.companyId !== company.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.sharedWithAI !== undefined) updateData.sharedWithAI = body.sharedWithAI;
    if (body.aiNotes !== undefined) updateData.aiNotes = body.aiNotes;

    const entry = await prisma.fileEntry.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    console.error("Update file error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update file" },
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

    const company = await prisma.company.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: "No company found" },
        { status: 404 }
      );
    }

    const existing = await prisma.fileEntry.findUnique({
      where: { id },
      select: { companyId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    if (existing.companyId !== company.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.fileEntry.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("Delete file error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete file" },
      { status: 500 }
    );
  }
}

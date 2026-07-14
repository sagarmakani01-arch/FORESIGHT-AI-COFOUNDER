import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

async function getAuthUserId() {
  const session = await getServerSession();
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

    const existingEntry = await prisma.financeEntry.findUnique({
      where: { id },
      include: { company: { select: { userId: true } } },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { success: false, error: "Finance entry not found" },
        { status: 404 }
      );
    }

    if (existingEntry.company.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, amount, category, date, description } = body;

    const updateData: Record<string, unknown> = {};
    if (type !== undefined) updateData.type = type.toUpperCase();
    if (amount !== undefined) updateData.amount = amount;
    if (category !== undefined) updateData.category = category.toUpperCase();
    if (date !== undefined) updateData.date = new Date(date);
    if (description !== undefined) updateData.description = description;

    const entry = await prisma.financeEntry.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    console.error("Update finance entry error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update finance entry" },
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

    const existingEntry = await prisma.financeEntry.findUnique({
      where: { id },
      include: { company: { select: { userId: true } } },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { success: false, error: "Finance entry not found" },
        { status: 404 }
      );
    }

    if (existingEntry.company.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.financeEntry.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("Delete finance entry error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete finance entry" },
      { status: 500 }
    );
  }
}

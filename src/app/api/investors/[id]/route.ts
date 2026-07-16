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

    const investor = await prisma.investor.findUnique({
      where: { id },
      include: { company: { select: { userId: true } } },
    });

    if (!investor) {
      return NextResponse.json(
        { success: false, error: "Investor not found" },
        { status: 404 }
      );
    }

    if (investor.company.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { company: _company, ...investorData } = investor;
    return NextResponse.json({ success: true, data: investorData });
  } catch (error) {
    console.error("Get investor error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch investor" },
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

    const existingInvestor = await prisma.investor.findUnique({
      where: { id },
      include: { company: { select: { userId: true } } },
    });

    if (!existingInvestor) {
      return NextResponse.json(
        { success: false, error: "Investor not found" },
        { status: 404 }
      );
    }

    if (existingInvestor.company.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, firm, stage, status, email, phone, notes, lastContact } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (firm !== undefined) updateData.firm = firm;
    if (stage !== undefined) updateData.stage = stage.toUpperCase().replace("-", "_");
    if (status !== undefined) updateData.status = status.toUpperCase().replace("-", "_");
    if (email !== undefined) updateData.email = email || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (notes !== undefined) updateData.notes = notes || null;
    if (lastContact !== undefined)
      updateData.lastContact = lastContact ? new Date(lastContact) : null;

    const investor = await prisma.investor.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: investor });
  } catch (error) {
    console.error("Update investor error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update investor" },
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

    const existingInvestor = await prisma.investor.findUnique({
      where: { id },
      include: { company: { select: { userId: true } } },
    });

    if (!existingInvestor) {
      return NextResponse.json(
        { success: false, error: "Investor not found" },
        { status: 404 }
      );
    }

    if (existingInvestor.company.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.investor.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("Delete investor error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete investor" },
      { status: 500 }
    );
  }
}

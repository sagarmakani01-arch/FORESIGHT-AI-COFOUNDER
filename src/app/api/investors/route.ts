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

    const investors = await prisma.investor.findMany({
      where: { companyId },
      orderBy: { lastContact: "desc" },
    });

    return NextResponse.json({ success: true, data: investors });
  } catch (error) {
    console.error("Get investors error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch investors" },
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
    const { name, firm, stage, status, email, phone, notes, lastContact } = body;

    if (!name || !firm || !stage) {
      return NextResponse.json(
        { success: false, error: "Name, firm, and stage are required" },
        { status: 400 }
      );
    }

    const investor = await prisma.investor.create({
      data: {
        name,
        firm,
        stage: stage.toUpperCase().replace("-", "_"),
        status: (status?.toUpperCase().replace("-", "_") || "PROSPECTING"),
        email: email || null,
        phone: phone || null,
        notes: notes || null,
        lastContact: lastContact ? new Date(lastContact) : new Date(),
        companyId,
      },
    });

    return NextResponse.json(
      { success: true, data: investor },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create investor error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add investor" },
      { status: 500 }
    );
  }
}

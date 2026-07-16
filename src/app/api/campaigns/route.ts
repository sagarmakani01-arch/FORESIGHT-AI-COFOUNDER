import { authOptions } from "@/lib/auth/config";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

async function getAuthUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return (session.user as { id: string }).id;
}

const VALID_TYPES = ["EMAIL", "SOCIAL", "CONTENT", "REFERRAL", "PARTNERSHIP", "ADS"];
const VALID_STATUSES = ["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"];

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const company = await prisma.company.findUnique({ where: { userId }, select: { id: true } });
    if (!company) {
      return NextResponse.json({ success: false, error: "No company found" }, { status: 404 });
    }

    const campaigns = await prisma.campaign.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: campaigns });
  } catch (error) {
    console.error("Get campaigns error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const company = await prisma.company.findUnique({ where: { userId }, select: { id: true } });
    if (!company) {
      return NextResponse.json({ success: false, error: "No company found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, type, status, budget, startDate, endDate, notes } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }

    const normalizedType = type?.toUpperCase();
    if (normalizedType && !VALID_TYPES.includes(normalizedType)) {
      return NextResponse.json({ success: false, error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}` }, { status: 400 });
    }

    const normalizedStatus = status?.toUpperCase();
    if (normalizedStatus && !VALID_STATUSES.includes(normalizedStatus)) {
      return NextResponse.json({ success: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        name: name.trim(),
        type: normalizedType || "SOCIAL",
        status: normalizedStatus || "DRAFT",
        budget: budget || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        notes: notes || "",
        companyId: company.id,
      },
    });

    return NextResponse.json({ success: true, data: campaign }, { status: 201 });
  } catch (error) {
    console.error("Create campaign error:", error);
    return NextResponse.json({ success: false, error: "Failed to create campaign" }, { status: 500 });
  }
}

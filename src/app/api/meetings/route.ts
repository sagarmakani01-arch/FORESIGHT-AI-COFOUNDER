import { authOptions } from "@/lib/auth/config";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

async function getAuthUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return (session.user as { id: string }).id;
}

const VALID_STATUSES = ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"];

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

    const meetings = await prisma.meeting.findMany({
      where: { companyId: company.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ success: true, data: meetings });
  } catch (error) {
    console.error("Get meetings error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch meetings" }, { status: 500 });
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
    const { title, date, attendees, notes, status } = body;

    if (!title || !date) {
      return NextResponse.json({ success: false, error: "Title and date are required" }, { status: 400 });
    }

    const normalizedStatus = status?.toUpperCase();
    if (normalizedStatus && !VALID_STATUSES.includes(normalizedStatus)) {
      return NextResponse.json({ success: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` }, { status: 400 });
    }

    const meeting = await prisma.meeting.create({
      data: {
        title: title.trim(),
        date: new Date(date),
        attendees: attendees || "",
        notes: notes || "",
        status: normalizedStatus || "SCHEDULED",
        companyId: company.id,
      },
    });

    return NextResponse.json({ success: true, data: meeting }, { status: 201 });
  } catch (error) {
    console.error("Create meeting error:", error);
    return NextResponse.json({ success: false, error: "Failed to create meeting" }, { status: 500 });
  }
}

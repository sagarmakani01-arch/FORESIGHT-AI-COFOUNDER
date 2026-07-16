import { authOptions } from "@/lib/auth/config";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

async function getAuthUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return (session.user as { id: string }).id;
}

const VALID_STATUSES = ["SOURCING", "SCREENING", "INTERVIEWING", "OFFER", "HIRED", "CLOSED"];

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

    const positions = await prisma.position.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: positions });
  } catch (error) {
    console.error("Get positions error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch positions" }, { status: 500 });
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
    const { title, department, status, description, salary, location } = body;

    if (!title || !department) {
      return NextResponse.json({ success: false, error: "Title and department are required" }, { status: 400 });
    }

    const normalizedStatus = status?.toUpperCase();
    if (normalizedStatus && !VALID_STATUSES.includes(normalizedStatus)) {
      return NextResponse.json({ success: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` }, { status: 400 });
    }

    const position = await prisma.position.create({
      data: {
        title: title.trim(),
        department: department.trim(),
        status: normalizedStatus || "SOURCING",
        description: description || "",
        salary: salary || null,
        location: location || null,
        companyId: company.id,
      },
    });

    return NextResponse.json({ success: true, data: position }, { status: 201 });
  } catch (error) {
    console.error("Create position error:", error);
    return NextResponse.json({ success: false, error: "Failed to create position" }, { status: 500 });
  }
}

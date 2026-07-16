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

    const competitors = await prisma.competitor.findMany({
      where: { companyId },
      orderBy: { lastUpdated: "desc" },
    });

    return NextResponse.json({ success: true, data: competitors });
  } catch (error) {
    console.error("Get competitors error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch competitors" },
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
    const { name, industry, website, features, pricing, strengths, weaknesses, funding, traffic, reviews } = body;

    if (!name || !industry) {
      return NextResponse.json(
        { success: false, error: "Name and industry are required" },
        { status: 400 }
      );
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true, industry: true },
    });

    const competitor = await prisma.competitor.create({
      data: {
        name,
        industry,
        website: website || null,
        features: features || [],
        pricing: pricing || null,
        strengths: strengths || [],
        weaknesses: weaknesses || [],
        funding: funding || null,
        traffic: traffic || null,
        reviews: reviews || null,
        companyId,
      },
    });

    await logAudit({
      action: "CREATE",
      entity: "competitor",
      entityId: competitor.id,
      userId,
      metadata: { name, industry },
    });

    return NextResponse.json(
      { success: true, data: competitor },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create competitor error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add competitor" },
      { status: 500 }
    );
  }
}

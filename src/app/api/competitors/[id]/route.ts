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

    const competitor = await prisma.competitor.findUnique({
      where: { id },
      include: { company: { select: { userId: true } } },
    });

    if (!competitor) {
      return NextResponse.json(
        { success: false, error: "Competitor not found" },
        { status: 404 }
      );
    }

    if (competitor.company.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { company: _company, ...competitorData } = competitor;
    return NextResponse.json({ success: true, data: competitorData });
  } catch (error) {
    console.error("Get competitor error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch competitor" },
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

    const existingCompetitor = await prisma.competitor.findUnique({
      where: { id },
      include: { company: { select: { userId: true } } },
    });

    if (!existingCompetitor) {
      return NextResponse.json(
        { success: false, error: "Competitor not found" },
        { status: 404 }
      );
    }

    if (existingCompetitor.company.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, industry, website, features, pricing, strengths, weaknesses, funding, traffic, reviews } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (industry !== undefined) updateData.industry = industry;
    if (website !== undefined) updateData.website = website;
    if (features !== undefined) updateData.features = features;
    if (pricing !== undefined) updateData.pricing = pricing;
    if (strengths !== undefined) updateData.strengths = strengths;
    if (weaknesses !== undefined) updateData.weaknesses = weaknesses;
    if (funding !== undefined) updateData.funding = funding;
    if (traffic !== undefined) updateData.traffic = traffic;
    if (reviews !== undefined) updateData.reviews = reviews;
    updateData.lastUpdated = new Date();

    const competitor = await prisma.competitor.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: competitor });
  } catch (error) {
    console.error("Update competitor error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update competitor" },
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

    const existingCompetitor = await prisma.competitor.findUnique({
      where: { id },
      include: { company: { select: { userId: true } } },
    });

    if (!existingCompetitor) {
      return NextResponse.json(
        { success: false, error: "Competitor not found" },
        { status: 404 }
      );
    }

    if (existingCompetitor.company.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.competitor.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("Delete competitor error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete competitor" },
      { status: 500 }
    );
  }
}

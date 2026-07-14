import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

async function getAuthUserId() {
  const session = await getServerSession();
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
      include: {
        _count: {
          select: {
            projects: true,
            documents: true,
            milestones: true,
            financeEntries: true,
            competitors: true,
            roadmaps: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: "No company found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: company });
  } catch (error) {
    console.error("Get company error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch company" },
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

    const existingCompany = await prisma.company.findUnique({
      where: { userId },
    });
    if (existingCompany) {
      return NextResponse.json(
        { success: false, error: "Company already exists for this user" },
        { status: 409 }
      );
    }

    const body = await request.json();
    const {
      name,
      industry,
      stage,
      vision,
      mission,
      description,
      website,
      location,
      teamSize,
      foundedDate,
    } = body;

    if (!name || !industry || !vision || !mission || !description) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, industry, vision, mission, and description are required",
        },
        { status: 400 }
      );
    }

    const company = await prisma.company.create({
      data: {
        name,
        industry,
        stage: stage || "IDEA",
        vision,
        mission,
        description,
        website: website || null,
        location: location || null,
        teamSize: teamSize || 1,
        foundedDate: foundedDate ? new Date(foundedDate) : null,
        userId,
      },
    });

    return NextResponse.json({ success: true, data: company }, { status: 201 });
  } catch (error) {
    console.error("Create company error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create company" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const existingCompany = await prisma.company.findUnique({
      where: { userId },
    });
    if (!existingCompany) {
      return NextResponse.json(
        { success: false, error: "No company found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      name,
      industry,
      stage,
      vision,
      mission,
      description,
      website,
      logoUrl,
      location,
      teamSize,
      foundedDate,
      targetMarket,
      businessModel,
      revenueStreams,
      fundingStatus,
      monthlyBurn,
      runway,
      keyMetrics,
      challenges,
      goals,
    } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (industry !== undefined) updateData.industry = industry;
    if (stage !== undefined) updateData.stage = stage;
    if (vision !== undefined) updateData.vision = vision;
    if (mission !== undefined) updateData.mission = mission;
    if (description !== undefined) updateData.description = description;
    if (website !== undefined) updateData.website = website;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (location !== undefined) updateData.location = location;
    if (teamSize !== undefined) updateData.teamSize = teamSize;
    if (foundedDate !== undefined)
      updateData.foundedDate = foundedDate ? new Date(foundedDate) : null;
    if (targetMarket !== undefined) updateData.targetMarket = targetMarket;
    if (businessModel !== undefined) updateData.businessModel = businessModel;
    if (revenueStreams !== undefined) updateData.revenueStreams = revenueStreams;
    if (fundingStatus !== undefined) updateData.fundingStatus = fundingStatus;
    if (monthlyBurn !== undefined) updateData.monthlyBurn = monthlyBurn;
    if (runway !== undefined) updateData.runway = runway;
    if (keyMetrics !== undefined) updateData.keyMetrics = keyMetrics;
    if (challenges !== undefined) updateData.challenges = challenges;
    if (goals !== undefined) updateData.goals = goals;

    const company = await prisma.company.update({
      where: { id: existingCompany.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: company });
  } catch (error) {
    console.error("Update company error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update company" },
      { status: 500 }
    );
  }
}

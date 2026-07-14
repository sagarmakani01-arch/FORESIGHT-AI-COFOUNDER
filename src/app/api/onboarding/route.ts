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

    const onboarding = await prisma.onboarding.findUnique({
      where: { userId },
    });

    if (!onboarding) {
      return NextResponse.json({
        success: true,
        data: { completed: false, step: 0, data: {} },
      });
    }

    return NextResponse.json({ success: true, data: onboarding });
  } catch (error) {
    console.error("Get onboarding error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch onboarding status" },
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

    const body = await request.json();
    const { step, data } = body;

    if (step === undefined || !data) {
      return NextResponse.json(
        { success: false, error: "Step and data are required" },
        { status: 400 }
      );
    }

    const onboarding = await prisma.onboarding.upsert({
      where: { userId },
      update: { step, data },
      create: { userId, step, data },
    });

    return NextResponse.json({ success: true, data: onboarding });
  } catch (error) {
    console.error("Save onboarding error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save onboarding data" },
      { status: 500 }
    );
  }
}

export async function PUT() {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const onboarding = await prisma.onboarding.findUnique({
      where: { userId },
    });

    if (!onboarding) {
      return NextResponse.json(
        { success: false, error: "No onboarding in progress" },
        { status: 404 }
      );
    }

    const onboardingData = onboarding.data as Record<string, unknown>;

    const company = await prisma.company.upsert({
      where: { userId },
      update: {
        name: (onboardingData.companyName as string) || "My Company",
        industry: (onboardingData.industry as string) || "other",
        stage: (onboardingData.stage as never) || "IDEA",
        vision: (onboardingData.vision as string) || "",
        mission: (onboardingData.mission as string) || "",
        description: (onboardingData.description as string) || "",
        website: (onboardingData.website as string) || null,
        location: (onboardingData.location as string) || null,
        teamSize: (onboardingData.teamSize as number) || 1,
        foundedDate: onboardingData.foundedDate
          ? new Date(onboardingData.foundedDate as string)
          : null,
        targetMarket: (onboardingData.targetMarket as string) || null,
        businessModel: (onboardingData.businessModel as string) || null,
        revenueStreams: (onboardingData.revenueStreams as string[]) || [],
        fundingStatus: (onboardingData.fundingStatus as string) || null,
        monthlyBurn: (onboardingData.monthlyBurn as number) || null,
        runway: (onboardingData.runway as number) || null,
        keyMetrics: (onboardingData.keyMetrics as string[]) || [],
        challenges: (onboardingData.challenges as string[]) || [],
        goals: (onboardingData.goals as string[]) || [],
      },
      create: {
        userId,
        name: (onboardingData.companyName as string) || "My Company",
        industry: (onboardingData.industry as string) || "other",
        stage: (onboardingData.stage as never) || "IDEA",
        vision: (onboardingData.vision as string) || "",
        mission: (onboardingData.mission as string) || "",
        description: (onboardingData.description as string) || "",
        website: (onboardingData.website as string) || null,
        location: (onboardingData.location as string) || null,
        teamSize: (onboardingData.teamSize as number) || 1,
        foundedDate: onboardingData.foundedDate
          ? new Date(onboardingData.foundedDate as string)
          : null,
        targetMarket: (onboardingData.targetMarket as string) || null,
        businessModel: (onboardingData.businessModel as string) || null,
        revenueStreams: (onboardingData.revenueStreams as string[]) || [],
        fundingStatus: (onboardingData.fundingStatus as string) || null,
        monthlyBurn: (onboardingData.monthlyBurn as number) || null,
        runway: (onboardingData.runway as number) || null,
        keyMetrics: (onboardingData.keyMetrics as string[]) || [],
        challenges: (onboardingData.challenges as string[]) || [],
        goals: (onboardingData.goals as string[]) || [],
      },
    });

    await prisma.onboarding.update({
      where: { userId },
      data: { completed: true, step: 99 },
    });

    return NextResponse.json({ success: true, data: company });
  } catch (error) {
    console.error("Complete onboarding error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}

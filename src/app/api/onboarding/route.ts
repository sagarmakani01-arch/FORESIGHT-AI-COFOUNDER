import { authOptions } from "@/lib/auth/config";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

async function getAuthUserId() {
  const session = await getServerSession(authOptions);
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

    const fundingStageMap: Record<string, string> = {
      "Pre-Seed": "PRE_SEED",
      Seed: "SEED",
      "Series A": "SERIES_A",
      Growth: "GROWTH",
      Bootstrapped: "IDEA",
    };

    const teamSizeMap: Record<string, number> = {
      "Just me": 1,
      "2-5 people": 3,
      "6-10 people": 8,
      "11-25 people": 18,
      "25+ people": 30,
    };

    const stageKey = (onboardingData.fundingStage as string) || "";
    const stage = (fundingStageMap[stageKey] || "IDEA") as never;
    const teamSizeStr = (onboardingData.currentTeamSize as string) || "Just me";
    const goals = [onboardingData.goal1, onboardingData.goal2, onboardingData.goal3]
      .filter((g): g is string => typeof g === "string" && g.trim().length > 0);

    const companyData = {
      name: (onboardingData.buildingWhat as string)?.split("\n")[0]?.trim() || "My Startup",
      industry: (onboardingData.industrySector as string) || "Other",
      stage,
      vision: (onboardingData.visionStatement as string) || "",
      mission: (onboardingData.mission as string) || "",
      description: (onboardingData.buildingWhat as string) || "",
      website: null as string | null,
      location: (onboardingData.country as string) || null,
      teamSize: teamSizeMap[teamSizeStr] || 1,
      targetMarket: (onboardingData.targetAudience as string) || null,
      businessModel: null as string | null,
      fundingStatus: (onboardingData.fundingStage as string) || null,
      goals,
    };

    const company = await prisma.company.upsert({
      where: { userId },
      update: companyData,
      create: {
        userId,
        ...companyData,
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

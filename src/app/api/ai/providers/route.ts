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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const providers = await prisma.aiProvider.findMany({
      where: { userId },
      select: {
        id: true,
        provider: true,
        baseUrl: true,
        model: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: providers });
  } catch (error) {
    console.error("Get providers error:", error);
    return NextResponse.json({ error: "Failed to fetch providers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { provider, apiKey, baseUrl, model } = body;

    if (!provider || !apiKey) {
      return NextResponse.json({ error: "Provider and API key are required" }, { status: 400 });
    }

    const validProviders = ["openai", "anthropic", "google", "ollama"];
    if (!validProviders.includes(provider)) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    const existing = await prisma.aiProvider.findUnique({
      where: { userId_provider: { userId, provider } },
    });

    if (existing) {
      const updated = await prisma.aiProvider.update({
        where: { id: existing.id },
        data: { apiKey, baseUrl: baseUrl || null, model: model || null, isActive: true },
        select: {
          id: true,
          provider: true,
          baseUrl: true,
          model: true,
          isActive: true,
          createdAt: true,
        },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    const created = await prisma.aiProvider.create({
      data: { userId, provider, apiKey, baseUrl: baseUrl || null, model: model || null },
      select: {
        id: true,
        provider: true,
        baseUrl: true,
        model: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("Create provider error:", error);
    return NextResponse.json({ error: "Failed to save provider" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Provider ID required" }, { status: 400 });
    }

    const provider = await prisma.aiProvider.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!provider || provider.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.aiProvider.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete provider error:", error);
    return NextResponse.json({ error: "Failed to delete provider" }, { status: 500 });
  }
}

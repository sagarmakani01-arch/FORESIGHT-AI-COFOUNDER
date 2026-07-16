import { authOptions } from "@/lib/auth/config";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

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

function calculateRelevanceScore(query: string, content: string): number {
  const queryWords = query.toLowerCase().split(/\s+/);
  const contentLower = content.toLowerCase();
  let score = 0;

  for (const word of queryWords) {
    if (word.length < 2) continue;

    const exactMatches = (contentLower.match(new RegExp(`\\b${word}\\b`, "g")) || []).length;
    score += exactMatches * 0.3;

    if (contentLower.includes(word)) {
      score += 0.2;
    }

    for (let i = 0; i < contentLower.length - word.length + 1; i++) {
      if (contentLower.substring(i, i + word.length) === word) {
        score += 0.05;
      }
    }
  }

  const wordCount = content.split(/\s+/).length;
  if (wordCount > 50) score += 0.1;
  if (wordCount > 200) score += 0.1;

  return Math.min(1, score);
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
    const { query, limit } = body;

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Query is required" },
        { status: 400 }
      );
    }

    const entries = await prisma.knowledgeEntry.findMany({
      where: {
        companyId,
        OR: [
          { content: { contains: query, mode: "insensitive" } },
          { type: { contains: query, mode: "insensitive" } },
        ],
      },
    });

    const results = entries
      .map((entry) => ({
        ...entry,
        score: calculateRelevanceScore(query, entry.content),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit || 10);

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Search knowledge error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search knowledge base" },
      { status: 500 }
    );
  }
}

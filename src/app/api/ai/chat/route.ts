import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { chatStream, type AIMessage } from "@/lib/ai/provider";

async function getAuthUserId() {
  const session = await getServerSession();
  if (!session?.user) return null;
  return (session.user as { id: string }).id;
}

async function buildSystemPrompt(userId: string): Promise<string> {
  const company = await prisma.company.findUnique({
    where: { userId },
    include: {
      projects: { take: 5, orderBy: { updatedAt: "desc" } },
      milestones: { take: 5, orderBy: { deadline: "asc" } },
    },
  });

  let systemPrompt = `You are GENESIS, an AI Co-Founder for startups. You help founders make strategic decisions, plan products, manage operations, and grow their businesses. Be concise, actionable, and data-driven. Use markdown formatting for readability.`;

  if (company) {
    systemPrompt += `\n\n## Company Context`;
    systemPrompt += `\n- Name: ${company.name}`;
    systemPrompt += `\n- Industry: ${company.industry}`;
    systemPrompt += `\n- Stage: ${company.stage}`;
    systemPrompt += `\n- Vision: ${company.vision}`;
    systemPrompt += `\n- Mission: ${company.mission}`;
    systemPrompt += `\n- Team Size: ${company.teamSize}`;
    systemPrompt += `\n- Location: ${company.location}`;

    if (company.projects.length > 0) {
      systemPrompt += `\n\n## Active Projects`;
      for (const project of company.projects) {
        systemPrompt += `\n- ${project.name} (${project.status}, ${project.priority} priority)`;
      }
    }

    if (company.milestones.length > 0) {
      systemPrompt += `\n\n## Upcoming Milestones`;
      for (const milestone of company.milestones) {
        systemPrompt += `\n- ${milestone.title} (${milestone.status}, ${milestone.progress}% complete, due ${milestone.deadline})`;
      }
    }
  }

  systemPrompt += `\n\n## Capabilities`;
  systemPrompt += `\n- Strategic planning and advice`;
  systemPrompt += `\n- Financial analysis and projections`;
  systemPrompt += `\n- Product roadmap planning`;
  systemPrompt += `\n- Market research and competitive analysis`;
  systemPrompt += `\n- Investor preparation and pitch coaching`;
  systemPrompt += `\n- Team building and organizational design`;
  systemPrompt += `\n\nAlways provide specific, actionable recommendations. Use data and metrics when available. Be direct and concise.`;

  return systemPrompt;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { messages, model } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Messages array required" }, { status: 400 });
    }

    const systemPrompt = await buildSystemPrompt(userId);

    const aiMessages: AIMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const stream = await chatStream(aiMessages, {
      model: model || process.env.AI_MODEL || "llama3.2",
      temperature: 0.7,
      maxTokens: 2048,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return Response.json(
      { error: (error as Error).message || "Failed to process chat" },
      { status: 500 }
    );
  }
}

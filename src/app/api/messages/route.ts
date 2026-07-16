import { authOptions } from "@/lib/auth/config";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

async function getAuthUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return (session.user as { id: string }).id;
}

async function simulateAIResponse(
  content: string,
  companyId: string | null
): Promise<{ content: string; reasoningSteps: Array<{ step: number; status: string; label: string }> }> {
  const reasoningSteps = [
    { step: 1, status: "completed", label: "Analyzed your query and context" },
    { step: 2, status: "completed", label: "Retrieved relevant company data" },
    { step: 3, status: "completed", label: "Generated strategic response" },
  ];

  let companyContext = "";
  if (companyId) {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (company) {
      companyContext = `Company: ${company.name} (${company.industry}, ${company.stage}). `;
    }
  }

  const lowerContent = content.toLowerCase();

  if (lowerContent.includes("revenue") || lowerContent.includes("financial")) {
    return {
      content: `${companyContext}Based on your financial inquiry, I recommend reviewing your current revenue streams and expense patterns. Key areas to focus on include optimizing unit economics, reducing customer acquisition costs, and identifying opportunities for upselling existing customers. Would you like me to generate a detailed financial analysis?`,
      reasoningSteps,
    };
  }

  if (lowerContent.includes("competitor") || lowerContent.includes("competition")) {
    return {
      content: `${companyContext}Analyzing the competitive landscape requires examining direct and indirect competitors, their market positioning, pricing strategies, and unique value propositions. I suggest conducting a SWOT analysis and identifying gaps in the market that your product can uniquely fill. Shall I create a detailed competitor analysis report?`,
      reasoningSteps,
    };
  }

  if (lowerContent.includes("project") || lowerContent.includes("task")) {
    return {
      content: `${companyContext}For project and task management, I recommend prioritizing based on impact and urgency. Consider using the Eisenhower matrix to categorize tasks, and ensure clear ownership and deadlines are assigned. Would you like me to help prioritize your current backlog or create a project timeline?`,
      reasoningSteps,
    };
  }

  if (lowerContent.includes("investor") || lowerContent.includes("fundrais")) {
    return {
      content: `${companyContext}For fundraising preparation, focus on demonstrating product-market fit, unit economics, and a clear path to scalability. Ensure your pitch deck tells a compelling story with strong metrics. I can help you prepare investor materials and practice your pitch. What specific aspect would you like to work on?`,
      reasoningSteps,
    };
  }

  return {
    content: `${companyContext}Thank you for your question. I've analyzed your input and I'm here to help you make strategic decisions for your business. Whether it's about product development, market expansion, financial planning, or team building, I can provide data-driven insights and recommendations. What specific area would you like to focus on?`,
    reasoningSteps,
  };
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
    const { conversationId, content } = body;

    if (!conversationId || !content) {
      return NextResponse.json(
        { success: false, error: "conversationId and content are required" },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (conversation.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const userMessage = await prisma.message.create({
      data: {
        role: "USER",
        content,
        conversationId,
      },
    });

    const aiResponse = await simulateAIResponse(content, conversation.companyId);

    const assistantMessage = await prisma.message.create({
      data: {
        role: "ASSISTANT",
        content: aiResponse.content,
        reasoningSteps: aiResponse.reasoningSteps,
        conversationId,
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: {
        userMessage,
        assistantMessage: {
          ...assistantMessage,
          reasoningSteps: aiResponse.reasoningSteps,
        },
      },
    });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}

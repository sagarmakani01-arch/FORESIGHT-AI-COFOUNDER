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

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        versions: { orderBy: { version: "desc" } },
        company: { select: { userId: true } },
      },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    if (document.company.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { company: _company, ...docData } = document;
    return NextResponse.json({ success: true, data: docData });
  } catch (error) {
    console.error("Get document error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch document" },
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

    const existingDoc = await prisma.document.findUnique({
      where: { id },
      include: {
        company: { select: { userId: true } },
        versions: { orderBy: { version: "desc" }, take: 1 },
      },
    });

    if (!existingDoc) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    if (existingDoc.company.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, folder } = body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (folder !== undefined) updateData.folder = folder.toUpperCase();

    const nextVersion = (existingDoc.versions[0]?.version || 0) + 1;

    if (content && content !== existingDoc.content) {
      await prisma.documentVersion.create({
        data: {
          documentId: id,
          content,
          version: nextVersion,
        },
      });
    }

    const document = await prisma.document.update({
      where: { id },
      data: updateData,
      include: {
        versions: { orderBy: { version: "desc" } },
      },
    });

    return NextResponse.json({ success: true, data: document });
  } catch (error) {
    console.error("Update document error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update document" },
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

    const existingDoc = await prisma.document.findUnique({
      where: { id },
      include: { company: { select: { userId: true } } },
    });

    if (!existingDoc) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    if (existingDoc.company.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.document.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("Delete document error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete document" },
      { status: 500 }
    );
  }
}

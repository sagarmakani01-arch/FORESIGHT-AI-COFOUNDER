import { authOptions } from "@/lib/auth/config";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const company = await prisma.company.findUnique({ where: { userId } });
    if (!company) {
      return NextResponse.json({ error: "No company found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    if (!q) {
      return NextResponse.json({ results: [] });
    }

    const companyId = company.id;

    const [projects, tasks, documents, knowledge, files, competitors, investors] =
      await Promise.all([
        prisma.project.findMany({
          where: {
            companyId,
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          },
          select: { id: true, name: true, description: true },
          take: 10,
        }),
        prisma.task.findMany({
          where: {
            project: { companyId },
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          },
          select: { id: true, title: true, description: true, project: { select: { name: true } } },
          take: 10,
        }),
        prisma.document.findMany({
          where: {
            companyId,
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } },
            ],
          },
          select: { id: true, title: true, content: true },
          take: 10,
        }),
        prisma.knowledgeEntry.findMany({
          where: {
            companyId,
            content: { contains: q, mode: "insensitive" },
          },
          select: { id: true, type: true, content: true },
          take: 10,
        }),
        prisma.fileEntry.findMany({
          where: {
            companyId,
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } },
            ],
          },
          select: { id: true, name: true, content: true },
          take: 10,
        }),
        prisma.competitor.findMany({
          where: {
            companyId,
            name: { contains: q, mode: "insensitive" },
          },
          select: { id: true, name: true, industry: true },
          take: 10,
        }),
        prisma.investor.findMany({
          where: {
            companyId,
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { firm: { contains: q, mode: "insensitive" } },
            ],
          },
          select: { id: true, name: true, firm: true },
          take: 10,
        }),
      ]);

    interface SearchResult {
      id: string;
      type: string;
      title: string;
      preview: string;
      url: string;
    }

    const results: SearchResult[] = [];

    for (const p of projects) {
      results.push({
        id: p.id,
        type: "Project",
        title: p.name,
        preview: p.description?.slice(0, 120) || "Project",
        url: "/projects",
      });
    }

    for (const t of tasks) {
      results.push({
        id: t.id,
        type: "Task",
        title: t.title,
        preview: `${t.project.name} · ${t.description?.slice(0, 80) || "Task"}`,
        url: "/tasks",
      });
    }

    for (const d of documents) {
      results.push({
        id: d.id,
        type: "Document",
        title: d.title,
        preview: d.content?.slice(0, 120) || "Document",
        url: "/files",
      });
    }

    for (const k of knowledge) {
      results.push({
        id: k.id,
        type: "Knowledge",
        title: k.type,
        preview: k.content?.slice(0, 120) || "Knowledge entry",
        url: "/cofounder",
      });
    }

    for (const f of files) {
      results.push({
        id: f.id,
        type: "File",
        title: f.name,
        preview: f.content?.slice(0, 120) || "File",
        url: "/files",
      });
    }

    for (const c of competitors) {
      results.push({
        id: c.id,
        type: "Competitor",
        title: c.name,
        preview: c.industry || "Competitor",
        url: "/competitors",
      });
    }

    for (const i of investors) {
      results.push({
        id: i.id,
        type: "Investor",
        title: i.name,
        preview: i.firm || "Investor",
        url: "/investors",
      });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

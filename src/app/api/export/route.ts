import { authOptions } from "@/lib/auth/config";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

async function getAuthUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return (session.user as { id: string }).id;
}

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsvRow(values: string[]): string {
  return values.map(escapeCsv).join(",");
}

export async function GET(request: NextRequest) {
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
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: "No company found" },
        { status: 404 }
      );
    }

    const companyId = company.id;
    const { searchParams } = new URL(request.url);
    const entity = searchParams.get("entity");
    const format = searchParams.get("format");

    if (format !== "csv") {
      return NextResponse.json(
        { success: false, error: "Only CSV format is supported" },
        { status: 400 }
      );
    }

    const validEntities = ["projects", "tasks", "documents", "finance", "competitors", "investors", "milestones"];
    if (!entity || !validEntities.includes(entity)) {
      return NextResponse.json(
        { success: false, error: `Invalid entity. Must be one of: ${validEntities.join(", ")}` },
        { status: 400 }
      );
    }

    let headers: string[];
    let rows: string[][];

    switch (entity) {
      case "projects": {
        const projects = await prisma.project.findMany({
          where: { companyId },
          orderBy: { updatedAt: "desc" },
        });
        headers = ["Name", "Description", "Status", "Priority", "Deadline"];
        rows = projects.map((p) => [
          p.name,
          p.description,
          p.status,
          p.priority,
          p.deadline ? new Date(p.deadline).toISOString().split("T")[0] : "",
        ]);
        break;
      }

      case "tasks": {
        const tasks = await prisma.task.findMany({
          where: { project: { companyId } },
          include: { project: { select: { name: true } } },
          orderBy: { updatedAt: "desc" },
        });
        headers = ["Title", "Status", "Priority", "Deadline", "Project"];
        rows = tasks.map((t) => [
          t.title,
          t.status,
          t.priority,
          t.deadline ? new Date(t.deadline).toISOString().split("T")[0] : "",
          t.project.name,
        ]);
        break;
      }

      case "documents": {
        const documents = await prisma.document.findMany({
          where: { companyId },
          orderBy: { updatedAt: "desc" },
        });
        headers = ["Title", "Folder", "Content"];
        rows = documents.map((d) => [
          d.title,
          d.folder,
          d.content.slice(0, 200),
        ]);
        break;
      }

      case "finance": {
        const entries = await prisma.financeEntry.findMany({
          where: { companyId },
          orderBy: { date: "desc" },
        });
        headers = ["Type", "Amount", "Category", "Date", "Description"];
        rows = entries.map((e) => [
          e.type,
          String(e.amount),
          e.category,
          new Date(e.date).toISOString().split("T")[0],
          e.description,
        ]);
        break;
      }

      case "competitors": {
        const competitors = await prisma.competitor.findMany({
          where: { companyId },
          orderBy: { lastUpdated: "desc" },
        });
        headers = ["Name", "Industry", "Pricing", "Funding"];
        rows = competitors.map((c) => [
          c.name,
          c.industry,
          c.pricing ?? "",
          c.funding ?? "",
        ]);
        break;
      }

      case "investors": {
        const investors = await prisma.investor.findMany({
          where: { companyId },
          orderBy: { createdAt: "desc" },
        });
        headers = ["Name", "Firm", "Stage", "Status", "Email"];
        rows = investors.map((i) => [
          i.name,
          i.firm,
          i.stage,
          i.status,
          i.email ?? "",
        ]);
        break;
      }

      case "milestones": {
        const milestones = await prisma.milestone.findMany({
          where: { companyId },
          orderBy: { deadline: "asc" },
        });
        headers = ["Title", "Status", "Progress", "Deadline"];
        rows = milestones.map((m) => [
          m.title,
          m.status,
          String(m.progress),
          new Date(m.deadline).toISOString().split("T")[0],
        ]);
        break;
      }

      default: {
        return NextResponse.json(
          { success: false, error: "Invalid entity" },
          { status: 400 }
        );
      }
    }

    const csvLines = [
      toCsvRow(headers),
      ...rows.map((row) => toCsvRow(row)),
    ];
    const csv = csvLines.join("\r\n");

    const today = new Date().toISOString().split("T")[0];
    const filename = `genesis-${entity}-${today}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export CSV error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export data" },
      { status: 500 }
    );
  }
}

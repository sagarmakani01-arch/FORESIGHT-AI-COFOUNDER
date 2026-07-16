import { authOptions } from "@/lib/auth/config";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as { id: string }).id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, avatar: true, role: true },
    });
    const company = await prisma.company.findUnique({ where: { userId } });

    if (!company) {
      return Response.json({
        company: null,
        user,
        projects: [],
        tasks: [],
        documents: [],
        competitors: [],
        milestones: [],
        financeEntries: [],
        investors: [],
        roadmaps: [],
        knowledgeEntries: [],
        researchReports: [],
      });
    }

    const cid = company.id;

    const [projects, tasks, documents, competitors, milestones, financeEntries, investors, roadmaps, knowledgeEntries, researchReports] = await Promise.all([
      prisma.project.findMany({ where: { companyId: cid }, include: { tasks: true }, orderBy: { updatedAt: "desc" } }),
      prisma.task.findMany({ where: { project: { companyId: cid } }, include: { project: true, dependencies: true, dependents: true }, orderBy: { deadline: "asc" } }),
      prisma.document.findMany({ where: { companyId: cid }, orderBy: { updatedAt: "desc" } }),
      prisma.competitor.findMany({ where: { companyId: cid }, orderBy: { lastUpdated: "desc" } }),
      prisma.milestone.findMany({ where: { companyId: cid }, orderBy: { deadline: "asc" } }),
      prisma.financeEntry.findMany({ where: { companyId: cid }, orderBy: { date: "desc" } }),
      prisma.investor.findMany({ where: { companyId: cid }, orderBy: { lastContact: "desc" } }),
      prisma.roadmap.findMany({ where: { companyId: cid }, include: { phases: { orderBy: { startDate: "asc" } } }, orderBy: { createdAt: "desc" } }),
      prisma.knowledgeEntry.findMany({ where: { companyId: cid }, orderBy: { updatedAt: "desc" } }),
      prisma.researchReport.findMany({ where: { companyId: cid }, orderBy: { createdAt: "desc" } }),
    ]);

    return Response.json({
      company,
      user,
      projects,
      tasks,
      documents,
      competitors,
      milestones,
      financeEntries,
      investors,
      roadmaps,
      knowledgeEntries,
      researchReports,
    });
  } catch (error) {
    console.error("API /data error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

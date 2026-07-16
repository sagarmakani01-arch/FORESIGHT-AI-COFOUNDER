import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const company = await prisma.company.findUnique({
      where: { userId },
      select: {
        name: true,
        industry: true,
        stage: true,
        teamSize: true,
        location: true,
        vision: true,
        mission: true,
        description: true,
      },
    });

    return Response.json({ user, company });
  } catch (error) {
    console.error("GET /api/user/me error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

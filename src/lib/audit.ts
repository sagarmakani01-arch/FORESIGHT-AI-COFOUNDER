import { prisma } from "@/lib/prisma";

export async function logAudit(params: {
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const metadata = params.metadata
      ? JSON.parse(JSON.stringify(params.metadata))
      : undefined;

    await prisma.auditLog.create({
      data: {
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        userId: params.userId,
        metadata,
      },
    });
  } catch (error) {
    console.error("Audit log error:", error);
  }
}

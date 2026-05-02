import { prisma } from './prisma'

interface AuditParams {
  actorId?: string | null
  action: string
  entity: string
  entityId?: string | null
  before?: unknown
  after?: unknown
  ip?: string | null
  userAgent?: string | null
}

export async function audit(params: AuditParams): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorId: params.actorId ?? null,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId ?? null,
      before: params.before != null ? JSON.parse(JSON.stringify(params.before)) : undefined,
      after: params.after != null ? JSON.parse(JSON.stringify(params.after)) : undefined,
      ip: params.ip ?? null,
      userAgent: params.userAgent ?? null,
    },
  })
}

import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

export type AuditAction =
  | "user_ban"
  | "user_unban"
  | "settings_update"
  | "promo_code_create"
  | "promo_code_update"
  | "promo_code_delete"
  | "bug_report_update"
  | "payment_refund"
  | "subscription_cancel";

export type AuditEntity =
  | "user"
  | "settings"
  | "promo_code"
  | "bug_report"
  | "payment"
  | "subscription";

export interface AuditLogEntry {
  id: string;
  adminId: string;
  adminEmail?: string;
  adminName?: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface CreateAuditLogInput {
  adminId: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogFilters {
  adminId?: string;
  action?: AuditAction;
  entity?: AuditEntity;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new audit log entry
   */
  async log(input: CreateAuditLogInput): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          adminId: input.adminId,
          action: input.action,
          entity: input.entity,
          entityId: input.entityId || null,
          details: input.details
            ? (JSON.parse(JSON.stringify(input.details)) as object)
            : undefined,
          ipAddress: input.ipAddress || null,
          userAgent: input.userAgent || null,
        },
      });

      this.logger.log(
        `Audit: ${input.action} on ${input.entity}${input.entityId ? `:${input.entityId}` : ""} by admin ${input.adminId}`,
      );
    } catch (error) {
      // Don't throw - audit logging should not break main operations
      this.logger.error("Failed to create audit log", error);
    }
  }

  /**
   * Get audit logs with optional filters
   */
  async getLogs(
    filters: AuditLogFilters = {},
    page: number = 1,
    limit: number = 50,
  ): Promise<{ logs: AuditLogEntry[]; total: number }> {
    const where: Record<string, unknown> = {};

    if (filters.adminId) {
      where.adminId = filters.adminId;
    }
    if (filters.action) {
      where.action = filters.action;
    }
    if (filters.entity) {
      where.entity = filters.entity;
    }
    if (filters.entityId) {
      where.entityId = filters.entityId;
    }
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        (where.createdAt as Record<string, Date>).gte = filters.startDate;
      }
      if (filters.endDate) {
        (where.createdAt as Record<string, Date>).lte = filters.endDate;
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          admin: {
            select: {
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      logs: logs.map((log) => ({
        id: log.id,
        adminId: log.adminId,
        adminEmail: log.admin.email,
        adminName: log.admin.name,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        details: log.details as Record<string, unknown> | null,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
      })),
      total,
    };
  }

  /**
   * Get recent logs for dashboard
   */
  async getRecentLogs(limit: number = 10): Promise<AuditLogEntry[]> {
    const { logs } = await this.getLogs({}, 1, limit);
    return logs;
  }
}

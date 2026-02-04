import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

export type ExportFormat = "csv" | "json";
export type ExportEntity = "users" | "payments" | "subscriptions" | "auditLogs";

interface ExportOptions {
  format: ExportFormat;
  entity: ExportEntity;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(private readonly prisma: PrismaService) {}

  async exportData(options: ExportOptions): Promise<string> {
    const { format, entity, startDate, endDate, limit = 10000 } = options;

    let data: Record<string, unknown>[];

    switch (entity) {
      case "users":
        data = await this.getUsersData(startDate, endDate, limit);
        break;
      case "payments":
        data = await this.getPaymentsData(startDate, endDate, limit);
        break;
      case "subscriptions":
        data = await this.getSubscriptionsData(startDate, endDate, limit);
        break;
      case "auditLogs":
        data = await this.getAuditLogsData(startDate, endDate, limit);
        break;
      default:
        throw new Error(`Unknown entity: ${entity}`);
    }

    this.logger.log(`Exporting ${data.length} ${entity} records as ${format}`);

    if (format === "json") {
      return JSON.stringify(data, null, 2);
    }

    return this.convertToCsv(data);
  }

  private async getUsersData(
    startDate?: Date,
    endDate?: Date,
    limit?: number,
  ): Promise<Record<string, unknown>[]> {
    const where: Record<string, unknown> = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, Date>).gte = startDate;
      if (endDate) (where.createdAt as Record<string, Date>).lte = endDate;
    }

    const users = await this.prisma.user.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            submissions: true,
            courses: true,
          },
        },
      },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name || "",
      role: user.role,
      isPremium: user.isPremium,
      isBanned: user.isBanned,
      bannedAt: user.bannedAt?.toISOString() || "",
      bannedReason: user.bannedReason || "",
      xp: user.xp,
      level: user.level,
      currentStreak: user.currentStreak,
      maxStreak: user.maxStreak,
      submissionsCount: user._count.submissions,
      coursesCount: user._count.courses,
      createdAt: user.createdAt.toISOString(),
      lastActivityAt: user.lastActivityAt?.toISOString() || "",
    }));
  }

  private async getPaymentsData(
    startDate?: Date,
    endDate?: Date,
    limit?: number,
  ): Promise<Record<string, unknown>[]> {
    const where: Record<string, unknown> = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, Date>).gte = startDate;
      if (endDate) (where.createdAt as Record<string, Date>).lte = endDate;
    }

    const payments = await this.prisma.payment.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        subscription: {
          include: {
            user: { select: { email: true, name: true } },
            plan: { select: { name: true, slug: true } },
          },
        },
      },
    });

    return payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      provider: payment.provider || "",
      providerTxId: payment.providerTxId || "",
      userEmail: payment.subscription?.user?.email || "",
      userName: payment.subscription?.user?.name || "",
      planName: payment.subscription?.plan?.name || "",
      planSlug: payment.subscription?.plan?.slug || "",
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
    }));
  }

  private async getSubscriptionsData(
    startDate?: Date,
    endDate?: Date,
    limit?: number,
  ): Promise<Record<string, unknown>[]> {
    const where: Record<string, unknown> = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, Date>).gte = startDate;
      if (endDate) (where.createdAt as Record<string, Date>).lte = endDate;
    }

    const subscriptions = await this.prisma.subscription.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true, name: true } },
        plan: { select: { id: true, name: true, slug: true, type: true } },
        _count: { select: { payments: true } },
      },
    });

    return subscriptions.map((sub) => ({
      id: sub.id,
      userId: sub.user.id,
      userEmail: sub.user.email,
      userName: sub.user.name || "",
      planId: sub.plan.id,
      planName: sub.plan.name,
      planSlug: sub.plan.slug,
      planType: sub.plan.type,
      status: sub.status,
      startDate: sub.startDate.toISOString(),
      endDate: sub.endDate.toISOString(),
      autoRenew: sub.autoRenew,
      paymentsCount: sub._count.payments,
      createdAt: sub.createdAt.toISOString(),
    }));
  }

  private async getAuditLogsData(
    startDate?: Date,
    endDate?: Date,
    limit?: number,
  ): Promise<Record<string, unknown>[]> {
    const where: Record<string, unknown> = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, Date>).gte = startDate;
      if (endDate) (where.createdAt as Record<string, Date>).lte = endDate;
    }

    const logs = await this.prisma.auditLog.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        admin: { select: { email: true, name: true } },
      },
    });

    return logs.map((logEntry) => ({
      id: logEntry.id,
      adminEmail: logEntry.admin.email,
      adminName: logEntry.admin.name || "",
      action: logEntry.action,
      entity: logEntry.entity,
      entityId: logEntry.entityId || "",
      details: logEntry.details ? JSON.stringify(logEntry.details) : "",
      ipAddress: logEntry.ipAddress || "",
      createdAt: logEntry.createdAt.toISOString(),
    }));
  }

  private convertToCsv(data: Record<string, unknown>[]): string {
    if (data.length === 0) {
      return "";
    }

    const headers = Object.keys(data[0]);
    const csvRows: string[] = [];

    // Header row
    csvRows.push(headers.join(","));

    // Data rows
    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header];
        if (value === null || value === undefined) {
          return "";
        }
        const stringValue = String(value);
        // Escape quotes and wrap in quotes if contains comma or newline
        if (
          stringValue.includes(",") ||
          stringValue.includes("\n") ||
          stringValue.includes('"')
        ) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      csvRows.push(values.join(","));
    }

    return csvRows.join("\n");
  }
}

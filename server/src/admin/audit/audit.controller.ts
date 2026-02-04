import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuditService, AuditAction, AuditEntity } from "./audit.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../../auth/guards/admin.guard";

@ApiTags("Admin Audit")
@Controller("admin/audit")
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
@Throttle({ default: { limit: 30, ttl: 60000 } })
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * GET /admin/audit/logs
   * Get audit logs with optional filters and pagination
   */
  @Get("logs")
  @ApiOperation({ summary: "Get audit logs" })
  async getLogs(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("adminId") adminId?: string,
    @Query("action") action?: AuditAction,
    @Query("entity") entity?: AuditEntity,
    @Query("entityId") entityId?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? Math.min(parseInt(limit, 10), 100) : 50;

    return this.auditService.getLogs(
      {
        adminId,
        action,
        entity,
        entityId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      pageNum,
      limitNum
    );
  }

  /**
   * GET /admin/audit/recent
   * Get recent audit logs for dashboard widget
   */
  @Get("recent")
  @ApiOperation({ summary: "Get recent audit logs" })
  async getRecentLogs(@Query("limit") limit?: string) {
    const limitNum = limit ? Math.min(parseInt(limit, 10), 50) : 10;
    return this.auditService.getRecentLogs(limitNum);
  }
}

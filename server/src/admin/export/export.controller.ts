import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { Response } from "express";
import { Throttle } from "@nestjs/throttler";
import { ExportService, ExportFormat, ExportEntity } from "./export.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../../auth/guards/admin.guard";

@Controller("admin/export")
@UseGuards(JwtAuthGuard, AdminGuard)
@Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 exports per minute
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  /**
   * GET /admin/export/users
   * Export users data as CSV or JSON
   */
  @Get("users")
  async exportUsers(
    @Query("format") format: string = "csv",
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("limit") limit?: string,
    @Res() res: Response,
  ) {
    return this.handleExport(
      res,
      "users",
      format,
      startDate,
      endDate,
      limit,
    );
  }

  /**
   * GET /admin/export/payments
   * Export payments data as CSV or JSON
   */
  @Get("payments")
  async exportPayments(
    @Query("format") format: string = "csv",
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("limit") limit?: string,
    @Res() res: Response,
  ) {
    return this.handleExport(
      res,
      "payments",
      format,
      startDate,
      endDate,
      limit,
    );
  }

  /**
   * GET /admin/export/subscriptions
   * Export subscriptions data as CSV or JSON
   */
  @Get("subscriptions")
  async exportSubscriptions(
    @Query("format") format: string = "csv",
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("limit") limit?: string,
    @Res() res: Response,
  ) {
    return this.handleExport(
      res,
      "subscriptions",
      format,
      startDate,
      endDate,
      limit,
    );
  }

  /**
   * GET /admin/export/audit-logs
   * Export audit logs data as CSV or JSON
   */
  @Get("audit-logs")
  async exportAuditLogs(
    @Query("format") format: string = "csv",
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("limit") limit?: string,
    @Res() res: Response,
  ) {
    return this.handleExport(
      res,
      "auditLogs",
      format,
      startDate,
      endDate,
      limit,
    );
  }

  private async handleExport(
    res: Response,
    entity: ExportEntity,
    format: string,
    startDate?: string,
    endDate?: string,
    limit?: string,
  ) {
    const exportFormat = this.validateFormat(format);
    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;
    const parsedLimit = limit ? parseInt(limit, 10) : 10000;

    if (parsedLimit < 1 || parsedLimit > 100000) {
      throw new BadRequestException("Limit must be between 1 and 100000");
    }

    if (parsedStartDate && isNaN(parsedStartDate.getTime())) {
      throw new BadRequestException("Invalid startDate format");
    }

    if (parsedEndDate && isNaN(parsedEndDate.getTime())) {
      throw new BadRequestException("Invalid endDate format");
    }

    const data = await this.exportService.exportData({
      format: exportFormat,
      entity,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      limit: parsedLimit,
    });

    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `${entity}-export-${timestamp}.${exportFormat}`;

    if (exportFormat === "csv") {
      res.setHeader("Content-Type", "text/csv");
    } else {
      res.setHeader("Content-Type", "application/json");
    }

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(data);
  }

  private validateFormat(format: string): ExportFormat {
    const normalizedFormat = format.toLowerCase();
    if (normalizedFormat !== "csv" && normalizedFormat !== "json") {
      throw new BadRequestException("Format must be csv or json");
    }
    return normalizedFormat as ExportFormat;
  }
}

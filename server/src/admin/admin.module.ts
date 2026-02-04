import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { SettingsController } from "./settings/settings.controller";
import { SettingsService } from "./settings/settings.service";
import { AuditController } from "./audit/audit.controller";
import { AuditService } from "./audit/audit.service";
import { ExportController } from "./export/export.controller";
import { ExportService } from "./export/export.service";
import { PrismaModule } from "../prisma/prisma.module";
import { CacheModule } from "../cache/cache.module";

@Module({
  imports: [PrismaModule, CacheModule],
  controllers: [
    AdminController,
    SettingsController,
    AuditController,
    ExportController,
  ],
  providers: [AdminService, SettingsService, AuditService, ExportService],
  exports: [AdminService, SettingsService, AuditService, ExportService],
})
export class AdminModule {}

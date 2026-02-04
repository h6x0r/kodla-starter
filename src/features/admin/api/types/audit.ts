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

export interface AuditLogEntry {
  id: string;
  adminId: string;
  action: AuditAction;
  entity: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  admin: {
    id: string;
    email: string;
    name: string | null;
  };
}

export interface AuditLogsResponse {
  logs: AuditLogEntry[];
  total: number;
}

export interface AuditLogsFilters {
  action?: AuditAction;
  entity?: string;
  adminId?: string;
  startDate?: string;
  endDate?: string;
}

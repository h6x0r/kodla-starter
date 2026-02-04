/**
 * Admin Service - Facade for backward compatibility
 *
 * This file re-exports all admin services combined into a single object.
 * For new code, prefer importing specific services directly:
 *
 * import { adminAnalyticsService } from "./services/analyticsService";
 * import { adminUsersService } from "./services/usersService";
 */

// Re-export all types
export * from "./types";

// Import all services
import { adminAnalyticsService } from "./services/analyticsService";
import { adminUsersService } from "./services/usersService";
import { adminPaymentsService } from "./services/paymentsService";
import { adminPromoCodesService } from "./services/promoCodesService";
import { adminAuditService } from "./services/auditService";
import { adminSettingsService } from "./services/settingsService";
import { adminBugReportsService } from "./services/bugReportsService";
import { adminExportService } from "./services/exportService";

// Re-export individual services for granular imports
export {
  adminAnalyticsService,
  adminUsersService,
  adminPaymentsService,
  adminPromoCodesService,
  adminAuditService,
  adminSettingsService,
  adminBugReportsService,
  adminExportService,
};

/**
 * Combined admin service for backward compatibility
 * Merges all domain services into a single object
 */
export const adminService = {
  // Analytics
  getDashboardStats: adminAnalyticsService.getDashboardStats,
  getCourseAnalytics: adminAnalyticsService.getCourseAnalytics,
  getTaskAnalytics: adminAnalyticsService.getTaskAnalytics,
  getSubmissionStats: adminAnalyticsService.getSubmissionStats,
  getSubscriptionStats: adminAnalyticsService.getSubscriptionStats,
  getAiUsageStats: adminAnalyticsService.getAiUsageStats,
  getAnalyticsTimeline: adminAnalyticsService.getAnalyticsTimeline,

  // Users
  searchUsers: adminUsersService.searchUsers,
  getUserById: adminUsersService.getUserById,
  getBannedUsers: adminUsersService.getBannedUsers,
  banUser: adminUsersService.banUser,
  unbanUser: adminUsersService.unbanUser,

  // Payments
  getPayments: adminPaymentsService.getPayments,
  getRevenueAnalytics: adminPaymentsService.getRevenueAnalytics,
  getPaymentById: adminPaymentsService.getPaymentById,
  refundPayment: adminPaymentsService.refundPayment,
  getPurchases: adminPaymentsService.getPurchases,
  getSubscriptionsList: adminPaymentsService.getSubscriptionsList,
  getSubscriptionPlans: adminPaymentsService.getSubscriptionPlans,
  extendSubscription: adminPaymentsService.extendSubscription,
  cancelSubscription: adminPaymentsService.cancelSubscription,

  // Promo Codes
  getPromoCodes: adminPromoCodesService.getPromoCodes,
  getPromoCodeStats: adminPromoCodesService.getPromoCodeStats,
  getPromoCodeById: adminPromoCodesService.getPromoCodeById,
  createPromoCode: adminPromoCodesService.createPromoCode,
  updatePromoCode: adminPromoCodesService.updatePromoCode,
  activatePromoCode: adminPromoCodesService.activatePromoCode,
  deactivatePromoCode: adminPromoCodesService.deactivatePromoCode,
  deletePromoCode: adminPromoCodesService.deletePromoCode,

  // Audit
  getAuditLogs: adminAuditService.getAuditLogs,
  getRecentAuditLogs: adminAuditService.getRecentAuditLogs,

  // Settings
  getAiSettings: adminSettingsService.getAiSettings,
  updateAiSettings: adminSettingsService.updateAiSettings,

  // Bug Reports
  getBugReports: adminBugReportsService.getBugReports,
  updateBugReportStatus: adminBugReportsService.updateBugReportStatus,

  // Export
  exportData: adminExportService.exportData,
  downloadExport: adminExportService.downloadExport,
};

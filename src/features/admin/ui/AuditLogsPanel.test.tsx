import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AuditLogsPanel from "./AuditLogsPanel";
import { adminService, AuditLogEntry } from "../api/adminService";

vi.mock("../api/adminService", () => ({
  adminService: {
    getAuditLogs: vi.fn(),
    getRecentAuditLogs: vi.fn(),
  },
}));

vi.mock("@/contexts/LanguageContext", () => ({
  useUITranslation: () => ({
    tUI: (key: string) => key,
  }),
}));

vi.mock("@/lib/logger", () => ({
  createLogger: () => ({
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }),
}));

const mockLogs: AuditLogEntry[] = [
  {
    id: "1",
    adminId: "admin-1",
    action: "user_ban",
    entity: "user",
    entityId: "user-123",
    details: { reason: "Spam", userEmail: "spammer@test.com" },
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0",
    createdAt: "2024-01-15T10:00:00Z",
    admin: { id: "admin-1", email: "admin@example.com", name: "Admin User" },
  },
  {
    id: "2",
    adminId: "admin-2",
    action: "settings_update",
    entity: "settings",
    entityId: "ai",
    details: { changes: { enabled: true } },
    ipAddress: null,
    userAgent: null,
    createdAt: "2024-01-14T09:00:00Z",
    admin: { id: "admin-2", email: "superadmin@example.com", name: null },
  },
];

describe("AuditLogsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    vi.mocked(adminService.getAuditLogs).mockImplementation(
      () => new Promise(() => {}),
    );

    render(<AuditLogsPanel />);
    expect(screen.getByTestId("audit-logs-loading")).toBeInTheDocument();
  });

  it("should load and display audit logs", async () => {
    vi.mocked(adminService.getAuditLogs).mockResolvedValue({
      logs: mockLogs,
      total: 2,
    });

    render(<AuditLogsPanel />);

    await waitFor(() => {
      expect(screen.getByTestId("audit-logs-panel")).toBeInTheDocument();
    });

    // Check that log entries are rendered
    expect(screen.getByTestId("audit-log-1")).toBeInTheDocument();
    expect(screen.getByTestId("audit-log-2")).toBeInTheDocument();
  });

  it("should show log count in subtitle", async () => {
    vi.mocked(adminService.getAuditLogs).mockResolvedValue({
      logs: mockLogs,
      total: 2,
    });

    render(<AuditLogsPanel />);

    await waitFor(() => {
      expect(screen.getByText(/\(2\)/)).toBeInTheDocument();
    });
  });

  it("should display admin name or email", async () => {
    vi.mocked(adminService.getAuditLogs).mockResolvedValue({
      logs: mockLogs,
      total: 2,
    });

    render(<AuditLogsPanel />);

    await waitFor(() => {
      expect(screen.getByText("Admin User")).toBeInTheDocument();
    });

    // Second log has no name, should show email
    expect(screen.getByText("superadmin@example.com")).toBeInTheDocument();
  });

  it("should show empty state when no logs", async () => {
    vi.mocked(adminService.getAuditLogs).mockResolvedValue({
      logs: [],
      total: 0,
    });

    render(<AuditLogsPanel />);

    await waitFor(() => {
      expect(screen.getByTestId("audit-logs-empty")).toBeInTheDocument();
    });
  });

  it("should show error message on load failure", async () => {
    vi.mocked(adminService.getAuditLogs).mockRejectedValue(
      new Error("Network error"),
    );

    render(<AuditLogsPanel />);

    await waitFor(() => {
      expect(screen.getByTestId("audit-logs-error")).toBeInTheDocument();
    });
  });

  it("should expand log details on click", async () => {
    vi.mocked(adminService.getAuditLogs).mockResolvedValue({
      logs: mockLogs,
      total: 2,
    });

    render(<AuditLogsPanel />);

    await waitFor(() => {
      expect(screen.getByTestId("audit-log-1")).toBeInTheDocument();
    });

    // Click on the clickable area inside the log entry
    const logEntry = screen.getByTestId("audit-log-1");
    const clickableArea = logEntry.querySelector(".cursor-pointer");
    fireEvent.click(clickableArea!);

    await waitFor(() => {
      // Details should include the details label
      expect(screen.getByText("admin.auditLogs.details")).toBeInTheDocument();
    });
  });

  it("should have action filter dropdown", async () => {
    vi.mocked(adminService.getAuditLogs).mockResolvedValue({
      logs: mockLogs,
      total: 2,
    });

    render(<AuditLogsPanel />);

    await waitFor(() => {
      expect(screen.getByTestId("audit-logs-filter")).toBeInTheDocument();
    });
  });

  it("should filter logs by action", async () => {
    vi.mocked(adminService.getAuditLogs).mockResolvedValue({
      logs: mockLogs,
      total: 2,
    });

    render(<AuditLogsPanel />);

    await waitFor(() => {
      expect(screen.getByTestId("audit-logs-panel")).toBeInTheDocument();
    });

    const filterSelect = screen.getByTestId("audit-logs-filter");
    fireEvent.change(filterSelect, { target: { value: "user_ban" } });

    await waitFor(() => {
      expect(adminService.getAuditLogs).toHaveBeenCalledWith(
        { action: "user_ban" },
        1,
        20,
      );
    });
  });

  it("should show entity info", async () => {
    vi.mocked(adminService.getAuditLogs).mockResolvedValue({
      logs: mockLogs,
      total: 2,
    });

    render(<AuditLogsPanel />);

    await waitFor(() => {
      // Check for entity info with entityId in exact format
      expect(screen.getByText(/user #user-123/)).toBeInTheDocument();
      expect(screen.getByText(/settings #ai/)).toBeInTheDocument();
    });
  });

  it("should show pagination when more than one page", async () => {
    vi.mocked(adminService.getAuditLogs).mockResolvedValue({
      logs: mockLogs,
      total: 50,
    });

    render(<AuditLogsPanel />);

    await waitFor(() => {
      expect(screen.getByText("admin.auditLogs.prevPage")).toBeInTheDocument();
      expect(screen.getByText("admin.auditLogs.nextPage")).toBeInTheDocument();
    });
  });

  it("should not show pagination when only one page", async () => {
    vi.mocked(adminService.getAuditLogs).mockResolvedValue({
      logs: mockLogs,
      total: 2,
    });

    render(<AuditLogsPanel />);

    await waitFor(() => {
      expect(screen.getByTestId("audit-logs-panel")).toBeInTheDocument();
    });

    expect(
      screen.queryByText("admin.auditLogs.prevPage"),
    ).not.toBeInTheDocument();
  });
});

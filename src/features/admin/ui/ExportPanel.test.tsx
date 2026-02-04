import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ExportPanel from "./ExportPanel";
import { adminService } from "../api/adminService";

vi.mock("../api/adminService", () => ({
  adminService: {
    downloadExport: vi.fn(),
    exportData: vi.fn(),
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

describe("ExportPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render export panel", () => {
    render(<ExportPanel />);
    expect(screen.getByTestId("export-panel")).toBeInTheDocument();
    expect(screen.getByText("admin.export.title")).toBeInTheDocument();
  });

  it("should have entity selection buttons", () => {
    render(<ExportPanel />);
    expect(screen.getByTestId("export-entity-users")).toBeInTheDocument();
    expect(screen.getByTestId("export-entity-payments")).toBeInTheDocument();
    expect(screen.getByTestId("export-entity-subscriptions")).toBeInTheDocument();
    expect(screen.getByTestId("export-entity-audit-logs")).toBeInTheDocument();
  });

  it("should have format selection buttons", () => {
    render(<ExportPanel />);
    expect(screen.getByTestId("export-format-csv")).toBeInTheDocument();
    expect(screen.getByTestId("export-format-json")).toBeInTheDocument();
  });

  it("should have date inputs", () => {
    render(<ExportPanel />);
    expect(screen.getByTestId("export-start-date")).toBeInTheDocument();
    expect(screen.getByTestId("export-end-date")).toBeInTheDocument();
  });

  it("should select different entity on click", () => {
    render(<ExportPanel />);

    const paymentsBtn = screen.getByTestId("export-entity-payments");
    fireEvent.click(paymentsBtn);

    expect(paymentsBtn).toHaveClass("bg-brand-500");
  });

  it("should select different format on click", () => {
    render(<ExportPanel />);

    const jsonBtn = screen.getByTestId("export-format-json");
    fireEvent.click(jsonBtn);

    expect(jsonBtn).toHaveClass("bg-green-500");
  });

  it("should call downloadExport on button click", async () => {
    vi.mocked(adminService.downloadExport).mockResolvedValue(undefined);

    render(<ExportPanel />);

    const exportBtn = screen.getByTestId("export-button");
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(adminService.downloadExport).toHaveBeenCalledWith(
        "users",
        "csv",
        { startDate: undefined, endDate: undefined },
      );
    });
  });

  it("should show success message after export", async () => {
    vi.mocked(adminService.downloadExport).mockResolvedValue(undefined);

    render(<ExportPanel />);

    fireEvent.click(screen.getByTestId("export-button"));

    await waitFor(() => {
      expect(screen.getByTestId("export-success")).toBeInTheDocument();
    });
  });

  it("should show error message on export failure", async () => {
    vi.mocked(adminService.downloadExport).mockRejectedValue(
      new Error("Export failed"),
    );

    render(<ExportPanel />);

    fireEvent.click(screen.getByTestId("export-button"));

    await waitFor(() => {
      expect(screen.getByTestId("export-error")).toBeInTheDocument();
    });
  });

  it("should pass date filters to export", async () => {
    vi.mocked(adminService.downloadExport).mockResolvedValue(undefined);

    render(<ExportPanel />);

    const startDateInput = screen.getByTestId("export-start-date");
    const endDateInput = screen.getByTestId("export-end-date");

    fireEvent.change(startDateInput, { target: { value: "2024-01-01" } });
    fireEvent.change(endDateInput, { target: { value: "2024-01-31" } });

    fireEvent.click(screen.getByTestId("export-button"));

    await waitFor(() => {
      expect(adminService.downloadExport).toHaveBeenCalledWith(
        "users",
        "csv",
        { startDate: "2024-01-01", endDate: "2024-01-31" },
      );
    });
  });

  it("should export selected entity and format", async () => {
    vi.mocked(adminService.downloadExport).mockResolvedValue(undefined);

    render(<ExportPanel />);

    fireEvent.click(screen.getByTestId("export-entity-subscriptions"));
    fireEvent.click(screen.getByTestId("export-format-json"));
    fireEvent.click(screen.getByTestId("export-button"));

    await waitFor(() => {
      expect(adminService.downloadExport).toHaveBeenCalledWith(
        "subscriptions",
        "json",
        { startDate: undefined, endDate: undefined },
      );
    });
  });
});

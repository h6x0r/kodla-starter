type ExportEntity = "users" | "payments" | "subscriptions" | "audit-logs";
type ExportFormat = "csv" | "json";

interface ExportOptions {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const adminExportService = {
  exportData: async (
    entity: ExportEntity,
    format: ExportFormat = "csv",
    options?: ExportOptions
  ): Promise<Blob> => {
    const params = new URLSearchParams();
    params.append("format", format);
    if (options?.startDate) params.append("startDate", options.startDate);
    if (options?.endDate) params.append("endDate", options.endDate);
    if (options?.limit) params.append("limit", options.limit.toString());

    const response = await fetch(
      `${import.meta.env.VITE_API_URL || ""}/api/admin/export/${entity}?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  },

  downloadExport: async (
    entity: ExportEntity,
    format: ExportFormat = "csv",
    options?: ExportOptions
  ): Promise<void> => {
    const blob = await adminExportService.exportData(entity, format, options);
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `${entity}-export-${timestamp}.${format}`;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PaymentsPanel from "./PaymentsPanel";
import { adminService } from "../api/adminService";

// Mock adminService
vi.mock("../api/adminService", () => ({
  adminService: {
    getRevenueAnalytics: vi.fn(),
    getPayments: vi.fn(),
    getSubscriptionsList: vi.fn(),
    getSubscriptionPlans: vi.fn(),
    refundPayment: vi.fn(),
    extendSubscription: vi.fn(),
    cancelSubscription: vi.fn(),
  },
}));

// Mock LanguageContext
vi.mock("@/contexts/LanguageContext", () => ({
  useUITranslation: () => ({
    tUI: (key: string) => key,
  }),
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  }),
}));

const mockRevenueData = {
  thisMonth: { revenue: 1500000, count: 10 },
  lastMonth: { revenue: 1200000, count: 8 },
  total: { revenue: 5000000, count: 50 },
  byProvider: [
    { provider: "payme", revenue: 3000000, count: 30 },
    { provider: "click", revenue: 2000000, count: 20 },
  ],
  refunded: { amount: 100000, count: 2 },
  purchases: { revenue: 500000, count: 5 },
  dailyRevenue: [
    { date: "2026-01-01", amount: 50000 },
    { date: "2026-01-02", amount: 75000 },
  ],
};

const mockPayments = {
  payments: [
    {
      id: "pay1",
      amount: 150000,
      currency: "UZS",
      status: "completed" as const,
      provider: "payme",
      providerTxId: "tx123",
      createdAt: "2026-01-15T10:00:00Z",
      updatedAt: "2026-01-15T10:00:00Z",
      user: { id: "user1", email: "test@example.com", name: "Test User" },
      plan: { id: "plan1", name: "Global Premium", slug: "global", type: "global" },
      subscriptionId: "sub1",
    },
  ],
  total: 1,
};

const mockSubscriptions = {
  subscriptions: [
    {
      id: "sub1",
      status: "active" as const,
      startDate: "2026-01-01T00:00:00Z",
      endDate: "2026-02-01T00:00:00Z",
      autoRenew: true,
      createdAt: "2026-01-01T00:00:00Z",
      user: { id: "user1", email: "test@example.com", name: "Test User", isPremium: true },
      plan: { id: "plan1", name: "Global Premium", slug: "global", type: "global", priceMonthly: 150000 },
      paymentsCount: 1,
    },
  ],
  total: 1,
};

const mockPlans = [
  {
    id: "plan1",
    slug: "global",
    name: "Global Premium",
    nameRu: "Глобальный Премиум",
    type: "global",
    priceMonthly: 150000,
    currency: "UZS",
    isActive: true,
    course: null,
    subscriptionsCount: 10,
    createdAt: "2025-01-01T00:00:00Z",
  },
];

describe("PaymentsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminService.getRevenueAnalytics).mockResolvedValue(mockRevenueData);
    vi.mocked(adminService.getPayments).mockResolvedValue(mockPayments);
    vi.mocked(adminService.getSubscriptionsList).mockResolvedValue(mockSubscriptions);
    vi.mocked(adminService.getSubscriptionPlans).mockResolvedValue(mockPlans);
  });

  it("renders panel title", async () => {
    render(<PaymentsPanel />);
    expect(screen.getByText("admin.payments.title")).toBeInTheDocument();
  });

  it("renders tabs", async () => {
    render(<PaymentsPanel />);
    expect(screen.getByText("admin.payments.tab.revenue")).toBeInTheDocument();
    expect(screen.getByText("admin.payments.tab.subscriptions")).toBeInTheDocument();
    expect(screen.getByText("admin.payments.tab.payments")).toBeInTheDocument();
  });

  it("loads revenue data on mount", async () => {
    render(<PaymentsPanel />);

    await waitFor(() => {
      expect(adminService.getRevenueAnalytics).toHaveBeenCalled();
    });
  });

  it("displays revenue stats", async () => {
    render(<PaymentsPanel />);

    await waitFor(() => {
      expect(screen.getByText("admin.payments.thisMonth")).toBeInTheDocument();
      expect(screen.getByText("admin.payments.lastMonth")).toBeInTheDocument();
      expect(screen.getByText("admin.payments.totalRevenue")).toBeInTheDocument();
    });
  });

  it("displays provider breakdown", async () => {
    render(<PaymentsPanel />);

    await waitFor(() => {
      expect(screen.getByText("admin.payments.byProvider")).toBeInTheDocument();
    });
  });

  it("switches to payments tab", async () => {
    render(<PaymentsPanel />);

    const paymentsTab = screen.getByText("admin.payments.tab.payments");
    fireEvent.click(paymentsTab);

    await waitFor(() => {
      expect(adminService.getPayments).toHaveBeenCalled();
    });
  });

  it("switches to subscriptions tab", async () => {
    render(<PaymentsPanel />);

    const subscriptionsTab = screen.getByText("admin.payments.tab.subscriptions");
    fireEvent.click(subscriptionsTab);

    await waitFor(() => {
      expect(adminService.getSubscriptionsList).toHaveBeenCalled();
      expect(adminService.getSubscriptionPlans).toHaveBeenCalled();
    });
  });

  it("displays payments list when on payments tab", async () => {
    render(<PaymentsPanel />);

    const paymentsTab = screen.getByText("admin.payments.tab.payments");
    fireEvent.click(paymentsTab);

    await waitFor(() => {
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
  });

  it("displays subscriptions list when on subscriptions tab", async () => {
    render(<PaymentsPanel />);

    const subscriptionsTab = screen.getByText("admin.payments.tab.subscriptions");
    fireEvent.click(subscriptionsTab);

    await waitFor(() => {
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
  });

  it("shows refund button for completed payments", async () => {
    render(<PaymentsPanel />);

    const paymentsTab = screen.getByText("admin.payments.tab.payments");
    fireEvent.click(paymentsTab);

    await waitFor(() => {
      expect(screen.getByText("admin.payments.refund")).toBeInTheDocument();
    });
  });

  it("shows extend button for subscriptions", async () => {
    render(<PaymentsPanel />);

    const subscriptionsTab = screen.getByText("admin.payments.tab.subscriptions");
    fireEvent.click(subscriptionsTab);

    await waitFor(() => {
      expect(screen.getByText("admin.payments.extend")).toBeInTheDocument();
    });
  });

  it("opens refund modal when clicking refund button", async () => {
    render(<PaymentsPanel />);

    const paymentsTab = screen.getByText("admin.payments.tab.payments");
    fireEvent.click(paymentsTab);

    await waitFor(() => {
      expect(screen.getByText("admin.payments.refund")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("admin.payments.refund"));

    await waitFor(() => {
      expect(screen.getByText("admin.payments.refundModalTitle")).toBeInTheDocument();
    });
  });

  it("opens extend modal when clicking extend button", async () => {
    render(<PaymentsPanel />);

    const subscriptionsTab = screen.getByText("admin.payments.tab.subscriptions");
    fireEvent.click(subscriptionsTab);

    await waitFor(() => {
      expect(screen.getByText("admin.payments.extend")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("admin.payments.extend"));

    await waitFor(() => {
      expect(screen.getByText("admin.payments.extendModalTitle")).toBeInTheDocument();
    });
  });

  it("handles refund submission", async () => {
    vi.mocked(adminService.refundPayment).mockResolvedValue({
      ...mockPayments.payments[0],
      status: "refunded",
    });

    render(<PaymentsPanel />);

    const paymentsTab = screen.getByText("admin.payments.tab.payments");
    fireEvent.click(paymentsTab);

    await waitFor(() => {
      expect(screen.getByText("admin.payments.refund")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("admin.payments.refund"));

    await waitFor(() => {
      expect(screen.getByText("admin.payments.refundModalTitle")).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText("admin.payments.refundReasonPlaceholder");
    fireEvent.change(textarea, { target: { value: "Customer requested refund" } });

    const confirmButton = screen.getByText("admin.payments.confirmRefund");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(adminService.refundPayment).toHaveBeenCalledWith("pay1", "Customer requested refund");
    });
  });

  it("handles extend subscription", async () => {
    vi.mocked(adminService.extendSubscription).mockResolvedValue({
      ...mockSubscriptions.subscriptions[0],
      endDate: "2026-03-01T00:00:00Z",
    });

    render(<PaymentsPanel />);

    const subscriptionsTab = screen.getByText("admin.payments.tab.subscriptions");
    fireEvent.click(subscriptionsTab);

    await waitFor(() => {
      expect(screen.getByText("admin.payments.extend")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("admin.payments.extend"));

    await waitFor(() => {
      expect(screen.getByText("admin.payments.extendModalTitle")).toBeInTheDocument();
    });

    const confirmButton = screen.getByText("admin.payments.confirmExtend");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(adminService.extendSubscription).toHaveBeenCalledWith("sub1", 30);
    });
  });

  it("displays error message on load failure", async () => {
    vi.mocked(adminService.getRevenueAnalytics).mockRejectedValue(new Error("Network error"));

    render(<PaymentsPanel />);

    await waitFor(() => {
      expect(screen.getByText("admin.payments.loadError")).toBeInTheDocument();
    });
  });

  it("filters payments by status", async () => {
    render(<PaymentsPanel />);

    const paymentsTab = screen.getByText("admin.payments.tab.payments");
    fireEvent.click(paymentsTab);

    await waitFor(() => {
      expect(adminService.getPayments).toHaveBeenCalled();
    });

    const statusSelect = screen.getAllByRole("combobox")[0];
    fireEvent.change(statusSelect, { target: { value: "completed" } });

    await waitFor(() => {
      expect(adminService.getPayments).toHaveBeenCalledWith(
        expect.objectContaining({ status: "completed" })
      );
    });
  });

  it("filters subscriptions by status", async () => {
    render(<PaymentsPanel />);

    const subscriptionsTab = screen.getByText("admin.payments.tab.subscriptions");
    fireEvent.click(subscriptionsTab);

    await waitFor(() => {
      expect(adminService.getSubscriptionsList).toHaveBeenCalled();
    });

    const statusSelect = screen.getByRole("combobox");
    fireEvent.change(statusSelect, { target: { value: "active" } });

    await waitFor(() => {
      expect(adminService.getSubscriptionsList).toHaveBeenCalledWith(
        expect.objectContaining({ status: "active" })
      );
    });
  });
});

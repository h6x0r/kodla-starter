import React, { useState, useEffect, useCallback } from "react";
import {
  adminService,
  PaymentItem,
  SubscriptionItem,
  RevenueAnalytics,
  SubscriptionPlanItem,
} from "../api/adminService";
import { useUITranslation } from "@/contexts/LanguageContext";
import { createLogger } from "@/lib/logger";

const log = createLogger("PaymentsPanel");

type TabType = "payments" | "subscriptions" | "revenue";

const PaymentsPanel: React.FC = () => {
  const { tUI } = useUITranslation();
  const [activeTab, setActiveTab] = useState<TabType>("revenue");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Revenue state
  const [revenue, setRevenue] = useState<RevenueAnalytics | null>(null);

  // Payments state
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [paymentProvider, setPaymentProvider] = useState<string>("");

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [subscriptionsTotal, setSubscriptionsTotal] = useState(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("");
  const [plans, setPlans] = useState<SubscriptionPlanItem[]>([]);

  // Modal state
  const [refundModal, setRefundModal] = useState<PaymentItem | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [extendModal, setExtendModal] = useState<SubscriptionItem | null>(null);
  const [extendDays, setExtendDays] = useState(30);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Format amount from tiyn to UZS
  const formatAmount = (tiyn: number) => {
    const uzs = tiyn / 100;
    return new Intl.NumberFormat("uz-UZ").format(uzs) + " UZS";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Load revenue analytics
  const loadRevenue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getRevenueAnalytics();
      setRevenue(data);
    } catch (err) {
      log.error("Failed to load revenue", err);
      setError(tUI("admin.payments.loadError"));
    } finally {
      setLoading(false);
    }
  }, [tUI]);

  // Load payments
  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getPayments({
        status: paymentStatus || undefined,
        provider: paymentProvider || undefined,
        limit: 50,
      });
      setPayments(data.payments);
      setPaymentsTotal(data.total);
    } catch (err) {
      log.error("Failed to load payments", err);
      setError(tUI("admin.payments.loadError"));
    } finally {
      setLoading(false);
    }
  }, [paymentStatus, paymentProvider, tUI]);

  // Load subscriptions
  const loadSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [subsData, plansData] = await Promise.all([
        adminService.getSubscriptionsList({
          status: subscriptionStatus || undefined,
          limit: 50,
        }),
        adminService.getSubscriptionPlans(),
      ]);
      setSubscriptions(subsData.subscriptions);
      setSubscriptionsTotal(subsData.total);
      setPlans(plansData);
    } catch (err) {
      log.error("Failed to load subscriptions", err);
      setError(tUI("admin.payments.loadError"));
    } finally {
      setLoading(false);
    }
  }, [subscriptionStatus, tUI]);

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === "revenue") {
      loadRevenue();
    } else if (activeTab === "payments") {
      loadPayments();
    } else if (activeTab === "subscriptions") {
      loadSubscriptions();
    }
  }, [activeTab, loadRevenue, loadPayments, loadSubscriptions]);

  // Reload payments on filter change
  useEffect(() => {
    if (activeTab === "payments") {
      loadPayments();
    }
  }, [paymentStatus, paymentProvider, activeTab, loadPayments]);

  // Reload subscriptions on filter change
  useEffect(() => {
    if (activeTab === "subscriptions") {
      loadSubscriptions();
    }
  }, [subscriptionStatus, activeTab, loadSubscriptions]);

  // Refund payment
  const handleRefund = async () => {
    if (!refundModal || !refundReason.trim()) return;

    try {
      setActionLoading(refundModal.id);
      await adminService.refundPayment(refundModal.id, refundReason.trim());
      setPayments((prev) =>
        prev.map((p) =>
          p.id === refundModal.id ? { ...p, status: "refunded" } : p,
        ),
      );
      setRefundModal(null);
      setRefundReason("");
    } catch (err) {
      log.error("Failed to refund payment", err);
      setError(tUI("admin.payments.refundError"));
    } finally {
      setActionLoading(null);
    }
  };

  // Extend subscription
  const handleExtend = async () => {
    if (!extendModal || extendDays <= 0) return;

    try {
      setActionLoading(extendModal.id);
      const updated = await adminService.extendSubscription(
        extendModal.id,
        extendDays,
      );
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === extendModal.id
            ? { ...s, endDate: updated.endDate, status: "active" }
            : s,
        ),
      );
      setExtendModal(null);
      setExtendDays(30);
    } catch (err) {
      log.error("Failed to extend subscription", err);
      setError(tUI("admin.payments.extendError"));
    } finally {
      setActionLoading(null);
    }
  };

  // Cancel subscription
  const handleCancel = async (subscription: SubscriptionItem) => {
    if (
      !window.confirm(
        tUI("admin.payments.confirmCancel") + " " + subscription.user.email,
      )
    ) {
      return;
    }

    try {
      setActionLoading(subscription.id);
      await adminService.cancelSubscription(subscription.id);
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === subscription.id
            ? { ...s, status: "cancelled", autoRenew: false }
            : s,
        ),
      );
    } catch (err) {
      log.error("Failed to cancel subscription", err);
      setError(tUI("admin.payments.cancelError"));
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "active":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
      case "failed":
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
      case "refunded":
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400";
      case "expired":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400";
    }
  };

  return (
    <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <svg
            className="w-6 h-6 text-brand-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          {tUI("admin.payments.title")}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {tUI("admin.payments.subtitle")}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-dark-border">
        {(["revenue", "subscriptions", "payments"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {tUI(`admin.payments.tab.${tab}`)}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <svg
            className="animate-spin h-8 w-8 text-brand-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === "revenue" && !loading && revenue && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="text-sm text-green-600 dark:text-green-400">
                {tUI("admin.payments.thisMonth")}
              </div>
              <div className="text-xl font-bold text-green-700 dark:text-green-300">
                {formatAmount(revenue.thisMonth.revenue)}
              </div>
              <div className="text-xs text-green-500">
                {revenue.thisMonth.count} {tUI("admin.payments.transactions")}
              </div>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="text-sm text-blue-600 dark:text-blue-400">
                {tUI("admin.payments.lastMonth")}
              </div>
              <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                {formatAmount(revenue.lastMonth.revenue)}
              </div>
              <div className="text-xs text-blue-500">
                {revenue.lastMonth.count} {tUI("admin.payments.transactions")}
              </div>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <div className="text-sm text-purple-600 dark:text-purple-400">
                {tUI("admin.payments.totalRevenue")}
              </div>
              <div className="text-xl font-bold text-purple-700 dark:text-purple-300">
                {formatAmount(revenue.total.revenue)}
              </div>
              <div className="text-xs text-purple-500">
                {revenue.total.count} {tUI("admin.payments.transactions")}
              </div>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <div className="text-sm text-red-600 dark:text-red-400">
                {tUI("admin.payments.refunded")}
              </div>
              <div className="text-xl font-bold text-red-700 dark:text-red-300">
                {formatAmount(revenue.refunded.amount)}
              </div>
              <div className="text-xs text-red-500">
                {revenue.refunded.count} {tUI("admin.payments.transactions")}
              </div>
            </div>
          </div>

          {/* By Provider */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {tUI("admin.payments.byProvider")}
            </h3>
            <div className="flex gap-4">
              {revenue.byProvider.map((p) => (
                <div
                  key={p.provider}
                  className="px-4 py-3 bg-gray-50 dark:bg-dark-bg rounded-xl"
                >
                  <div className="font-medium text-gray-900 dark:text-white capitalize">
                    {p.provider}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatAmount(p.revenue)} ({p.count})
                  </div>
                </div>
              ))}
              {revenue.byProvider.length === 0 && (
                <div className="text-gray-500 dark:text-gray-400">
                  {tUI("admin.payments.noData")}
                </div>
              )}
            </div>
          </div>

          {/* Purchases */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <div className="text-sm text-amber-600 dark:text-amber-400">
              {tUI("admin.payments.oneTimePurchases")}
            </div>
            <div className="text-xl font-bold text-amber-700 dark:text-amber-300">
              {formatAmount(revenue.purchases.revenue)}
            </div>
            <div className="text-xs text-amber-500">
              {revenue.purchases.count} {tUI("admin.payments.purchases")}
            </div>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === "payments" && !loading && (
        <div>
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="px-3 py-2 bg-gray-100 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg text-sm"
            >
              <option value="">{tUI("admin.payments.allStatuses")}</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              value={paymentProvider}
              onChange={(e) => setPaymentProvider(e.target.value)}
              className="px-3 py-2 bg-gray-100 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg text-sm"
            >
              <option value="">{tUI("admin.payments.allProviders")}</option>
              <option value="payme">Payme</option>
              <option value="click">Click</option>
            </select>
            <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
              {tUI("admin.payments.total")}: {paymentsTotal}
            </div>
          </div>

          {/* Payments List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="p-4 bg-gray-50 dark:bg-dark-bg rounded-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {payment.user.email}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(payment.status)}`}
                      >
                        {payment.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {payment.plan.name} • {payment.provider || "manual"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(payment.createdAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 dark:text-white">
                      {formatAmount(payment.amount)}
                    </div>
                    {payment.status === "completed" && (
                      <button
                        onClick={() => setRefundModal(payment)}
                        className="mt-2 px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        {tUI("admin.payments.refund")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {payments.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {tUI("admin.payments.noPayments")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === "subscriptions" && !loading && (
        <div>
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <select
              value={subscriptionStatus}
              onChange={(e) => setSubscriptionStatus(e.target.value)}
              className="px-3 py-2 bg-gray-100 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg text-sm"
            >
              <option value="">{tUI("admin.payments.allStatuses")}</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
            </select>
            <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
              {tUI("admin.payments.total")}: {subscriptionsTotal}
            </div>
          </div>

          {/* Plans Overview */}
          {plans.length > 0 && (
            <div className="mb-4 flex gap-2 flex-wrap">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-dark-bg rounded-lg text-sm"
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {plan.name}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    ({plan.subscriptionsCount})
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Subscriptions List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="p-4 bg-gray-50 dark:bg-dark-bg rounded-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {sub.user.email}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(sub.status)}`}
                      >
                        {sub.status}
                      </span>
                      {sub.autoRenew && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                          Auto-renew
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {sub.plan.name} • {formatAmount(sub.plan.priceMonthly)}
                      /mo
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {tUI("admin.payments.expires")}:{" "}
                      {formatDate(sub.endDate)} • {sub.paymentsCount}{" "}
                      {tUI("admin.payments.payments")}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setExtendModal(sub)}
                      disabled={actionLoading === sub.id}
                      className="px-3 py-1.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50"
                    >
                      {tUI("admin.payments.extend")}
                    </button>
                    {sub.status === "active" && (
                      <button
                        onClick={() => handleCancel(sub)}
                        disabled={actionLoading === sub.id}
                        className="px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === sub.id
                          ? "..."
                          : tUI("admin.payments.cancelSub")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {subscriptions.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {tUI("admin.payments.noSubscriptions")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setRefundModal(null)}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {tUI("admin.payments.refundModalTitle")}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {tUI("admin.payments.refundModalDesc")}{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {formatAmount(refundModal.amount)}
              </span>{" "}
              {tUI("admin.payments.for")}{" "}
              <span className="font-medium">{refundModal.user.email}</span>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {tUI("admin.payments.refundReasonLabel")}
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder={tUI("admin.payments.refundReasonPlaceholder")}
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setRefundModal(null);
                  setRefundReason("");
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {tUI("common.cancel")}
              </button>
              <button
                onClick={handleRefund}
                disabled={
                  !refundReason.trim() || actionLoading === refundModal.id
                }
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading === refundModal.id
                  ? "..."
                  : tUI("admin.payments.confirmRefund")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Modal */}
      {extendModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setExtendModal(null)}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {tUI("admin.payments.extendModalTitle")}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {tUI("admin.payments.extendModalDesc")}{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {extendModal.user.email}
              </span>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {tUI("admin.payments.extendDaysLabel")}
              </label>
              <div className="flex gap-2">
                {[7, 14, 30, 60, 90].map((days) => (
                  <button
                    key={days}
                    onClick={() => setExtendDays(days)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      extendDays === days
                        ? "bg-brand-500 text-white"
                        : "bg-gray-100 dark:bg-dark-bg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-bg/80"
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={extendDays}
                onChange={(e) =>
                  setExtendDays(
                    Math.min(365, Math.max(1, parseInt(e.target.value) || 0)),
                  )
                }
                min={1}
                max={365}
                className="mt-2 w-full px-4 py-2 bg-gray-100 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setExtendModal(null);
                  setExtendDays(30);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {tUI("common.cancel")}
              </button>
              <button
                onClick={handleExtend}
                disabled={extendDays <= 0 || actionLoading === extendModal.id}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading === extendModal.id
                  ? "..."
                  : tUI("admin.payments.confirmExtend")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPanel;

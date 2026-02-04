import { useState, useEffect } from "react";
import {
  paymentService,
  PaymentProvider,
} from "@/features/payments/api/paymentService";
import { createLogger } from "@/lib/logger";

const log = createLogger("Roadmap");

export const useRegeneratePayment = (showModal: boolean) => {
  const [paymentProviders, setPaymentProviders] = useState<PaymentProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<"payme" | "click" | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    if (showModal && paymentProviders.length === 0) {
      paymentService
        .getProviders()
        .then((providers) => {
          const configured = providers.filter((p) => p.configured);
          setPaymentProviders(configured);
          if (configured.length > 0 && !selectedProvider) {
            setSelectedProvider(configured[0].id as "payme" | "click");
          }
        })
        .catch((e) => log.error("Failed to load payment providers", e));
    }
  }, [showModal, paymentProviders.length, selectedProvider]);

  const handlePurchase = async () => {
    if (!selectedProvider) {
      setCheckoutError("Please select a payment method");
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const response = await paymentService.createCheckout({
        orderType: "purchase",
        purchaseType: "roadmap_generation",
        quantity: 1,
        provider: selectedProvider,
        returnUrl: window.location.origin + "/roadmap?status=success",
      });
      window.location.href = response.paymentUrl;
    } catch (e) {
      log.error("Checkout failed", e);
      setCheckoutError("Payment failed. Please try again.");
      setCheckoutLoading(false);
    }
  };

  const clearError = () => setCheckoutError(null);

  return {
    paymentProviders,
    selectedProvider,
    setSelectedProvider,
    checkoutLoading,
    checkoutError,
    handlePurchase,
    clearError,
  };
};

import type {
  BalanceResponse,
  CheckoutResponse,
  PaymentPackageResponse,
  PaymentStatusResponse
} from "@/common/api/responses/payment.response";
import type { CheckoutResult } from "@/common/entities/checkout-result";
import type { PaymentPackage } from "@/common/entities/payment-package";
import type { PaymentStatusModel } from "@/common/entities/payment-status";

export const mapPaymentPackage = (response: PaymentPackageResponse): PaymentPackage => ({
  ...response
});

export const mapCheckoutResult = (response: CheckoutResponse): CheckoutResult => ({
  ...response
});

export const mapPaymentStatus = (
  response: PaymentStatusResponse
): PaymentStatusModel => ({
  ...response
});

export const mapBalanceResponse = (response: BalanceResponse): number =>
  response.creditsBalance;

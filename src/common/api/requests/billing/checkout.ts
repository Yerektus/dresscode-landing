import { mapCheckoutResult } from "@/common/api/mappers/payment.mapper";
import type { CheckoutResponse } from "@/common/api/responses/payment.response";
import type { CheckoutResult } from "@/common/entities/checkout-result";
import { request } from "@/common/api/request";

interface CheckoutPayload {
  packageCode: string;
  successUrl: string;
  cancelUrl: string;
  platform: string;
}

export const createCheckout = async (
  payload: CheckoutPayload
): Promise<CheckoutResult> => {
  const response = await request.post<CheckoutResponse>(
    "/api/v1/billing/checkout",
    payload
  );

  return mapCheckoutResult(response.data);
};

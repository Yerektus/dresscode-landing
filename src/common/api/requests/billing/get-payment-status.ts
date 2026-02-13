import { mapPaymentStatus } from "@/common/api/mappers/payment.mapper";
import type { PaymentStatusResponse } from "@/common/api/responses/payment.response";
import type { PaymentStatusModel } from "@/common/entities/payment-status";
import { request } from "@/common/api/request";

export const getPaymentStatus = async (
  paymentId: string
): Promise<PaymentStatusModel> => {
  const response = await request.get<PaymentStatusResponse>(
    `/api/v1/billing/payments/${paymentId}`
  );

  return mapPaymentStatus(response.data);
};

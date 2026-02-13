import { mapPaymentPackage } from "@/common/api/mappers/payment.mapper";
import type { PaymentPackageResponse } from "@/common/api/responses/payment.response";
import type { PaymentPackage } from "@/common/entities/payment-package";
import { request } from "@/common/api/request";

export const listPackages = async (): Promise<PaymentPackage[]> => {
  const response = await request.get<PaymentPackageResponse[]>("/api/v1/billing/packages");
  return response.data.map((item) => mapPaymentPackage(item));
};

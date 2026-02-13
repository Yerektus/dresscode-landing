import { mapBalanceResponse } from "@/common/api/mappers/payment.mapper";
import type { BalanceResponse } from "@/common/api/responses/payment.response";
import { request } from "@/common/api/request";

export const getBalance = async (): Promise<number> => {
  const response = await request.get<BalanceResponse>("/api/v1/billing/balance");
  return mapBalanceResponse(response.data);
};

import type { AxiosError } from "axios";
import type { ApiError } from "@/common/entities/api-error";

const fallbackMessage = "Не удалось выполнить запрос. Попробуйте снова.";

export const toApiError = (error: unknown): ApiError => {
  const axiosError = error as AxiosError<{ code?: string; message?: string; timestamp?: string }>;

  if (axiosError?.response) {
    return {
      code: axiosError.response.data?.code ?? "request_failed",
      message: axiosError.response.data?.message ?? fallbackMessage,
      timestamp: axiosError.response.data?.timestamp,
      status: axiosError.response.status
    };
  }

  return {
    code: "network_error",
    message: fallbackMessage
  };
};

export const getErrorMessage = (error: unknown): string => toApiError(error).message;

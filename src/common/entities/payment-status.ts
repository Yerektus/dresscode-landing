export interface PaymentStatusModel {
  paymentId: string;
  provider: string;
  providerInvoiceId: string | null;
  status: string;
  amountMinor: number;
  currency: string;
  credits: number;
  redirectUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export const isPaymentTerminal = (status: string): boolean => {
  const normalized = status.toUpperCase();
  return (
    normalized === "PAID" ||
    normalized === "FAILED" ||
    normalized === "EXPIRED" ||
    normalized === "CANCELED"
  );
};

export const isPaymentPaid = (status: string): boolean =>
  status.toUpperCase() === "PAID";

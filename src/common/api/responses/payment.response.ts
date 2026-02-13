export interface PaymentPackageResponse {
  code: string;
  title: string;
  credits: number;
  amountMinor: number;
  currency: string;
}

export interface CheckoutResponse {
  paymentId: string;
  provider: string;
  redirectUrl: string;
  expiresAt: string;
}

export interface PaymentStatusResponse {
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

export interface BalanceResponse {
  creditsBalance: number;
}

export interface CheckoutResult {
  paymentId: string;
  provider: string;
  redirectUrl: string;
  expiresAt: string;
}

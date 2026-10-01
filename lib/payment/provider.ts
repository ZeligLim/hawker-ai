export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED';

export interface PaymentCreateRequest {
  orderId: string;
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
  returnUrl?: string;
}

export interface PaymentCreateResponse {
  paymentId: string;
  status: PaymentStatus;
  redirectUrl: string;
}

export interface PaymentStatusResponse {
  paymentId: string;
  status: PaymentStatus;
}

export interface PaymentProvider {
  createPayment(request: PaymentCreateRequest): Promise<PaymentCreateResponse>;
  getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse>;
  handleWebhook(request: Request): Promise<{ status: PaymentStatus, orderId: string, paymentId: string } | null>;
}

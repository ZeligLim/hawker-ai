import { PaymentProvider, PaymentCreateRequest, PaymentCreateResponse, PaymentStatusResponse, PaymentStatus } from './provider';

export class TngPaymentProvider implements PaymentProvider {
  async createPayment(request: PaymentCreateRequest): Promise<PaymentCreateResponse> {
    throw new Error('TngPaymentProvider not yet implemented. Missing credentials and API docs.');
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    throw new Error('TngPaymentProvider not yet implemented.');
  }

  async handleWebhook(request: Request): Promise<{ status: PaymentStatus, orderId: string, paymentId: string } | null> {
    throw new Error('TngPaymentProvider not yet implemented.');
  }
}

import { PaymentProvider, PaymentCreateRequest, PaymentCreateResponse, PaymentStatusResponse, PaymentStatus } from './provider';

export class MockPaymentProvider implements PaymentProvider {
  async createPayment(request: PaymentCreateRequest): Promise<PaymentCreateResponse> {
    const paymentId = `mock_pi_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/mock-payment?paymentId=${paymentId}&orderId=${request.orderId}&amount=${request.amount}&returnUrl=${encodeURIComponent(request.returnUrl || '')}`;

    return {
      paymentId,
      status: 'PENDING',
      redirectUrl
    };
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    // For mock, status is checked via DB instead of querying an external service
    return {
      paymentId,
      status: 'PENDING'
    };
  }

  async handleWebhook(request: Request): Promise<{ status: PaymentStatus, orderId: string, paymentId: string } | null> {
    try {
      const payload = await request.json();
      if (payload.provider === 'mock' && payload.paymentId && payload.orderId && payload.status) {
        return {
          status: payload.status as PaymentStatus,
          orderId: payload.orderId,
          paymentId: payload.paymentId
        };
      }
    } catch {
      return null;
    }
    return null;
  }
}

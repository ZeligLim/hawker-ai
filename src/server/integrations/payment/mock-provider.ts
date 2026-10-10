import { PaymentProvider, PaymentCreateRequest, PaymentCreateResponse, PaymentStatusResponse, PaymentStatus } from './provider';
import crypto from 'crypto';

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
    return {
      paymentId,
      status: 'PENDING'
    };
  }

  async handleWebhook(request: Request): Promise<{ status: PaymentStatus, orderId: string, paymentId: string } | null> {
    try {
      const signature = request.headers.get('x-mock-signature');
      const body = await request.text();
      
      const expectedSig = crypto.createHmac('sha256', process.env.MOCK_WEBHOOK_SECRET || 'test-secret')
        .update(body)
        .digest('hex');
        
      if (!signature || signature !== expectedSig) {
        console.error('Mock webhook signature mismatch');
        return null;
      }
      
      const payload = JSON.parse(body);
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

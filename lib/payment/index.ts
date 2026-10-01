import { PaymentProvider } from './provider';
import { MockPaymentProvider } from './mock-provider';
import { TngPaymentProvider } from './tng-provider';

export function getPaymentProvider(): PaymentProvider {
  const providerType = process.env.PAYMENT_PROVIDER || 'mock';
  
  if (providerType === 'tng') {
    return new TngPaymentProvider();
  }
  
  return new MockPaymentProvider();
}

export * from './provider';

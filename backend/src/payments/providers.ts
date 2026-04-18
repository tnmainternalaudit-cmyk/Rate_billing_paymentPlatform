import { PaymentMethod } from '@prisma/client';

export interface PaymentProvider {
  method: PaymentMethod;
  charge(input: { amount: number; reference: string }): Promise<{ ok: boolean; providerRef?: string }>;
}

class StubProvider implements PaymentProvider {
  constructor(public readonly method: PaymentMethod) {}
  async charge(input: { amount: number; reference: string }) {
    return { ok: true, providerRef: `${this.method}-${input.reference}` };
  }
}

export const paymentProviders: PaymentProvider[] = [
  new StubProvider(PaymentMethod.MTN_MOMO),
  new StubProvider(PaymentMethod.TELECEL_CASH),
  new StubProvider(PaymentMethod.AIRTELTIGO_MONEY),
  new StubProvider(PaymentMethod.CASH),
  new StubProvider(PaymentMethod.BANK),
  new StubProvider(PaymentMethod.POS),
];

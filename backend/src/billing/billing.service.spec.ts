import { BillingService } from './billing.service';

describe('BillingService', () => {
  const prisma = {
    ratepayer: { findMany: jest.fn() },
    bill: { createMany: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  } as any;
  const audit = { log: jest.fn() } as any;
  const service = new BillingService(prisma, audit);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calculates total with principal and arrears', () => {
    expect(service.calculateTotal(100, 20)).toBe(120);
  });

  it('rounds total to 2 decimals', () => {
    expect(service.calculateTotal(100.105, 0.105)).toBe(100.21);
  });

  it('generates bills for active category ratepayers', async () => {
    prisma.ratepayer.findMany.mockResolvedValue([{ id: '1', uniqueRef: 'P-001' }, { id: '2', uniqueRef: 'P-002' }]);
    prisma.bill.createMany.mockResolvedValue({ count: 2 });

    const result = await service.generateBills({ billingPeriodId: 'bp1', category: 'PROPERTY' as any, principalAmount: 50 });

    expect(result.generated).toBe(2);
    expect(prisma.bill.createMany).toHaveBeenCalled();
    expect(audit.log).toHaveBeenCalled();
  });

  it('handles empty bill generation gracefully', async () => {
    prisma.ratepayer.findMany.mockResolvedValue([]);
    const result = await service.generateBills({ billingPeriodId: 'bp1', category: 'BUSINESS' as any, principalAmount: 50 });
    expect(result.generated).toBe(0);
    expect(prisma.bill.createMany).not.toHaveBeenCalled();
  });
});

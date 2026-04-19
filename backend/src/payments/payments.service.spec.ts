import { PaymentMethod } from '@prisma/client';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  const prisma = {
    payment: {
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      aggregate: jest.fn(),
    },
    receipt: { create: jest.fn() },
    bill: { findUnique: jest.fn(), update: jest.fn() },
  } as any;
  const audit = { log: jest.fn() } as any;
  const notifications = { sendSms: jest.fn(), sendEmail: jest.fn() } as any;
  const receipts = { generateReceiptPdf: jest.fn() } as any;
  const service = new PaymentsService(prisma, audit, notifications, receipts);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds receipt numbers with zero padding', () => {
    expect(service.buildReceiptNo(12)).toMatch(/RCPT-\d{4}-000012/);
  });

  it('posts payment and creates receipt artifacts', async () => {
    prisma.payment.count.mockResolvedValue(0);
    prisma.payment.create.mockResolvedValue({
      id: 'p1',
      receiptNo: 'RCPT-2026-000001',
      ratepayer: { fullName: 'John', phone: '+233241234567', email: 'john@example.com' },
      paidAt: new Date('2026-01-01T00:00:00Z'),
    });
    receipts.generateReceiptPdf.mockResolvedValue('/tmp/r.pdf');
    notifications.sendSms.mockResolvedValue({ ok: true });
    notifications.sendEmail.mockResolvedValue({ ok: true });
    prisma.bill.findUnique.mockResolvedValue({ id: 'b1', totalDue: 100 });
    prisma.payment.aggregate.mockResolvedValue({ _sum: { amount: 100 } });

    const output = await service.postPayment({ billId: 'b1', ratepayerId: 'r1', amount: 100, method: PaymentMethod.CASH, officerId: 'u1' });

    expect(output.id).toBe('p1');
    expect(prisma.receipt.create).toHaveBeenCalled();
    expect(audit.log).toHaveBeenCalled();
  });

  it('marks bill partial when paid amount below due', async () => {
    prisma.payment.count.mockResolvedValue(0);
    prisma.payment.create.mockResolvedValue({
      id: 'p1',
      receiptNo: 'RCPT-2026-000001',
      ratepayer: { fullName: 'John', phone: null, email: null },
      paidAt: new Date('2026-01-01T00:00:00Z'),
    });
    receipts.generateReceiptPdf.mockResolvedValue('/tmp/r.pdf');
    prisma.bill.findUnique.mockResolvedValue({ id: 'b1', totalDue: 150 });
    prisma.payment.aggregate.mockResolvedValue({ _sum: { amount: 100 } });

    await service.postPayment({ billId: 'b1', ratepayerId: 'r1', amount: 100, method: PaymentMethod.CASH, officerId: 'u1' });
    expect(prisma.bill.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'PARTIAL' }) }));
  });

  it('reverses payment and audits', async () => {
    prisma.payment.findUnique.mockResolvedValue({ id: 'p1', isReversed: false });
    prisma.payment.update.mockResolvedValue({ id: 'p1', isReversed: true });
    const output = await service.reversePayment('p1');
    expect(output.isReversed).toBe(true);
    expect(audit.log).toHaveBeenCalled();
  });
});

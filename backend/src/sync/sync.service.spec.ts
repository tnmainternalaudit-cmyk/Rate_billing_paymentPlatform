import { SyncService } from './sync.service';

describe('SyncService', () => {
  const prisma = {
    ratepayer: { findMany: jest.fn() },
    bill: { findMany: jest.fn() },
    payment: { create: jest.fn() },
    syncBatch: { create: jest.fn() },
  } as any;
  const audit = { log: jest.fn() } as any;
  const service = new SyncService(prisma, audit);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('pulls delta updates', async () => {
    prisma.ratepayer.findMany.mockResolvedValue([{ id: 'r1' }]);
    prisma.bill.findMany.mockResolvedValue([{ id: 'b1' }]);

    const out = await service.pull('dev1', '2026-01-01T00:00:00Z');
    expect(out.ratepayers).toHaveLength(1);
    expect(out.bills).toHaveLength(1);
  });

  it('pull includes device id', async () => {
    prisma.ratepayer.findMany.mockResolvedValue([]);
    prisma.bill.findMany.mockResolvedValue([]);
    const out = await service.pull('android-1');
    expect(out.deviceId).toBe('android-1');
  });

  it('push inserts payments and creates sync batch', async () => {
    prisma.payment.create.mockResolvedValue({ id: 'p1' });
    prisma.syncBatch.create.mockResolvedValue({ id: 's1' });

    const out = await service.push({
      deviceId: 'd1',
      officerId: 'o1',
      payments: [{ billId: 'b1', ratepayerId: 'r1', amount: 10, method: 'CASH', paidAt: '2026-01-01T00:00:00Z' }],
    });

    expect(out.inserted).toBe(1);
    expect(prisma.syncBatch.create).toHaveBeenCalled();
    expect(audit.log).toHaveBeenCalled();
  });

  it('push handles empty payment list', async () => {
    prisma.syncBatch.create.mockResolvedValue({ id: 's1' });
    const out = await service.push({ deviceId: 'd1', officerId: 'o1', payments: [] });
    expect(out.inserted).toBe(0);
  });
});

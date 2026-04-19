import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../common/audit.service';

@Injectable()
export class SyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async pull(deviceId: string, updatedAfter?: string) {
    const cutoff = updatedAfter ? new Date(updatedAfter) : new Date('1970-01-01T00:00:00Z');
    const [ratepayers, bills] = await Promise.all([
      this.prisma.ratepayer.findMany({ where: { updatedAt: { gt: cutoff } } }),
      this.prisma.bill.findMany({ where: { updatedAt: { gt: cutoff } } }),
    ]);
    return { deviceId, ratepayers, bills, serverTime: new Date().toISOString() };
  }

  async push(input: { deviceId: string; officerId: string; payments: Array<{ billId: string; ratepayerId: string; amount: number; method: string; paidAt: string }>; actorId?: string }) {
    let inserted = 0;
    for (const p of input.payments) {
      await this.prisma.payment.create({
        data: {
          receiptNo: `SYNC-${Date.now()}-${inserted + 1}`,
          billId: p.billId,
          ratepayerId: p.ratepayerId,
          amount: p.amount,
          method: p.method as never,
          officerId: input.officerId,
          paidAt: new Date(p.paidAt),
          providerRef: `offline-${input.deviceId}`,
          createdBy: input.actorId,
          updatedBy: input.actorId,
        },
      });
      inserted++;
    }

    await this.prisma.syncBatch.create({
      data: {
        deviceId: input.deviceId,
        officerId: input.officerId,
        pushedAt: new Date(),
        recordCount: inserted,
        status: 'COMPLETED',
        createdBy: input.actorId,
        updatedBy: input.actorId,
      },
    });

    await this.audit.log({
      userId: input.actorId,
      action: 'SYNC_PUSH',
      entity: 'SyncBatch',
      entityId: input.deviceId,
      after: { inserted },
    });

    return { inserted };
  }
}

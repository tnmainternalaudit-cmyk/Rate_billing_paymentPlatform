import { Injectable } from '@nestjs/common';
import { BillStatus, Prisma, RatepayerType } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../common/audit.service';

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  calculateTotal(principal: number, arrears: number): number {
    return Number((principal + arrears).toFixed(2));
  }

  async generateBills(input: { billingPeriodId: string; category: RatepayerType; principalAmount: number; arrearsAmount?: number; actorId?: string }) {
    const ratepayers = await this.prisma.ratepayer.findMany({ where: { type: input.category, isActive: true } });
    const created: Prisma.BillCreateManyInput[] = ratepayers.map((r, idx) => {
      const arrears = input.arrearsAmount ?? 0;
      const totalDue = this.calculateTotal(input.principalAmount, arrears);
      return {
        billNo: `BILL-${new Date().getUTCFullYear()}-${idx + 1}-${r.uniqueRef}`,
        ratepayerId: r.id,
        billingPeriodId: input.billingPeriodId,
        principal: input.principalAmount,
        arrears,
        totalDue,
        status: BillStatus.UNPAID,
        issuedAt: new Date(),
        createdBy: input.actorId,
        updatedBy: input.actorId,
      };
    });

    if (created.length) {
      await this.prisma.bill.createMany({ data: created, skipDuplicates: true });
    }

    await this.audit.log({
      userId: input.actorId,
      action: 'GENERATE_BILLS',
      entity: 'Bill',
      entityId: input.billingPeriodId,
      after: { category: input.category, count: created.length },
    });

    return { generated: created.length };
  }

  bills() {
    return this.prisma.bill.findMany({ include: { ratepayer: true, billingPeriod: true } });
  }

  billById(id: string) {
    return this.prisma.bill.findUnique({ where: { id }, include: { ratepayer: true, payments: true } });
  }

  async cancelBill(id: string, actorId?: string) {
    const before = await this.prisma.bill.findUnique({ where: { id } });
    const updated = await this.prisma.bill.update({ where: { id }, data: { status: BillStatus.CANCELLED, updatedBy: actorId } });
    await this.audit.log({ userId: actorId, action: 'CANCEL', entity: 'Bill', entityId: id, before, after: updated });
    return updated;
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async collections(filters: { from?: string; to?: string; zoneId?: string; officerId?: string }) {
    const from = filters.from ? new Date(filters.from) : new Date('1970-01-01T00:00:00Z');
    const to = filters.to ? new Date(filters.to) : new Date();
    return this.prisma.payment.findMany({
      where: {
        paidAt: { gte: from, lte: to },
        officerId: filters.officerId,
        ratepayer: filters.zoneId ? { zoneId: filters.zoneId } : undefined,
      },
      include: { ratepayer: true },
    });
  }

  async arrears() {
    return this.prisma.bill.findMany({ where: { status: { in: ['UNPAID', 'PARTIAL'] } as never }, include: { ratepayer: true } });
  }

  async officerPerformance() {
    const grouped = await this.prisma.payment.groupBy({ by: ['officerId'], _sum: { amount: true }, _count: { id: true } });
    return grouped;
  }
}

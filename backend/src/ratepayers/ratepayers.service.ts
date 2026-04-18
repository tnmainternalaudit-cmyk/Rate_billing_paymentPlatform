import { Injectable } from '@nestjs/common';
import { Prisma, RatepayerType } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../common/audit.service';
import { CreateRatepayerDto, UpdateRatepayerDto } from './dto';

@Injectable()
export class RatepayersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: { type?: RatepayerType; zoneId?: string; search?: string }) {
    return this.prisma.ratepayer.findMany({
      where: {
        type: query.type,
        zoneId: query.zoneId,
        OR: query.search
          ? [
              { fullName: { contains: query.search, mode: 'insensitive' } },
              { uniqueRef: { contains: query.search, mode: 'insensitive' } },
              { phone: { contains: query.search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(dto: CreateRatepayerDto, actorId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.ratepayer.create({ data: { ...dto, createdBy: actorId, updatedBy: actorId } });
      await this.audit.log({ userId: actorId, action: 'CREATE', entity: 'Ratepayer', entityId: created.id, after: created });
      return created;
    });
  }

  update(id: string, dto: UpdateRatepayerDto, actorId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const before = await tx.ratepayer.findUnique({ where: { id } });
      const updated = await tx.ratepayer.update({ where: { id }, data: { ...dto, updatedBy: actorId } });
      await this.audit.log({ userId: actorId, action: 'UPDATE', entity: 'Ratepayer', entityId: id, before, after: updated });
      return updated;
    });
  }

  delete(id: string, actorId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const before = await tx.ratepayer.findUnique({ where: { id } });
      const deleted = await tx.ratepayer.delete({ where: { id } });
      await this.audit.log({ userId: actorId, action: 'DELETE', entity: 'Ratepayer', entityId: id, before, after: deleted });
      return deleted;
    });
  }

  async importRows(rows: Prisma.RatepayerCreateInput[], actorId?: string) {
    for (const row of rows) {
      await this.prisma.ratepayer.create({ data: { ...row, createdBy: actorId, updatedBy: actorId } });
    }
    await this.audit.log({
      userId: actorId,
      action: 'IMPORT',
      entity: 'Ratepayer',
      entityId: 'bulk',
      after: { count: rows.length },
    });
    return { imported: rows.length };
  }
}

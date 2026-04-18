import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: {
    userId?: string;
    action: string;
    entity: string;
    entityId: string;
    before?: unknown;
    after?: unknown;
    ip?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({ data: { ...input } });
  }
}

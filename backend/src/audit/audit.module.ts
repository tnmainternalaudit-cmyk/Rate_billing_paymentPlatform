import { Module } from '@nestjs/common';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  providers: [AuditService, PrismaService],
  exports: [AuditService],
})
export class AuditModule {}

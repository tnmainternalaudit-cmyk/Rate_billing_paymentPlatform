import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../common/audit.service';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';

@Module({
  providers: [BillingService, PrismaService, AuditService],
  controllers: [BillingController],
  exports: [BillingService],
})
export class BillingModule {}

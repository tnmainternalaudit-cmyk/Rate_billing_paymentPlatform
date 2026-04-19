import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../common/audit.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { ReceiptsModule } from '../receipts/receipts.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [NotificationsModule, ReceiptsModule],
  providers: [PaymentsService, PrismaService, AuditService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}

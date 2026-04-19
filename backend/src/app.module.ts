import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './common/prisma.service';
import { AuthModule } from './auth/auth.module';
import { RatepayersModule } from './ratepayers/ratepayers.module';
import { BillingModule } from './billing/billing.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { SyncModule } from './sync/sync.module';
import { UsersModule } from './users/users.module';
import { AuditModule } from './audit/audit.module';
import { BackupModule } from './backup/backup.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    RatepayersModule,
    BillingModule,
    PaymentsModule,
    NotificationsModule,
    ReportsModule,
    SyncModule,
    AuditModule,
    BackupModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}

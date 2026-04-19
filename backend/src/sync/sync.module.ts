import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../common/audit.service';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';

@Module({
  providers: [SyncService, PrismaService, AuditService],
  controllers: [SyncController],
  exports: [SyncService],
})
export class SyncModule {}

import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../common/audit.service';
import { RatepayersController } from './ratepayers.controller';
import { RatepayersService } from './ratepayers.service';

@Module({
  providers: [RatepayersService, PrismaService, AuditService],
  controllers: [RatepayersController],
  exports: [RatepayersService],
})
export class RatepayersModule {}

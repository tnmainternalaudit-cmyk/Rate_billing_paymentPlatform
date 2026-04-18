import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  providers: [ReportsService, PrismaService],
  controllers: [ReportsController],
})
export class ReportsModule {}

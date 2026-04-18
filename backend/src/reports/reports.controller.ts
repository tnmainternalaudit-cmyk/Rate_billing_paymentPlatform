import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('collections')
  collections(@Query('from') from?: string, @Query('to') to?: string, @Query('zoneId') zoneId?: string, @Query('officerId') officerId?: string) {
    return this.reports.collections({ from, to, zoneId, officerId });
  }

  @Get('arrears')
  arrears() {
    return this.reports.arrears();
  }

  @Get('officer-performance')
  officerPerformance() {
    return this.reports.officerPerformance();
  }
}

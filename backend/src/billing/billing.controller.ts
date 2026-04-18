import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { RatepayerType } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { BillingService } from './billing.service';

class GenerateBillsDto {
  @IsString()
  billingPeriodId!: string;

  @IsEnum(RatepayerType)
  category!: RatepayerType;

  @IsNumber()
  principalAmount!: number;

  @IsOptional()
  @IsNumber()
  arrearsAmount?: number;
}

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingController {
  constructor(private readonly service: BillingService) {}

  @Post('billing/generate')
  generate(@Body() dto: GenerateBillsDto, @Req() req: { user?: { userId?: string } }) {
    return this.service.generateBills({ ...dto, actorId: req.user?.userId });
  }

  @Get('bills')
  bills() {
    return this.service.bills();
  }

  @Get('bills/:id')
  bill(@Param('id') id: string) {
    return this.service.billById(id);
  }

  @Post('bills/:id/cancel')
  cancel(@Param('id') id: string, @Req() req: { user?: { userId?: string } }) {
    return this.service.cancelBill(id, req.user?.userId);
  }
}

import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { SyncService } from './sync.service';

class PullDto {
  @IsString()
  deviceId!: string;

  @IsOptional()
  @IsString()
  updatedAfter?: string;
}

class PushPaymentDto {
  @IsString()
  billId!: string;

  @IsString()
  ratepayerId!: string;

  amount!: number;

  @IsString()
  method!: string;

  @IsString()
  paidAt!: string;
}

class PushDto {
  @IsString()
  deviceId!: string;

  @IsString()
  officerId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PushPaymentDto)
  payments!: PushPaymentDto[];
}

@Controller('sync')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SyncController {
  constructor(private readonly sync: SyncService) {}

  @Post('pull')
  pull(@Body() dto: PullDto) {
    return this.sync.pull(dto.deviceId, dto.updatedAfter);
  }

  @Post('push')
  push(@Body() dto: PushDto, @Req() req: { user?: { userId?: string } }) {
    return this.sync.push({ ...dto, actorId: req.user?.userId });
  }
}

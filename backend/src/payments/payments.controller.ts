import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { CreatePaymentDto } from './dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post()
  post(@Body() dto: CreatePaymentDto, @Req() req: { user?: { userId?: string } }) {
    return this.service.postPayment(dto, req.user?.userId);
  }

  @Post(':id/reverse')
  reverse(@Param('id') id: string, @Req() req: { user?: { userId?: string } }) {
    return this.service.reversePayment(id, req.user?.userId);
  }
}

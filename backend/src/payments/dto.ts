import { PaymentMethod } from '@prisma/client';
import { IsEnum, IsNumber, IsString, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  billId!: string;

  @IsString()
  ratepayerId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @IsString()
  officerId!: string;
}

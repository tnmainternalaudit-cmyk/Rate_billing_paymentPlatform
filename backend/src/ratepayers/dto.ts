import { RatepayerType } from '@prisma/client';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, Matches } from 'class-validator';

const ghPhoneRegex = /^\+233\d{9}$/;

export class CreateRatepayerDto {
  @IsString()
  uniqueRef!: string;

  @IsEnum(RatepayerType)
  type!: RatepayerType;

  @IsString()
  fullName!: string;

  @IsOptional()
  @Matches(ghPhoneRegex)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  zoneId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateRatepayerDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @Matches(ghPhoneRegex)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

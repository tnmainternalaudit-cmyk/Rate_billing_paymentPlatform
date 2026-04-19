import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { NotificationsService } from './notifications.service';

class TestSmsDto {
  @IsString()
  @Matches(/^\+233\d{9}$/)
  to!: string;

  @IsString()
  message!: string;
}

class TestEmailDto {
  @IsEmail()
  to!: string;

  @IsString()
  subject!: string;

  @IsOptional()
  @IsString()
  html?: string;
}

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Post('test-sms')
  testSms(@Body() dto: TestSmsDto) {
    return this.notifications.sendSms(dto.to, dto.message);
  }

  @Post('test-email')
  testEmail(@Body() dto: TestEmailDto) {
    return this.notifications.sendEmail(dto.to, dto.subject, dto.html || '<p>Test email</p>');
  }
}

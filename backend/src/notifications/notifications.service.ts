import { Injectable } from '@nestjs/common';
import { NotificationChannel, NotificationStatus } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../common/prisma.service';
import {
  ArkeselProvider,
  DryRunSmsProvider,
  EmailProvider,
  HubtelProvider,
  MNotifyProvider,
  SmsProvider,
} from './providers';

@Injectable()
export class NotificationsService {
  private readonly smsProvider: SmsProvider;
  private readonly emailProvider: EmailProvider;

  constructor(private readonly prisma: PrismaService) {
    const provider = (process.env.SMS_PROVIDER || 'dryrun').toLowerCase();
    this.smsProvider =
      process.env.NODE_ENV !== 'production' || provider === 'dryrun'
        ? new DryRunSmsProvider()
        : provider === 'mnotify'
          ? new MNotifyProvider()
          : provider === 'hubtel'
            ? new HubtelProvider()
            : new ArkeselProvider();

    this.emailProvider = {
      sendEmail: async (to: string, subject: string, html: string) => {
        try {
          const transport = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_SECURE === 'true',
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          });
          if (process.env.NODE_ENV !== 'production') {
            return { ok: true, response: `DRY_RUN_EMAIL to=${to} subject=${subject}` };
          }
          const info = await transport.sendMail({ from: process.env.SMTP_FROM, to, subject, html });
          return { ok: true, response: JSON.stringify(info) };
        } catch (error) {
          return { ok: false, response: String(error) };
        }
      },
    };
  }

  async sendSms(to: string, message: string) {
    const result = await this.smsProvider.sendSms(to, message);
    await this.prisma.notificationLog.create({
      data: {
        channel: NotificationChannel.SMS,
        recipient: to,
        payload: message,
        status: result.ok ? NotificationStatus.SENT : NotificationStatus.FAILED,
        providerResponse: result.response,
      },
    });
    return result;
  }

  async sendEmail(to: string, subject: string, html: string) {
    const result = await this.emailProvider.sendEmail(to, subject, html);
    await this.prisma.notificationLog.create({
      data: {
        channel: NotificationChannel.EMAIL,
        recipient: to,
        payload: JSON.stringify({ subject, html }),
        status: result.ok ? NotificationStatus.SENT : NotificationStatus.FAILED,
        providerResponse: result.response,
      },
    });
    return result;
  }
}

export interface SmsProvider {
  sendSms(to: string, message: string): Promise<{ ok: boolean; response: string }>;
}

export interface EmailProvider {
  sendEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; response: string }>;
}

export class DryRunSmsProvider implements SmsProvider {
  async sendSms(to: string, message: string) {
    return { ok: true, response: `DRY_RUN_SMS to=${to} message=${message}` };
  }
}

export class MNotifyProvider implements SmsProvider {
  async sendSms(to: string, message: string) {
    return { ok: true, response: `MNOTIFY_STUB to=${to} message=${message}` };
  }
}

export class HubtelProvider implements SmsProvider {
  async sendSms(to: string, message: string) {
    return { ok: true, response: `HUBTEL_STUB to=${to} message=${message}` };
  }
}

export class ArkeselProvider implements SmsProvider {
  async sendSms(to: string, message: string) {
    return { ok: true, response: `ARKESEL_STUB to=${to} message=${message}` };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { BillStatus, NotificationStatus } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../common/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ReceiptsService } from '../receipts/receipts.service';
import { CreatePaymentDto } from './dto';
import { paymentProviders } from './providers';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
    private readonly receipts: ReceiptsService,
  ) {}

  buildReceiptNo(seq: number): string {
    const year = new Date().getUTCFullYear();
    return `RCPT-${year}-${String(seq).padStart(6, '0')}`;
  }

  async postPayment(dto: CreatePaymentDto, actorId?: string) {
    const provider = paymentProviders.find((p) => p.method === dto.method);
    if (!provider) throw new NotFoundException('Payment provider not found');

    const count = await this.prisma.payment.count();
    const receiptNo = this.buildReceiptNo(count + 1);
    const providerResponse = await provider.charge({ amount: dto.amount, reference: receiptNo });

    const payment = await this.prisma.payment.create({
      data: {
        billId: dto.billId,
        ratepayerId: dto.ratepayerId,
        amount: dto.amount,
        method: dto.method,
        providerRef: providerResponse.providerRef,
        officerId: dto.officerId,
        paidAt: new Date(),
        receiptNo,
        createdBy: actorId,
        updatedBy: actorId,
      },
      include: { ratepayer: true },
    });

    const pdfPath = await this.receipts.generateReceiptPdf({
      receiptNo,
      amount: dto.amount,
      ratepayerName: payment.ratepayer.fullName,
      paidAt: payment.paidAt.toISOString(),
    });

    const sms = payment.ratepayer.phone
      ? await this.notifications.sendSms(payment.ratepayer.phone, `TNMA receipt ${receiptNo} amount GHS ${dto.amount.toFixed(2)}`)
      : { ok: false };

    const email = payment.ratepayer.email
      ? await this.notifications.sendEmail(
          payment.ratepayer.email,
          `TNMA Payment Receipt ${receiptNo}`,
          `<p>Amount paid: GHS ${dto.amount.toFixed(2)}</p>`,
        )
      : { ok: false };

    await this.prisma.receipt.create({
      data: {
        paymentId: payment.id,
        pdfPath,
        smsStatus: sms.ok ? NotificationStatus.SENT : NotificationStatus.FAILED,
        emailStatus: email.ok ? NotificationStatus.SENT : NotificationStatus.FAILED,
        createdBy: actorId,
        updatedBy: actorId,
      },
    });

    const bill = await this.prisma.bill.findUnique({ where: { id: dto.billId } });
    if (bill) {
      const paidTotal = await this.prisma.payment.aggregate({ _sum: { amount: true }, where: { billId: bill.id, isReversed: false } });
      const due = Number(bill.totalDue);
      const paid = Number(paidTotal._sum.amount || 0);
      await this.prisma.bill.update({
        where: { id: bill.id },
        data: {
          status: paid >= due ? BillStatus.PAID : BillStatus.PARTIAL,
          updatedBy: actorId,
        },
      });
    }

    await this.audit.log({ userId: actorId, action: 'CREATE', entity: 'Payment', entityId: payment.id, after: payment });

    return payment;
  }

  async reversePayment(id: string, actorId?: string) {
    const before = await this.prisma.payment.findUnique({ where: { id } });
    const updated = await this.prisma.payment.update({ where: { id }, data: { isReversed: true, updatedBy: actorId } });
    await this.audit.log({ userId: actorId, action: 'REVERSE', entity: 'Payment', entityId: id, before, after: updated });
    return updated;
  }
}

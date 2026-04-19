import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';

@Injectable()
export class ReceiptsService {
  async generateReceiptPdf(input: {
    receiptNo: string;
    amount: number;
    ratepayerName: string;
    paidAt: string;
  }): Promise<string> {
    const dir = path.resolve(process.cwd(), 'tmp-receipts');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, `${input.receiptNo}.pdf`);

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    doc.fontSize(18).text('Tano North Municipal Assembly', { align: 'center' });
    doc.fontSize(12).text('Revenue Billing & Payment Receipt', { align: 'center' });
    doc.moveDown();
    doc.text(`Receipt No: ${input.receiptNo}`);
    doc.text(`Ratepayer: ${input.ratepayerName}`);
    doc.text(`Amount (GHS): ${input.amount.toFixed(2)}`);
    doc.text(`Paid At (UTC): ${input.paidAt}`);
    doc.text('Logo: [TNMA placeholder]');
    doc.end();

    await new Promise<void>((resolve) => stream.on('finish', () => resolve()));
    return filePath;
  }
}

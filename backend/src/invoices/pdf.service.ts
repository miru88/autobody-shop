import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { Invoice } from '../entities';

@Injectable()
export class PdfService {
  async generateInvoicePdf(invoice: Invoice): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // ── Header ────────────────────────────────────────────────
      doc
        .fillColor('#1a1a2e')
        .fontSize(26)
        .font('Helvetica-Bold')
        .text('AutoBody Shop', 50, 50);

      doc
        .fillColor('#666')
        .fontSize(10)
        .font('Helvetica')
        .text('123 High Street, London, UK', 50, 82)
        .text('Tel: 020 1234 5678  |  info@autobodyshop.co.uk', 50, 96);

      // Invoice title block
      doc
        .fillColor('#1a1a2e')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('INVOICE', 400, 50, { align: 'right' });

      doc
        .fillColor('#333')
        .fontSize(10)
        .font('Helvetica')
        .text(`Invoice No: ${invoice.invoice_number}`, 400, 78, { align: 'right' })
        .text(
          `Date: ${new Date(invoice.created_at).toLocaleDateString('en-GB')}`,
          400, 92, { align: 'right' },
        );

      if (invoice.due_date) {
        doc.text(
          `Due: ${new Date(invoice.due_date).toLocaleDateString('en-GB')}`,
          400, 106, { align: 'right' },
        );
      }

      // ── Divider ───────────────────────────────────────────────
      doc.moveTo(50, 130).lineTo(545, 130).strokeColor('#ddd').stroke();

      // ── Bill To ───────────────────────────────────────────────
      doc
        .fillColor('#999')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('BILL TO', 50, 145);

      const customer = invoice.job?.customer;
      if (customer) {
        doc
          .fillColor('#333')
          .fontSize(11)
          .font('Helvetica-Bold')
          .text(customer.name, 50, 160);
        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor('#555');
        if (customer.email) doc.text(customer.email, 50, 175);
        if (customer.phone) doc.text(customer.phone, 50, customer.email ? 189 : 175);
        if (customer.address) doc.text(customer.address, 50, 203);
      }

      // Vehicle info
      const vehicle = invoice.job?.vehicle;
      if (vehicle) {
        doc
          .fillColor('#999')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('VEHICLE', 350, 145);
        doc
          .fillColor('#333')
          .fontSize(10)
          .font('Helvetica')
          .text(`${vehicle.year} ${vehicle.make} ${vehicle.model}`, 350, 160);
        if (vehicle.registration) doc.text(`Reg: ${vehicle.registration}`, 350, 174);
        if (vehicle.colour) doc.text(`Colour: ${vehicle.colour}`, 350, 188);
      }

      // ── Line Items Table ───────────────────────────────────────
      const tableTop = 260;

      // Table header
      doc
        .fillColor('#1a1a2e')
        .rect(50, tableTop, 495, 24)
        .fill();

      doc
        .fillColor('#fff')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Description', 60, tableTop + 7)
        .text('Qty', 340, tableTop + 7, { width: 50, align: 'right' })
        .text('Unit Price', 400, tableTop + 7, { width: 70, align: 'right' })
        .text('Total', 475, tableTop + 7, { width: 65, align: 'right' });

      // Table rows
      let y = tableTop + 30;
      const lineItems = invoice.line_items || [];

      lineItems.forEach((item, i) => {
        if (i % 2 === 0) {
          doc.fillColor('#f8f9fa').rect(50, y - 4, 495, 22).fill();
        }

        doc
          .fillColor('#333')
          .fontSize(10)
          .font('Helvetica')
          .text(item.description, 60, y, { width: 270 })
          .text(String(item.quantity), 340, y, { width: 50, align: 'right' })
          .text(`£${Number(item.unit_price).toFixed(2)}`, 400, y, { width: 70, align: 'right' })
          .text(`£${Number(item.line_total).toFixed(2)}`, 475, y, { width: 65, align: 'right' });

        y += 24;
      });

      // ── Totals ────────────────────────────────────────────────
      y += 10;
      doc.moveTo(350, y).lineTo(545, y).strokeColor('#ddd').stroke();
      y += 10;

      doc
        .fillColor('#555')
        .fontSize(10)
        .font('Helvetica')
        .text('Subtotal:', 350, y, { width: 120 })
        .text(`£${Number(invoice.subtotal).toFixed(2)}`, 475, y, { width: 65, align: 'right' });

      y += 20;
      doc
        .text(`VAT (${invoice.vat_rate}%):`, 350, y, { width: 120 })
        .text(`£${Number(invoice.vat_amount).toFixed(2)}`, 475, y, { width: 65, align: 'right' });

      y += 10;
      doc.moveTo(350, y).lineTo(545, y).strokeColor('#ddd').stroke();
      y += 10;

      doc
        .fillColor('#1a1a2e')
        .fontSize(13)
        .font('Helvetica-Bold')
        .text('TOTAL:', 350, y, { width: 120 })
        .text(`£${Number(invoice.total).toFixed(2)}`, 475, y, { width: 65, align: 'right' });

      // ── Status badge ──────────────────────────────────────────
      if (invoice.status === 'paid') {
        doc
          .save()
          .rotate(-20, { origin: [300, 400] })
          .fillColor('#22c55e')
          .fontSize(60)
          .font('Helvetica-Bold')
          .opacity(0.12)
          .text('PAID', 150, 380)
          .restore();
      }

      // ── Notes ─────────────────────────────────────────────────
      if (invoice.notes) {
        y += 50;
        doc
          .fillColor('#999')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('NOTES', 50, y);
        doc
          .fillColor('#555')
          .fontSize(10)
          .font('Helvetica')
          .text(invoice.notes, 50, y + 14, { width: 495 });
      }

      // ── Footer ────────────────────────────────────────────────
      doc
        .fillColor('#ccc')
        .fontSize(9)
        .font('Helvetica')
        .text('Thank you for your business.', 50, 760, { align: 'center', width: 495 });

      doc.end();
    });
  }
}

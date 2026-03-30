import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IsUUID, IsOptional, IsString, IsNumber, IsArray, ValidateNested, IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Invoice, InvoiceLineItem, Job } from '../entities';
import { InvoiceNumberService } from './invoice-number.service';
import { PdfService } from './pdf.service';
import { S3Service } from '../photos/s3.service';

export class LineItemDto {
  @IsString() description: string;
  @IsNumber() quantity: number;
  @IsNumber() unit_price: number;
}

export class CreateInvoiceDto {
  @IsUUID() job_id: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => LineItemDto)
  line_items: LineItemDto[];
  @IsOptional() @IsNumber() vat_rate?: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsDateString() due_date?: string;
}

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice) private invoicesRepo: Repository<Invoice>,
    @InjectRepository(InvoiceLineItem) private lineItemsRepo: Repository<InvoiceLineItem>,
    @InjectRepository(Job) private jobsRepo: Repository<Job>,
    private invoiceNumberService: InvoiceNumberService,
    private pdfService: PdfService,
    private s3: S3Service,
  ) {}

  findAll() {
    return this.invoicesRepo.find({
      relations: ['job', 'job.customer', 'job.vehicle', 'line_items'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const invoice = await this.invoicesRepo.findOne({
      where: { id },
      relations: ['job', 'job.customer', 'job.vehicle', 'line_items'],
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async create(dto: CreateInvoiceDto) {
    const job = await this.jobsRepo.findOne({ where: { id: dto.job_id } });
    if (!job) throw new NotFoundException('Job not found');

    const vatRate = dto.vat_rate ?? 20;
    const lineItems: InvoiceLineItem[] = dto.line_items.map((li) => {
      const item = new InvoiceLineItem();
      item.description = li.description;
      item.quantity = li.quantity;
      item.unit_price = li.unit_price;
      item.line_total = li.quantity * li.unit_price;
      return item;
    });

    const subtotal = lineItems.reduce((sum, li) => sum + li.line_total, 0);
    const vatAmount = subtotal * (vatRate / 100);
    const total = subtotal + vatAmount;

    const invoice = this.invoicesRepo.create({
      job_id: dto.job_id,
      invoice_number: await this.invoiceNumberService.generate(),
      line_items: lineItems,
      vat_rate: vatRate,
      subtotal,
      vat_amount: vatAmount,
      total,
      notes: dto.notes,
      due_date: dto.due_date ? new Date(dto.due_date) : undefined,
      status: 'draft',
    });

    return this.invoicesRepo.save(invoice);
  }

  async generatePdf(id: string): Promise<{ buffer: Buffer; invoice: Invoice }> {
    const invoice = await this.findOne(id);
    const buffer = await this.pdfService.generateInvoicePdf(invoice);

    // Store PDF on S3
    const key = `invoices/${invoice.invoice_number}.pdf`;
    await this.s3.upload(
      {
        buffer,
        originalname: `${invoice.invoice_number}.pdf`,
        mimetype: 'application/pdf',
      } as any,
      'invoices',
    );

    return { buffer, invoice };
  }

  async markSent(id: string) {
    const invoice = await this.findOne(id);
    invoice.status = 'sent';
    invoice.sent_at = new Date();
    return this.invoicesRepo.save(invoice);
  }

  async markPaid(id: string) {
    const invoice = await this.findOne(id);
    invoice.status = 'paid';
    invoice.paid_at = new Date();
    return this.invoicesRepo.save(invoice);
  }
}

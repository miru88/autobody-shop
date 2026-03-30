import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice, InvoiceLineItem, Job } from '../entities';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { InvoiceNumberService } from './invoice-number.service';
import { PdfService } from './pdf.service';
import { S3Service } from '../photos/s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, InvoiceLineItem, Job])],
  providers: [InvoicesService, InvoiceNumberService, PdfService, S3Service],
  controllers: [InvoicesController],
})
export class InvoicesModule {}

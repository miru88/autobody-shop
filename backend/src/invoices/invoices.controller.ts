import {
  Controller, Get, Post, Patch, Param, Body, Res,
} from '@nestjs/common';
import { Response } from 'express';
import { InvoicesService, CreateInvoiceDto } from './invoices.service';

@Controller('invoices')
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get()
  findAll() {
    return this.invoicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Get(':id/pdf')
  async getPdf(@Param('id') id: string, @Res() res: Response) {
    const { buffer, invoice } = await this.invoicesService.generatePdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${invoice.invoice_number}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Post()
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(dto);
  }

  @Patch(':id/send')
  markSent(@Param('id') id: string) {
    return this.invoicesService.markSent(id);
  }

  @Patch(':id/paid')
  markPaid(@Param('id') id: string) {
    return this.invoicesService.markPaid(id);
  }
}

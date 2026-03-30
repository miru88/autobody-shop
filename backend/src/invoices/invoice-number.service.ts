import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Invoice } from '../entities';

@Injectable()
export class InvoiceNumberService {
  constructor(
    @InjectRepository(Invoice) private invoicesRepo: Repository<Invoice>,
  ) {}

  async generate(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;

    const last = await this.invoicesRepo.findOne({
      where: { invoice_number: Like(`${prefix}%`) },
      order: { invoice_number: 'DESC' },
    });

    let seq = 1;
    if (last) {
      const parts = last.invoice_number.split('-');
      seq = parseInt(parts[parts.length - 1], 10) + 1;
    }

    return `${prefix}${String(seq).padStart(4, '0')}`;
  }
}

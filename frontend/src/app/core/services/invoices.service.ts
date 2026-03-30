import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Invoice } from '../models/models';

export interface CreateInvoicePayload {
  job_id: string;
  line_items: { description: string; quantity: number; unit_price: number }[];
  vat_rate?: number;
  notes?: string;
  due_date?: string;
}

@Injectable({ providedIn: 'root' })
export class InvoicesService {
  constructor(private api: ApiService) {}

  getAll() {
    return this.api.get<Invoice[]>('invoices');
  }

  getOne(id: string) {
    return this.api.get<Invoice>(`invoices/${id}`);
  }

  create(payload: CreateInvoicePayload) {
    return this.api.post<Invoice>('invoices', payload);
  }

  downloadPdf(id: string) {
    return this.api.getBlob(`invoices/${id}/pdf`);
  }

  markSent(id: string) {
    return this.api.patch<Invoice>(`invoices/${id}/send`, {});
  }

  markPaid(id: string) {
    return this.api.patch<Invoice>(`invoices/${id}/paid`, {});
  }
}

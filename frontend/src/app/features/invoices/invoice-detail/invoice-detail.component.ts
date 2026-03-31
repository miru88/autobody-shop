import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { InvoicesService } from '../../../core/services/invoices.service';
import { Invoice } from '../../../core/models/models';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [
    RouterLink, DatePipe, CurrencyPipe, TitleCasePipe,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatDividerModule,
  ],
  template: `
    @if (loading()) {
      <div class="flex justify-center py-20"><mat-spinner diameter="40" /></div>
    } @else if (invoice()) {
      <div class="max-w-3xl mx-auto">
        <!-- Back + actions -->
        <div class="flex items-center justify-between mb-4">
          <button mat-button routerLink="/invoices" class="text-slate-400 -ml-3">
            <mat-icon>arrow_back</mat-icon> Invoices
          </button>
          <div class="flex gap-2">
            <button mat-stroked-button (click)="downloadPdf()" [disabled]="downloading()">
              @if (downloading()) { <mat-spinner diameter="16" class="mr-2" /> }
              <mat-icon>download</mat-icon> PDF
            </button>
            @if (invoice()!.status === 'draft') {
              <button mat-stroked-button (click)="markSent()">
                <mat-icon>send</mat-icon> Mark Sent
              </button>
            }
            @if (invoice()!.status === 'sent' || invoice()!.status === 'overdue') {
              <button mat-flat-button color="primary" (click)="markPaid()">
                <mat-icon>check_circle</mat-icon> Mark Paid
              </button>
            }
          </div>
        </div>

        <!-- Invoice card -->
        <div class="app-card">
          <!-- Header -->
          <div class="flex justify-between items-start mb-8">
            <div>
              <div class="flex items-center gap-3 mb-1">
                <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                  <mat-icon class="text-white !text-xl">directions_car</mat-icon>
                </div>
                <div>
                  <div class="font-bold text-white text-lg">AutoBody Shop</div>
                  <div class="text-slate-400 text-xs">123 High Street, London</div>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-white">INVOICE</div>
              <div class="font-mono text-indigo-400 mt-1">{{ invoice()!.invoice_number }}</div>
              <div class="mt-2">
                <span class="px-3 py-1 rounded-full text-sm font-medium status-{{ invoice()!.status }}">
                  {{ invoice()!.status | titlecase }}
                </span>
              </div>
            </div>
          </div>

          <!-- Bill to + dates -->
          <div class="grid grid-cols-2 gap-8 mb-8">
            <div>
              <div class="text-xs text-slate-500 uppercase tracking-wider mb-2">Bill To</div>
              <div class="font-medium text-white">{{ invoice()!.job?.customer?.name }}</div>
              @if (invoice()!.job?.customer?.email) {
                <div class="text-slate-400 text-sm">{{ invoice()!.job?.customer?.email }}</div>
              }
              @if (invoice()!.job?.customer?.phone) {
                <div class="text-slate-400 text-sm">{{ invoice()!.job?.customer?.phone }}</div>
              }
            </div>
            <div>
              <div class="text-xs text-slate-500 uppercase tracking-wider mb-2">Details</div>
              <div class="text-sm space-y-1">
                <div class="flex justify-between gap-4">
                  <span class="text-slate-400">Issued</span>
                  <span class="text-white">{{ invoice()!.created_at | date:'dd MMM yyyy' }}</span>
                </div>
                @if (invoice()!.due_date) {
                  <div class="flex justify-between gap-4">
                    <span class="text-slate-400">Due</span>
                    <span class="text-white">{{ invoice()!.due_date | date:'dd MMM yyyy' }}</span>
                  </div>
                }
                @if (invoice()!.sent_at) {
                  <div class="flex justify-between gap-4">
                    <span class="text-slate-400">Sent</span>
                    <span class="text-white">{{ invoice()!.sent_at | date:'dd MMM yyyy' }}</span>
                  </div>
                }
                @if (invoice()!.paid_at) {
                  <div class="flex justify-between gap-4">
                    <span class="text-slate-400">Paid</span>
                    <span class="text-green-400">{{ invoice()!.paid_at | date:'dd MMM yyyy' }}</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Line items -->
          <div class="border border-white/10 rounded-xl overflow-hidden mb-6">
            <div class="grid grid-cols-12 bg-[#13132a] px-4 py-2 text-xs text-slate-500 uppercase tracking-wider">
              <div class="col-span-6">Description</div>
              <div class="col-span-2 text-right">Qty</div>
              <div class="col-span-2 text-right">Unit Price</div>
              <div class="col-span-2 text-right">Total</div>
            </div>
            @for (item of invoice()!.line_items; track item.id; let odd = $odd) {
              <div class="grid grid-cols-12 px-4 py-3 text-sm border-t border-white/5"
                   [class.bg-white]="odd" [class.bg-opacity-[0.02]]="odd">
                <div class="col-span-6 text-white">{{ item.description }}</div>
                <div class="col-span-2 text-right text-slate-300">{{ item.quantity }}</div>
                <div class="col-span-2 text-right text-slate-300">
                  {{ item.unit_price | currency:'GBP':'symbol':'1.2-2' }}
                </div>
                <div class="col-span-2 text-right text-white font-medium">
                  {{ item.line_total | currency:'GBP':'symbol':'1.2-2' }}
                </div>
              </div>
            }
          </div>

          <!-- Totals -->
          <div class="flex justify-end">
            <div class="w-64 space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-400">Subtotal</span>
                <span class="text-white">{{ invoice()!.subtotal | currency:'GBP':'symbol':'1.2-2' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">VAT ({{ invoice()!.vat_rate }}%)</span>
                <span class="text-white">{{ invoice()!.vat_amount | currency:'GBP':'symbol':'1.2-2' }}</span>
              </div>
              <div class="border-t border-white/10 pt-2 flex justify-between text-base font-bold">
                <span class="text-white">Total</span>
                <span class="text-white">{{ invoice()!.total | currency:'GBP':'symbol':'1.2-2' }}</span>
              </div>
            </div>
          </div>

          @if (invoice()!.notes) {
            <div class="mt-8 border-t border-white/10 pt-5">
              <div class="text-xs text-slate-500 uppercase tracking-wider mb-2">Notes</div>
              <p class="text-slate-300 text-sm">{{ invoice()!.notes }}</p>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class InvoiceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc   = inject(InvoicesService);
  private snack = inject(MatSnackBar);

  invoice     = signal<Invoice | null>(null);
  loading     = signal(true);
  downloading = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.getOne(id).subscribe((inv) => {
      this.invoice.set(inv);
      this.loading.set(false);
    });
  }

  downloadPdf() {
    this.downloading.set(true);
    this.svc.downloadPdf(this.invoice()!.id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.invoice()!.invoice_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      this.downloading.set(false);
    });
  }

  markSent() {
    this.svc.markSent(this.invoice()!.id).subscribe((inv) => {
      this.invoice.set(inv);
      this.snack.open('Invoice marked as sent', '', { duration: 2000 });
    });
  }

  markPaid() {
    this.svc.markPaid(this.invoice()!.id).subscribe((inv) => {
      this.invoice.set(inv);
      this.snack.open('Invoice marked as paid ✓', '', { duration: 2000 });
    });
  }
}

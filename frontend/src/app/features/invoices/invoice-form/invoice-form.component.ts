import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InvoicesService, CreateInvoicePayload } from '../../../core/services/invoices.service';
import { JobsService } from '../../../core/services/jobs.service';
import { Job } from '../../../core/models/models';

interface LineItemRow {
  description: string;
  quantity: number;
  unit_price: number;
}

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [
    RouterLink, FormsModule, CurrencyPipe,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="max-w-3xl mx-auto">
      <button mat-button routerLink="/invoices" class="text-slate-400 -ml-3 mb-4">
        <mat-icon>arrow_back</mat-icon> Invoices
      </button>

      <h1 class="text-2xl font-bold text-white mb-6">New Invoice</h1>

      <div class="app-card space-y-5">
        <!-- Job selector -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Job</mat-label>
          <mat-select [(ngModel)]="selectedJobId">
            @for (job of jobs(); track job.id) {
              <mat-option [value]="job.id">
                {{ job.customer?.name }} — {{ job.description }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>

        <!-- VAT rate -->
        <mat-form-field appearance="outline" class="w-48">
          <mat-label>VAT Rate (%)</mat-label>
          <input matInput type="number" [(ngModel)]="vatRate" min="0" max="100" />
        </mat-form-field>

        <!-- Line items -->
        <div>
          <div class="text-sm font-semibold text-slate-300 mb-3">Line Items</div>

          <!-- Header row -->
          <div class="grid grid-cols-12 gap-2 mb-2 text-xs text-slate-500 uppercase tracking-wider px-1">
            <div class="col-span-6">Description</div>
            <div class="col-span-2">Qty</div>
            <div class="col-span-3">Unit Price (£)</div>
            <div class="col-span-1"></div>
          </div>

          @for (item of lineItems(); track $index; let i = $index) {
            <div class="grid grid-cols-12 gap-2 mb-2 items-center">
              <mat-form-field appearance="outline" class="col-span-6">
                <input matInput placeholder="Description"
                       [(ngModel)]="lineItems()![i].description"
                       (ngModelChange)="onLineItemChange()" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="col-span-2">
                <input matInput type="number" placeholder="1"
                       [(ngModel)]="lineItems()![i].quantity" min="0"
                       (ngModelChange)="onLineItemChange()" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="col-span-3">
                <input matInput type="number" placeholder="0.00"
                       [(ngModel)]="lineItems()![i].unit_price" min="0" step="0.01"
                       (ngModelChange)="onLineItemChange()" />
              </mat-form-field>
              <div class="col-span-1 flex justify-center">
                <button mat-icon-button (click)="removeLine(i)"
                        [disabled]="lineItems()!.length === 1">
                  <mat-icon class="text-slate-500 !text-base">delete</mat-icon>
                </button>
              </div>
            </div>
          }

          <button mat-stroked-button (click)="addLine()" class="mt-1">
            <mat-icon>add</mat-icon> Add Line
          </button>
        </div>

        <!-- Totals preview -->
        <div class="border-t border-white/10 pt-5 flex justify-end">
          <div class="w-64 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-400">Subtotal</span>
              <span class="text-white">{{ subtotal() | currency:'GBP':'symbol':'1.2-2' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">VAT ({{ vatRate }}%)</span>
              <span class="text-white">{{ vatAmount() | currency:'GBP':'symbol':'1.2-2' }}</span>
            </div>
            <div class="border-t border-white/10 pt-2 flex justify-between font-bold text-base">
              <span class="text-white">Total</span>
              <span class="text-white">{{ total() | currency:'GBP':'symbol':'1.2-2' }}</span>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Notes (optional)</mat-label>
          <textarea matInput rows="3" [(ngModel)]="notes"></textarea>
        </mat-form-field>

        <!-- Submit -->
        <div class="flex justify-end gap-3 pt-2">
          <button mat-stroked-button routerLink="/invoices">Cancel</button>
          <button mat-flat-button color="primary" (click)="submit()"
                  [disabled]="saving() || !selectedJobId || lineItems()!.length === 0">
            @if (saving()) { <mat-spinner diameter="18" class="mr-2" /> }
            Create Invoice
          </button>
        </div>
      </div>
    </div>
  `,
})
export class InvoiceFormComponent implements OnInit {
  private jobsSvc     = inject(JobsService);
  private invoicesSvc = inject(InvoicesService);
  private router      = inject(Router);
  private snack       = inject(MatSnackBar);

  jobs         = signal<Job[]>([]);
  lineItems    = signal<LineItemRow[]>([{ description: '', quantity: 1, unit_price: 0 }]);
  selectedJobId = '';
  vatRate       = 20;
  notes         = '';
  saving        = signal(false);

  subtotal = computed(() =>
    this.lineItems()!.reduce((s, li) => s + li.quantity * li.unit_price, 0),
  );
  vatAmount = computed(() => this.subtotal() * (this.vatRate / 100));
  total     = computed(() => this.subtotal() + this.vatAmount());

  ngOnInit() {
    this.jobsSvc.getAll().subscribe((j) => this.jobs.set(j));
  }

  addLine() {
    this.lineItems.update((items) => [...items, { description: '', quantity: 1, unit_price: 0 }]);
  }

  removeLine(i: number) {
    this.lineItems.update((items) => items.filter((_, idx) => idx !== i));
  }

  onLineItemChange() {
    // Triggers computed recalculation via signal update
    this.lineItems.update((items) => [...items]);
  }

  submit() {
    const items = this.lineItems()!.filter((li) => li.description.trim());
    if (!this.selectedJobId || items.length === 0) return;

    this.saving.set(true);
    const payload: CreateInvoicePayload = {
      job_id:     this.selectedJobId,
      line_items: items,
      vat_rate:   this.vatRate,
      notes:      this.notes || undefined,
    };

    this.invoicesSvc.create(payload).subscribe({
      next: (inv) => {
        this.snack.open('Invoice created', '', { duration: 2000 });
        this.router.navigate(['/invoices', inv.id]);
      },
      error: () => {
        this.saving.set(false);
        this.snack.open('Error creating invoice', '', { duration: 3000 });
      },
    });
  }
}

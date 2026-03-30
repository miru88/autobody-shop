import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InvoicesService } from '../../../core/services/invoices.service';
import { Invoice } from '../../../core/models/models';

@Component({
  selector: 'app-invoices-list',
  standalone: true,
  imports: [
    RouterLink, DatePipe, CurrencyPipe,
    MatTableModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white">Invoices</h1>
        <p class="text-slate-400 text-sm mt-1">{{ invoices().length }} total</p>
      </div>
      <button mat-flat-button color="primary" routerLink="/invoices/new">
        <mat-icon>add</mat-icon> New Invoice
      </button>
    </div>

    <!-- Summary chips -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div class="app-card text-center py-4">
        <div class="text-2xl font-bold text-white">{{ stats().total }}</div>
        <div class="text-xs text-slate-400 mt-1">Total</div>
      </div>
      <div class="app-card text-center py-4">
        <div class="text-2xl font-bold text-blue-400">{{ stats().sent }}</div>
        <div class="text-xs text-slate-400 mt-1">Outstanding</div>
      </div>
      <div class="app-card text-center py-4">
        <div class="text-2xl font-bold text-green-400">{{ stats().paid }}</div>
        <div class="text-xs text-slate-400 mt-1">Paid</div>
      </div>
      <div class="app-card text-center py-4">
        <div class="text-2xl font-bold text-red-400">{{ stats().overdue }}</div>
        <div class="text-xs text-slate-400 mt-1">Overdue</div>
      </div>
    </div>

    @if (loading()) {
      <div class="flex justify-center py-20"><mat-spinner diameter="40" /></div>
    } @else {
      <div class="app-card p-0 overflow-hidden">
        <table mat-table [dataSource]="invoices()" class="w-full">
          <ng-container matColumnDef="number">
            <th mat-header-cell *matHeaderCellDef class="!pl-5">Invoice</th>
            <td mat-cell *matCellDef="let inv" class="!pl-5">
              <span class="font-mono text-indigo-400 font-medium">{{ inv.invoice_number }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let inv">
              <span class="px-2 py-1 rounded-full text-xs font-medium status-{{ inv.status }}">
                {{ inv.status | titlecase }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="customer">
            <th mat-header-cell *matHeaderCellDef>Customer</th>
            <td mat-cell *matCellDef="let inv" class="text-white font-medium">
              {{ inv.job?.customer?.name }}
            </td>
          </ng-container>

          <ng-container matColumnDef="total">
            <th mat-header-cell *matHeaderCellDef>Total</th>
            <td mat-cell *matCellDef="let inv" class="font-medium text-white">
              {{ inv.total | currency:'GBP':'symbol':'1.2-2' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="due">
            <th mat-header-cell *matHeaderCellDef>Due Date</th>
            <td mat-cell *matCellDef="let inv" class="text-slate-400 text-sm">
              {{ inv.due_date ? (inv.due_date | date:'dd MMM yyyy') : '—' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Created</th>
            <td mat-cell *matCellDef="let inv" class="text-slate-400 text-sm">
              {{ inv.created_at | date:'dd MMM yyyy' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let inv">
              <button mat-icon-button [routerLink]="['/invoices', inv.id]">
                <mat-icon class="text-slate-400">chevron_right</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="cols" class="border-b border-white/10"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"
              class="hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5"
              [routerLink]="['/invoices', row.id]"></tr>
        </table>

        @if (invoices().length === 0) {
          <div class="text-center py-16 text-slate-500">
            <mat-icon class="!text-4xl mb-3 block">receipt_long</mat-icon>
            No invoices yet
          </div>
        }
      </div>
    }
  `,
  styles: [`
    th.mat-header-cell { background: #13132a; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255,255,255,0.08) !important; }
    td.mat-cell { border-bottom: none !important; }
    tr.mat-row { background: transparent; }
  `],
})
export class InvoicesListComponent implements OnInit {
  private svc = inject(InvoicesService);

  invoices = signal<Invoice[]>([]);
  loading  = signal(true);
  cols     = ['number', 'status', 'customer', 'total', 'due', 'date', 'actions'];

  stats = computed(() => ({
    total:  this.invoices().length,
    sent:   this.invoices().filter((i) => i.status === 'sent').length,
    paid:   this.invoices().filter((i) => i.status === 'paid').length,
    overdue: this.invoices().filter((i) => i.status === 'overdue').length,
  }));

  ngOnInit() {
    this.svc.getAll().subscribe((inv) => {
      this.invoices.set(inv);
      this.loading.set(false);
    });
  }
}

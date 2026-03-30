import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CustomersService } from '../../../core/services/customers.service';
import { Customer } from '../../../core/models/models';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [
    RouterLink, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white">Customers</h1>
        <p class="text-slate-400 text-sm mt-1">{{ customers().length }} customer{{ customers().length !== 1 ? 's' : '' }}</p>
      </div>
      <button mat-flat-button color="primary" routerLink="/customers/new">
        <mat-icon>add</mat-icon> New Customer
      </button>
    </div>

    <!-- Search -->
    <mat-form-field appearance="outline" class="w-full mb-4">
      <mat-label>Search customers…</mat-label>
      <mat-icon matPrefix>search</mat-icon>
      <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearch($event)" />
      @if (searchTerm) {
        <button matSuffix mat-icon-button (click)="clearSearch()">
          <mat-icon>close</mat-icon>
        </button>
      }
    </mat-form-field>

    @if (loading()) {
      <div class="flex justify-center py-20"><mat-spinner diameter="40" /></div>
    } @else {
      <div class="app-card p-0 overflow-hidden">
        <table mat-table [dataSource]="customers()" class="w-full">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef class="!pl-5">Name</th>
            <td mat-cell *matCellDef="let c" class="!pl-5">
              <span class="font-medium text-white">{{ c.name }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let c" class="text-slate-300">
              {{ c.email || '—' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="phone">
            <th mat-header-cell *matHeaderCellDef>Phone</th>
            <td mat-cell *matCellDef="let c" class="text-slate-300">
              {{ c.phone || '—' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="vehicles">
            <th mat-header-cell *matHeaderCellDef>Vehicles</th>
            <td mat-cell *matCellDef="let c" class="text-slate-400 text-sm">
              {{ c.vehicles?.length ?? 0 }}
            </td>
          </ng-container>

          <ng-container matColumnDef="jobs">
            <th mat-header-cell *matHeaderCellDef>Jobs</th>
            <td mat-cell *matCellDef="let c" class="text-slate-400 text-sm">
              {{ c.jobs?.length ?? 0 }}
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let c">
              <button mat-icon-button [routerLink]="['/customers', c.id]">
                <mat-icon class="text-slate-400">chevron_right</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="cols" class="border-b border-white/10"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"
              class="hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5"
              [routerLink]="['/customers', row.id]"></tr>
        </table>

        @if (customers().length === 0) {
          <div class="text-center py-16 text-slate-500">
            <mat-icon class="!text-4xl mb-3 block">people</mat-icon>
            No customers found
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
export class CustomersListComponent implements OnInit, OnDestroy {
  private svc     = inject(CustomersService);
  private search$ = new Subject<string>();

  customers  = signal<Customer[]>([]);
  loading    = signal(true);
  searchTerm = '';
  cols       = ['name', 'email', 'phone', 'vehicles', 'jobs', 'actions'];

  ngOnInit() {
    this.svc.getAll().subscribe((c) => { this.customers.set(c); this.loading.set(false); });

    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => this.svc.getAll(term || undefined)),
    ).subscribe((c) => this.customers.set(c));
  }

  onSearch(term: string) { this.search$.next(term); }

  clearSearch() {
    this.searchTerm = '';
    this.search$.next('');
  }

  ngOnDestroy() { this.search$.complete(); }
}

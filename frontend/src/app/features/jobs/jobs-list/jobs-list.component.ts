import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { JobsService } from '../../../core/services/jobs.service';
import { Job, JobStatus, JOB_STATUSES } from '../../../core/models/models';

@Component({
  selector: 'app-jobs-list',
  standalone: true,
  imports: [
    RouterLink, FormsModule, DatePipe,
    MatTableModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatSelectModule, MatFormFieldModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white">Jobs</h1>
        <p class="text-slate-400 text-sm mt-1">{{ filtered().length }} job{{ filtered().length !== 1 ? 's' : '' }}</p>
      </div>
      <button mat-flat-button color="primary" routerLink="/jobs/new">
        <mat-icon>add</mat-icon> New Job
      </button>
    </div>

    <!-- Status filter -->
    <div class="flex gap-2 flex-wrap mb-5">
      <button mat-stroked-button
              [class.active-filter]="statusFilter() === ''"
              (click)="statusFilter.set('')">
        All
      </button>
      @for (s of statuses; track s.value) {
        <button mat-stroked-button
                [class.active-filter]="statusFilter() === s.value"
                (click)="statusFilter.set(s.value)">
          {{ s.label }}
        </button>
      }
    </div>

    @if (loading()) {
      <div class="flex justify-center py-20">
        <mat-spinner diameter="40" />
      </div>
    } @else {
      <div class="app-card p-0 overflow-hidden">
        <table mat-table [dataSource]="filtered()" class="w-full">
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef class="!pl-5">Status</th>
            <td mat-cell *matCellDef="let job" class="!pl-5">
              <span class="px-2 py-1 rounded-full text-xs font-medium status-{{ job.status }}">
                {{ labelFor(job.status) }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="customer">
            <th mat-header-cell *matHeaderCellDef>Customer</th>
            <td mat-cell *matCellDef="let job">
              <span class="font-medium text-white">{{ job.customer?.name }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="vehicle">
            <th mat-header-cell *matHeaderCellDef>Vehicle</th>
            <td mat-cell *matCellDef="let job" class="text-slate-300">
              @if (job.vehicle) {
                {{ job.vehicle.year }} {{ job.vehicle.make }} {{ job.vehicle.model }}
                @if (job.vehicle.registration) {
                  <span class="text-slate-500 ml-1">({{ job.vehicle.registration }})</span>
                }
              } @else {
                <span class="text-slate-500">—</span>
              }
            </td>
          </ng-container>

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let job" class="text-slate-300 max-w-xs truncate">
              {{ job.description }}
            </td>
          </ng-container>

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Received</th>
            <td mat-cell *matCellDef="let job" class="text-slate-400 text-sm">
              {{ job.date_received | date:'dd MMM yyyy' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let job">
              <button mat-icon-button [routerLink]="['/jobs', job.id]">
                <mat-icon class="text-slate-400">chevron_right</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="cols" class="border-b border-white/10"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"
              class="hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5"
              [routerLink]="['/jobs', row.id]"></tr>
        </table>

        @if (filtered().length === 0) {
          <div class="text-center py-16 text-slate-500">
            <mat-icon class="!text-4xl mb-3 block">build_circle</mat-icon>
            No jobs found
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .active-filter { border-color: #6366f1 !important; color: #818cf8 !important; }
    th.mat-header-cell { background: #13132a; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255,255,255,0.08) !important; }
    td.mat-cell { border-bottom: none !important; }
    tr.mat-row { background: transparent; }
  `],
})
export class JobsListComponent implements OnInit {
  private svc = inject(JobsService);

  jobs         = signal<Job[]>([]);
  loading      = signal(true);
  statusFilter = signal<string>('');
  statuses     = JOB_STATUSES;
  cols         = ['status', 'customer', 'vehicle', 'description', 'date', 'actions'];

  filtered = () =>
    this.statusFilter()
      ? this.jobs().filter((j) => j.status === this.statusFilter())
      : this.jobs();

  ngOnInit() {
    this.svc.getAll().subscribe({
      next:  (jobs) => { this.jobs.set(jobs); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  labelFor(status: JobStatus) {
    return JOB_STATUSES.find((s) => s.value === status)?.label ?? status;
  }
}

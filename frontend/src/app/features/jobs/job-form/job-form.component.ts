import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { JobsService } from '../../../core/services/jobs.service';
import { CustomersService } from '../../../core/services/customers.service';
import { Customer, Vehicle } from '../../../core/models/models';

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [
    RouterLink, FormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="max-w-2xl mx-auto">
      <button mat-button routerLink="/jobs" class="text-slate-400 -ml-3 mb-4">
        <mat-icon>arrow_back</mat-icon> Jobs
      </button>

      <h1 class="text-2xl font-bold text-white mb-6">New Job</h1>

      <div class="app-card space-y-5">

        <!-- Customer -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Customer</mat-label>
          <mat-select [(ngModel)]="selectedCustomerId" (ngModelChange)="onCustomerChange($event)" required>
            @for (c of customers(); track c.id) {
              <mat-option [value]="c.id">{{ c.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <!-- Vehicle -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Vehicle (optional)</mat-label>
          <mat-select [(ngModel)]="selectedVehicleId" [disabled]="!selectedCustomerId">
            <mat-option [value]="''">No vehicle</mat-option>
            @for (v of vehicles(); track v.id) {
              <mat-option [value]="v.id">
                {{ v.year }} {{ v.make }} {{ v.model }}
                @if (v.registration) { — {{ v.registration }} }
              </mat-option>
            }
          </mat-select>
        </mat-form-field>

        <!-- Description -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Description</mat-label>
          <input matInput [(ngModel)]="description" placeholder="e.g. Front bumper repair and respray" required />
        </mat-form-field>

        <!-- Notes -->
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Notes (optional)</mat-label>
          <textarea matInput rows="3" [(ngModel)]="notes"></textarea>
        </mat-form-field>

        <!-- Dates -->
        <div class="grid grid-cols-2 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Date Received</mat-label>
            <input matInput type="date" [(ngModel)]="dateReceived" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Est. Completion</mat-label>
            <input matInput type="date" [(ngModel)]="estimatedCompletion" />
          </mat-form-field>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-2">
          <button mat-stroked-button routerLink="/jobs">Cancel</button>
          <button mat-flat-button color="primary"
                  [disabled]="!selectedCustomerId || !description.trim() || saving()"
                  (click)="save()">
            @if (saving()) { <mat-spinner diameter="16" class="mr-2" /> }
            Create Job
          </button>
        </div>

      </div>
    </div>
  `,
})
export class JobFormComponent implements OnInit {
  private router      = inject(Router);
  private jobsSvc     = inject(JobsService);
  private customerSvc = inject(CustomersService);
  private snack       = inject(MatSnackBar);

  customers           = signal<Customer[]>([]);
  vehicles            = signal<Vehicle[]>([]);
  saving              = signal(false);

  selectedCustomerId  = '';
  selectedVehicleId   = '';
  description         = '';
  notes               = '';
  dateReceived        = new Date().toISOString().split('T')[0];
  estimatedCompletion = '';

  ngOnInit() {
    this.customerSvc.getAll().subscribe((c) => this.customers.set(c));
  }

  onCustomerChange(customerId: string) {
    this.selectedVehicleId = '';
    const customer = this.customers().find((c) => c.id === customerId);
    this.vehicles.set(customer?.vehicles ?? []);

    if (!customer?.vehicles?.length) {
      this.customerSvc.getOne(customerId).subscribe((c) => {
        this.vehicles.set(c.vehicles ?? []);
      });
    }
  }

  save() {
    if (!this.selectedCustomerId || !this.description.trim()) return;
    this.saving.set(true);

    this.jobsSvc.create({
      customer_id: this.selectedCustomerId,
      vehicle_id: this.selectedVehicleId || undefined,
      description: this.description.trim(),
      notes: this.notes.trim() || undefined,
      date_received: this.dateReceived || undefined,
      estimated_completion: this.estimatedCompletion || undefined,
    }).subscribe({
      next: (job) => this.router.navigate(['/jobs', job.id]),
      error: () => {
        this.saving.set(false);
        this.snack.open('Failed to create job', '', { duration: 3000 });
      },
    });
  }
}

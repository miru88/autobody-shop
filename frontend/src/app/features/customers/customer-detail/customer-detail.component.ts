import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CustomersService } from '../../../core/services/customers.service';
import { Customer, JOB_STATUSES, JobStatus, NotificationChannel } from '../../../core/models/models';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [
    RouterLink, DatePipe, TitleCasePipe,
    MatButtonModule, MatIconModule, MatTabsModule,
    MatChipsModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
  template: `
    @if (loading()) {
      <div class="flex justify-center py-20"><mat-spinner diameter="40" /></div>
    } @else if (customer()) {
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <button mat-button routerLink="/customers" class="text-slate-400 mb-4 -ml-3">
          <mat-icon>arrow_back</mat-icon> Customers
        </button>

        <div class="app-card mb-5">
          <div class="flex items-start justify-between">
            <div>
              <h1 class="text-2xl font-bold text-white">{{ customer()!.name }}</h1>
              <div class="flex gap-4 mt-2 flex-wrap">
                @if (customer()!.email) {
                  <a [href]="'mailto:' + customer()!.email"
                     class="flex items-center gap-1 text-slate-400 hover:text-indigo-400 text-sm transition-colors">
                    <mat-icon class="!text-sm">email</mat-icon>
                    {{ customer()!.email }}
                  </a>
                }
                @if (customer()!.phone) {
                  <a [href]="'tel:' + customer()!.phone"
                     class="flex items-center gap-1 text-slate-400 hover:text-indigo-400 text-sm transition-colors">
                    <mat-icon class="!text-sm">phone</mat-icon>
                    {{ customer()!.phone }}
                  </a>
                }
                @if (customer()!.address) {
                  <span class="flex items-center gap-1 text-slate-400 text-sm">
                    <mat-icon class="!text-sm">location_on</mat-icon>
                    {{ customer()!.address }}
                  </span>
                }
                <span class="flex items-center gap-1 text-slate-400 text-sm">
                  <mat-icon class="!text-sm">{{ channelIcon(customer()!.preferred_channel) }}</mat-icon>
                  {{ customer()!.preferred_channel | titlecase }}
                </span>
              </div>
            </div>
            <div class="flex gap-2">
              <button mat-stroked-button>
                <mat-icon>edit</mat-icon> Edit
              </button>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <mat-tab-group animationDuration="200ms" class="custom-tabs">
          <!-- Vehicles tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="mr-2 !text-base">directions_car</mat-icon>
              Vehicles ({{ customer()!.vehicles?.length ?? 0 }})
            </ng-template>

            <div class="pt-4 space-y-3">
              @for (v of customer()!.vehicles; track v.id) {
                <div class="app-card flex items-center justify-between">
                  <div>
                    <div class="font-medium text-white">
                      {{ v.year }} {{ v.make }} {{ v.model }}
                    </div>
                    <div class="flex gap-3 mt-1 text-sm text-slate-400">
                      @if (v.colour) { <span>{{ v.colour }}</span> }
                      @if (v.vin) { <span class="font-mono">VIN: {{ v.vin }}</span> }
                    </div>
                  </div>
                  @if (v.registration) {
                    <span class="font-mono text-sm bg-yellow-400/10 text-yellow-300 px-3 py-1 rounded border border-yellow-400/20">
                      {{ v.registration }}
                    </span>
                  }
                </div>
              }

              @if (!customer()!.vehicles?.length) {
                <div class="text-center py-12 text-slate-500">
                  <mat-icon class="!text-4xl mb-3 block">directions_car</mat-icon>
                  No vehicles on record
                </div>
              }

              <button mat-stroked-button class="mt-2">
                <mat-icon>add</mat-icon> Add Vehicle
              </button>
            </div>
          </mat-tab>

          <!-- Job history tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="mr-2 !text-base">build</mat-icon>
              Job History ({{ customer()!.jobs?.length ?? 0 }})
            </ng-template>

            <div class="pt-4 space-y-3">
              @for (job of customer()!.jobs; track job.id) {
                <a [routerLink]="['/jobs', job.id]"
                   class="app-card flex items-center justify-between hover:border-indigo-500/30
                          transition-colors cursor-pointer no-underline block">
                  <div>
                    <div class="font-medium text-white">{{ job.description }}</div>
                    @if (job.vehicle) {
                      <div class="text-slate-400 text-sm mt-1">
                        {{ job.vehicle.year }} {{ job.vehicle.make }} {{ job.vehicle.model }}
                      </div>
                    }
                    <div class="text-slate-500 text-xs mt-1">
                      {{ job.date_received | date:'dd MMM yyyy' }}
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="px-2 py-1 rounded-full text-xs font-medium status-{{ job.status }}">
                      {{ labelFor(job.status) }}
                    </span>
                    <mat-icon class="text-slate-600">chevron_right</mat-icon>
                  </div>
                </a>
              }

              @if (!customer()!.jobs?.length) {
                <div class="text-center py-12 text-slate-500">
                  <mat-icon class="!text-4xl mb-3 block">build_circle</mat-icon>
                  No jobs on record
                </div>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    }
  `,
  styles: [`
    ::ng-deep .custom-tabs .mat-mdc-tab-header { border-bottom: 1px solid rgba(255,255,255,0.1); }
  `],
})
export class CustomerDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc   = inject(CustomersService);

  customer = signal<Customer | null>(null);
  loading  = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.getOne(id).subscribe((c) => {
      this.customer.set(c);
      this.loading.set(false);
    });
  }

  labelFor(status: JobStatus) {
    return JOB_STATUSES.find((s) => s.value === status)?.label ?? status;
  }

  channelIcon(channel: NotificationChannel): string {
    const icons: Record<NotificationChannel, string> = {
      email: 'email',
      sms: 'sms',
      whatsapp: 'chat',
    };
    return icons[channel] ?? 'send';
  }
}

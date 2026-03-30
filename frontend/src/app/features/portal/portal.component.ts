import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { JobsService } from '../../core/services/jobs.service';
import { Job, JOB_STATUSES, JobStatus } from '../../core/models/models';

@Component({
  selector: 'app-portal',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, MatProgressSpinnerModule, MatIconModule, MatButtonModule],
  template: `
    <div class="min-h-screen bg-[#0f0f1a]">
      <!-- Header bar -->
      <div class="bg-[#13132a] border-b border-white/10 px-6 py-4 flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <mat-icon class="text-white !text-lg !w-5 !h-5">directions_car</mat-icon>
        </div>
        <div>
          <span class="text-white font-semibold">AutoBody Shop</span>
          <span class="text-slate-500 mx-2">·</span>
          <span class="text-slate-400 text-sm">Job Progress Portal</span>
        </div>
      </div>

      <div class="max-w-2xl mx-auto px-4 py-10">
        @if (loading()) {
          <div class="flex justify-center py-20"><mat-spinner diameter="40" /></div>
        } @else if (error()) {
          <div class="text-center py-20">
            <mat-icon class="!text-5xl text-slate-600 block mb-4">error_outline</mat-icon>
            <h2 class="text-xl font-semibold text-white mb-2">Job not found</h2>
            <p class="text-slate-400">This link may be invalid or expired.</p>
          </div>
        } @else if (job()) {
          <!-- Status banner -->
          <div class="rounded-2xl p-6 mb-6 status-banner-{{ job()!.status }}">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">
                  Current Status
                </div>
                <div class="text-2xl font-bold">{{ labelFor(job()!.status) }}</div>
              </div>
              <div class="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                <mat-icon class="!text-3xl !w-8 !h-8">{{ iconFor(job()!.status) }}</mat-icon>
              </div>
            </div>
          </div>

          <!-- Vehicle info -->
          <div class="app-card mb-5">
            <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Your Vehicle</h3>
            @if (job()!.vehicle) {
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-semibold text-white text-lg">
                    {{ job()!.vehicle!.year }} {{ job()!.vehicle!.make }} {{ job()!.vehicle!.model }}
                  </div>
                  @if (job()!.vehicle!.colour) {
                    <div class="text-slate-400 text-sm mt-1">{{ job()!.vehicle!.colour }}</div>
                  }
                </div>
                @if (job()!.vehicle!.registration) {
                  <span class="font-mono bg-yellow-400/10 text-yellow-300 border border-yellow-400/20
                               px-4 py-2 rounded-lg text-sm font-semibold tracking-widest">
                    {{ job()!.vehicle!.registration }}
                  </span>
                }
              </div>
            }
            @if (job()!.description) {
              <div class="mt-3 pt-3 border-t border-white/10">
                <span class="text-slate-400 text-sm">Work required: </span>
                <span class="text-slate-200 text-sm">{{ job()!.description }}</span>
              </div>
            }
            @if (job()!.estimated_completion) {
              <div class="mt-2">
                <span class="text-slate-400 text-sm">Est. completion: </span>
                <span class="text-slate-200 text-sm">
                  {{ job()!.estimated_completion | date:'EEEE dd MMMM yyyy' }}
                </span>
              </div>
            }
          </div>

          <!-- Progress timeline -->
          <div class="app-card mb-5">
            <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Progress</h3>
            <div class="space-y-3">
              @for (s of statuses; track s.value; let last = $last) {
                <div class="flex items-start gap-3">
                  <!-- Dot + line -->
                  <div class="flex flex-col items-center">
                    <div class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                                border-2 transition-all"
                         [class]="stepClass(s.value)">
                      @if (isCompleted(s.value) && !isCurrent(s.value)) {
                        <mat-icon class="!text-sm !w-4 !h-4">check</mat-icon>
                      } @else if (isCurrent(s.value)) {
                        <div class="w-2 h-2 rounded-full bg-current"></div>
                      }
                    </div>
                    @if (!last) {
                      <div class="w-0.5 h-6 mt-1"
                           [class]="isCompleted(s.value) ? 'bg-indigo-600' : 'bg-white/10'"></div>
                    }
                  </div>
                  <!-- Label -->
                  <div class="pt-1">
                    <div class="text-sm font-medium"
                         [class]="isCurrent(s.value) ? 'text-white' : isCompleted(s.value) ? 'text-slate-300' : 'text-slate-600'">
                      {{ s.label }}
                    </div>
                    @if (isCurrent(s.value)) {
                      <div class="text-xs text-indigo-400 mt-0.5">In progress now</div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Progress photos -->
          @if (job()!.photos && job()!.photos!.length > 0) {
            <div class="app-card mb-5">
              <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Progress Photos ({{ job()!.photos!.length }})
              </h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                @for (photo of job()!.photos; track photo.id) {
                  <div class="relative rounded-xl overflow-hidden aspect-square cursor-pointer group
                              bg-slate-800"
                       (click)="openLightbox(photo.url)">
                    <img [src]="photo.url" [alt]="photo.caption || 'Progress photo'"
                         class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    @if (photo.caption) {
                      <div class="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                        <p class="text-white text-xs truncate">{{ photo.caption }}</p>
                      </div>
                    }
                    <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100
                                transition-opacity flex items-center justify-center">
                      <mat-icon class="text-white !text-2xl">zoom_in</mat-icon>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Invoice summary -->
          @if (job()!.invoices && job()!.invoices!.length > 0) {
            <div class="app-card">
              <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Invoice</h3>
              @for (inv of job()!.invoices; track inv.id) {
                <div class="border border-white/10 rounded-xl overflow-hidden">
                  <div class="flex items-center justify-between px-4 py-3 bg-white/5">
                    <span class="font-mono text-indigo-400 font-medium">{{ inv.invoice_number }}</span>
                    <span class="px-2 py-1 rounded-full text-xs font-medium status-{{ inv.status }}">
                      {{ inv.status | titlecase }}
                    </span>
                  </div>
                  @for (item of inv.line_items; track item.id) {
                    <div class="flex justify-between items-center px-4 py-2 text-sm
                                border-t border-white/5">
                      <span class="text-slate-300">{{ item.description }}</span>
                      <span class="text-slate-400">
                        {{ item.quantity }} × {{ item.unit_price | currency:'GBP':'symbol':'1.2-2' }}
                        = {{ item.line_total | currency:'GBP':'symbol':'1.2-2' }}
                      </span>
                    </div>
                  }
                  <div class="flex justify-between items-center px-4 py-3 border-t border-white/10
                              bg-white/5 font-semibold">
                    <span class="text-slate-300">Total (inc. VAT)</span>
                    <span class="text-white text-lg">
                      {{ inv.total | currency:'GBP':'symbol':'1.2-2' }}
                    </span>
                  </div>
                </div>
              }
            </div>
          }

          <!-- Footer -->
          <div class="text-center mt-10 text-slate-600 text-sm">
            <p>Questions? Call us on <a href="tel:02012345678" class="text-slate-400">020 1234 5678</a></p>
            <p class="mt-1">or email <a href="mailto:info@autobodyshop.co.uk" class="text-slate-400">info@autobodyshop.co.uk</a></p>
          </div>
        }
      </div>

      <!-- Lightbox -->
      @if (lightboxUrl()) {
        <div class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
             (click)="lightboxUrl.set(null)">
          <button mat-icon-button class="absolute top-4 right-4 text-white">
            <mat-icon>close</mat-icon>
          </button>
          <img [src]="lightboxUrl()!" alt="Photo"
               class="max-w-full max-h-[90vh] rounded-xl object-contain"
               (click)="$event.stopPropagation()" />
        </div>
      }
    </div>
  `,
  styles: [`
    .status-banner-received      { background: linear-gradient(135deg, #1e293b, #334155); color: #94a3b8; }
    .status-banner-assessment    { background: linear-gradient(135deg, #1e3a5f, #1d4ed8); color: #bfdbfe; }
    .status-banner-in_progress   { background: linear-gradient(135deg, #064e3b, #047857); color: #a7f3d0; }
    .status-banner-paint         { background: linear-gradient(135deg, #2e1065, #6d28d9); color: #ddd6fe; }
    .status-banner-quality_check { background: linear-gradient(135deg, #431407, #c2410c); color: #fed7aa; }
    .status-banner-ready         { background: linear-gradient(135deg, #14532d, #15803d); color: #bbf7d0; }
    .status-banner-collected     { background: linear-gradient(135deg, #0f172a, #1e293b); color: #475569; }
  `],
})
export class PortalComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private jobSvc = inject(JobsService);

  job         = signal<Job | null>(null);
  loading     = signal(true);
  error       = signal(false);
  lightboxUrl = signal<string | null>(null);
  statuses    = JOB_STATUSES;
  statusOrder = JOB_STATUSES.map((s) => s.value);

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token')!;
    this.jobSvc.getByPortalToken(token).subscribe({
      next:  (job) => { this.job.set(job); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }

  labelFor(status: JobStatus) {
    return JOB_STATUSES.find((s) => s.value === status)?.label ?? status;
  }

  iconFor(status: JobStatus): string {
    const map: Record<JobStatus, string> = {
      received:      'inbox',
      assessment:    'search',
      in_progress:   'build',
      paint:         'format_paint',
      quality_check: 'fact_check',
      ready:         'check_circle',
      collected:     'directions_car',
    };
    return map[status] ?? 'circle';
  }

  isCompleted(status: JobStatus) {
    if (!this.job()) return false;
    return this.statusOrder.indexOf(status) <= this.statusOrder.indexOf(this.job()!.status);
  }

  isCurrent(status: JobStatus) {
    return this.job()?.status === status;
  }

  stepClass(status: JobStatus): string {
    if (this.isCurrent(status))   return 'border-indigo-500 text-indigo-400 bg-indigo-500/10';
    if (this.isCompleted(status)) return 'border-indigo-700 text-indigo-400 bg-indigo-900/30';
    return 'border-white/10 text-slate-700 bg-transparent';
  }

  openLightbox(url: string) {
    this.lightboxUrl.set(url);
  }
}

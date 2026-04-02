import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { JobsService } from '../../../core/services/jobs.service';
import { PhotosService } from '../../../core/services/photos.service';
import { UpdatesService } from '../../../core/services/updates.service';
import { Job, JobStatus, JOB_STATUSES, Photo, JobUpdate } from '../../../core/models/models';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [
    RouterLink, FormsModule, DatePipe,
    MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule,
    MatInputModule, MatProgressSpinnerModule, MatSnackBarModule, MatTooltipModule,
    MatChipsModule, MatDialogModule, MatTabsModule,
  ],
  template: `
    @if (loading()) {
      <div class="flex justify-center py-20"><mat-spinner diameter="40" /></div>
    } @else if (job()) {
      <div class="max-w-5xl mx-auto">
        <!-- Header -->
        <div class="flex items-start justify-between mb-6">
          <div>
            <button mat-button routerLink="/jobs" class="text-slate-400 mb-2 -ml-3">
              <mat-icon>arrow_back</mat-icon> Jobs
            </button>
            <h1 class="text-2xl font-bold text-white">{{ job()!.customer?.name }}</h1>
            <p class="text-slate-400 mt-1">{{ job()!.description }}</p>
          </div>
          <div class="flex gap-2">
            <button mat-stroked-button (click)="copyPortalLink()" matTooltip="Copy customer portal link">
              <mat-icon>link</mat-icon> Portal Link
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <!-- Left: Info + Status -->
          <div class="space-y-4">
            <!-- Vehicle card -->
            <div class="app-card">
              <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Vehicle</h3>
              @if (job()!.vehicle) {
                <div class="text-white font-medium">
                  {{ job()!.vehicle!.year }} {{ job()!.vehicle!.make }} {{ job()!.vehicle!.model }}
                </div>
                @if (job()!.vehicle!.colour) {
                  <div class="text-slate-400 text-sm mt-1">{{ job()!.vehicle!.colour }}</div>
                }
                @if (job()!.vehicle!.registration) {
                  <div class="mt-2">
                    <span class="font-mono text-sm bg-yellow-400/10 text-yellow-300 px-2 py-1 rounded border border-yellow-400/20">
                      {{ job()!.vehicle!.registration }}
                    </span>
                  </div>
                }
              } @else {
                <span class="text-slate-500 text-sm">No vehicle linked</span>
              }
            </div>

            <!-- Status card -->
            <div class="app-card">
              <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Status</h3>
              <mat-form-field appearance="outline" class="w-full">
                <mat-select [(ngModel)]="selectedStatus" (ngModelChange)="updateStatus($event)">
                  @for (s of statuses; track s.value) {
                    <mat-option [value]="s.value">{{ s.label }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <!-- Timeline -->
              <div class="mt-2 space-y-2">
                @for (s of statuses; track s.value; let i = $index) {
                  <div class="flex items-center gap-2">
                    <div class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                         [class]="isCompleted(s.value) ? 'bg-indigo-600' : 'bg-slate-700'">
                      @if (isCompleted(s.value)) {
                        <mat-icon class="!text-xs !w-3 !h-3 text-white">check</mat-icon>
                      }
                    </div>
                    <span class="text-sm" [class]="isCurrent(s.value) ? 'text-white font-medium' : 'text-slate-500'">
                      {{ s.label }}
                    </span>
                  </div>
                }
              </div>
            </div>

            <!-- Dates -->
            <div class="app-card">
              <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Dates</h3>
              <div class="text-sm space-y-2">
                <div class="flex justify-between">
                  <span class="text-slate-400">Received</span>
                  <span class="text-white">{{ job()!.date_received | date:'dd MMM yyyy' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Est. Completion</span>
                  <span class="text-white">{{ job()!.estimated_completion | date:'dd MMM yyyy' }}</span>
                </div>
              </div>
            </div>

            @if (job()!.notes) {
              <div class="app-card">
                <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Notes</h3>
                <p class="text-slate-300 text-sm">{{ job()!.notes }}</p>
              </div>
            }
          </div>

          <!-- Right: Tabs -->
          <div class="lg:col-span-2">
            <mat-tab-group animationDuration="0ms" class="app-tabs">

              <!-- Photos tab -->
              <mat-tab label="Photos">
                <div class="app-card mt-4">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-sm font-semibold text-white">
                      Progress Photos
                      <span class="text-slate-400 font-normal ml-1">({{ photos().length }})</span>
                    </h3>
                    <label class="cursor-pointer">
                      <input type="file" multiple accept="image/*" class="hidden"
                             (change)="onFileSelect($event)" />
                      <span mat-stroked-button class="mat-stroked-button mat-button-base px-3 py-1 text-sm
                            border border-white/20 rounded text-slate-300 hover:bg-white/5 cursor-pointer">
                        <mat-icon class="!text-base align-middle mr-1">upload</mat-icon>
                        Upload
                      </span>
                    </label>
                  </div>

                  <div class="border-2 border-dashed border-white/10 rounded-xl p-6 text-center mb-4
                              hover:border-indigo-500/40 transition-colors cursor-pointer"
                       (dragover)="$event.preventDefault()"
                       (drop)="onDrop($event)">
                    <mat-icon class="!text-3xl text-slate-600 block mb-2">add_photo_alternate</mat-icon>
                    <p class="text-slate-500 text-sm">Drop photos here or click Upload above</p>
                  </div>

                  @if (uploading()) {
                    <div class="flex items-center gap-3 text-slate-400 text-sm mb-4">
                      <mat-spinner diameter="16" />
                      Uploading...
                    </div>
                  }

                  @if (photos().length > 0) {
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      @for (photo of photos(); track photo.id) {
                        <div class="relative group rounded-lg overflow-hidden bg-slate-800 aspect-square">
                          <img [src]="photo.url" [alt]="photo.caption || 'Photo'"
                               class="w-full h-full object-cover" />
                          <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100
                                      transition-opacity flex flex-col justify-between p-2">
                            <div class="flex justify-end">
                              <button mat-icon-button class="!w-7 !h-7"
                                      (click)="toggleVisibility(photo)"
                                      [matTooltip]="photo.visible_to_customer ? 'Hide from customer' : 'Show to customer'">
                                <mat-icon class="!text-sm"
                                          [class]="photo.visible_to_customer ? 'text-green-400' : 'text-slate-400'">
                                  {{ photo.visible_to_customer ? 'visibility' : 'visibility_off' }}
                                </mat-icon>
                              </button>
                            </div>
                            <div>
                              @if (photo.caption) {
                                <p class="text-white text-xs truncate">{{ photo.caption }}</p>
                              }
                            </div>
                          </div>
                          @if (photo.visible_to_customer) {
                            <div class="absolute top-1 left-1 w-2 h-2 rounded-full bg-green-400"></div>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              </mat-tab>

              <!-- Updates tab -->
              <mat-tab label="Updates">
                <div class="app-card mt-4 space-y-4">

                  <!-- Compose -->
                  <div class="space-y-3">
                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Message to customer</mat-label>
                      <textarea matInput rows="3" [(ngModel)]="updateMessage"
                                placeholder="e.g. Your car is in the paint booth and looking great!">
                      </textarea>
                    </mat-form-field>

                    <!-- Visible photos picker -->
                    @if (visiblePhotos().length > 0) {
                      <div>
                        <p class="text-xs text-slate-400 mb-2">Attach photos (visible to customer)</p>
                        <div class="flex flex-wrap gap-2">
                          @for (photo of visiblePhotos(); track photo.id) {
                            <div class="relative cursor-pointer rounded overflow-hidden w-14 h-14 flex-shrink-0"
                                 (click)="togglePhotoSelection(photo.id)"
                                 [class]="selectedPhotoIds().includes(photo.id)
                                   ? 'ring-2 ring-indigo-500'
                                   : 'opacity-50'">
                              <img [src]="photo.url" class="w-full h-full object-cover" />
                              @if (selectedPhotoIds().includes(photo.id)) {
                                <div class="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                                  <mat-icon class="!text-sm text-white">check</mat-icon>
                                </div>
                              }
                            </div>
                          }
                        </div>
                      </div>
                    }

                    <div class="flex justify-end">
                      <button mat-flat-button color="primary"
                              [disabled]="!updateMessage.trim() || sendingUpdate()"
                              (click)="sendUpdate()">
                        @if (sendingUpdate()) {
                          <mat-spinner diameter="16" class="mr-2" />
                        }
                        Send Update
                      </button>
                    </div>
                  </div>

                  <!-- History -->
                  @if (updates().length > 0) {
                    <div class="border-t border-white/10 pt-4 space-y-3">
                      @for (update of updates(); track update.id) {
                        <div class="bg-slate-800/50 rounded-lg p-3">
                          <div class="flex items-center gap-2 mb-1">
                            <mat-icon class="!text-sm text-slate-400">
                              {{ channelIcon(update.channel_used) }}
                            </mat-icon>
                            <span class="text-xs text-slate-400 capitalize">{{ update.channel_used }}</span>
                            <span class="text-xs text-slate-600 ml-auto">
                              {{ update.sent_at | date:'dd MMM yyyy, HH:mm' }}
                            </span>
                          </div>
                          <p class="text-sm text-slate-200">{{ update.message }}</p>
                          @if (update.photo_ids.length > 0) {
                            <p class="text-xs text-slate-500 mt-1">
                              {{ update.photo_ids.length }} photo(s) attached
                            </p>
                          }
                        </div>
                      }
                    </div>
                  } @else {
                    <p class="text-slate-500 text-sm text-center py-4">No updates sent yet</p>
                  }

                </div>
              </mat-tab>

            </mat-tab-group>
          </div>
        </div>
      </div>
    }
  `,
})
export class JobDetailComponent implements OnInit {
  private route      = inject(ActivatedRoute);
  private jobSvc     = inject(JobsService);
  private phoSvc     = inject(PhotosService);
  private updatesSvc = inject(UpdatesService);
  private snack      = inject(MatSnackBar);

  job              = signal<Job | null>(null);
  photos           = signal<Photo[]>([]);
  updates          = signal<JobUpdate[]>([]);
  loading          = signal(true);
  uploading        = signal(false);
  sendingUpdate    = signal(false);
  selectedStatus   = signal<JobStatus>('received');
  selectedPhotoIds = signal<string[]>([]);
  updateMessage    = '';
  statuses         = JOB_STATUSES;
  statusOrder      = JOB_STATUSES.map((s) => s.value);

  visiblePhotos = () => this.photos().filter((p) => p.visible_to_customer);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.jobSvc.getOne(id).subscribe((job) => {
      this.job.set(job);
      this.selectedStatus.set(job.status);
      this.photos.set(job.photos ?? []);
      this.loading.set(false);
    });
    this.updatesSvc.getAll(id).subscribe((updates) => this.updates.set(updates));
  }

  isCompleted(status: JobStatus) {
    const cur = this.statusOrder.indexOf(this.job()!.status);
    return this.statusOrder.indexOf(status) <= cur;
  }

  isCurrent(status: JobStatus) {
    return this.job()!.status === status;
  }

  updateStatus(status: JobStatus) {
    this.jobSvc.updateStatus(this.job()!.id, status).subscribe((updated) => {
      this.job.set(updated);
      this.snack.open('Status updated', '', { duration: 2000 });
    });
  }

  copyPortalLink() {
    const url = `${window.location.origin}/portal/${this.job()!.portal_token}`;
    navigator.clipboard.writeText(url);
    this.snack.open('Portal link copied!', '', { duration: 2000 });
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.uploadFiles(Array.from(input.files));
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const files = Array.from(event.dataTransfer?.files ?? []).filter((f) =>
      f.type.startsWith('image/'),
    );
    if (files.length) this.uploadFiles(files);
  }

  uploadFiles(files: File[]) {
    this.uploading.set(true);
    this.phoSvc.upload(this.job()!.id, files).subscribe({
      next: (newPhotos) => {
        this.photos.update((p) => [...p, ...newPhotos]);
        this.uploading.set(false);
        this.snack.open(`${newPhotos.length} photo(s) uploaded`, '', { duration: 2000 });
      },
      error: () => this.uploading.set(false),
    });
  }

  toggleVisibility(photo: Photo) {
    this.phoSvc.toggleVisibility(this.job()!.id, photo.id).subscribe((updated) => {
      this.photos.update((list) =>
        list.map((p) => (p.id === updated.id ? updated : p)),
      );
    });
  }

  togglePhotoSelection(photoId: string) {
    this.selectedPhotoIds.update((ids) =>
      ids.includes(photoId) ? ids.filter((id) => id !== photoId) : [...ids, photoId],
    );
  }

  sendUpdate() {
    if (!this.updateMessage.trim()) return;
    this.sendingUpdate.set(true);
    this.updatesSvc.send(this.job()!.id, this.updateMessage, this.selectedPhotoIds()).subscribe({
      next: (update) => {
        this.updates.update((list) => [update, ...list]);
        this.updateMessage = '';
        this.selectedPhotoIds.set([]);
        this.sendingUpdate.set(false);
        this.snack.open('Update sent', '', { duration: 2000 });
      },
      error: () => {
        this.sendingUpdate.set(false);
        this.snack.open('Failed to send update', '', { duration: 3000 });
      },
    });
  }

  channelIcon(channel: string): string {
    const icons: Record<string, string> = {
      email: 'email',
      sms: 'sms',
      whatsapp: 'chat',
    };
    return icons[channel] ?? 'send';
  }
}

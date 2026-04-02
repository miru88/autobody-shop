import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CustomersService } from '../../../core/services/customers.service';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [
    RouterLink, FormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSnackBarModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="max-w-2xl mx-auto">
      <button mat-button [routerLink]="['/customers', customerId]" class="text-slate-400 -ml-3 mb-4">
        <mat-icon>arrow_back</mat-icon> Customer
      </button>

      <h1 class="text-2xl font-bold text-white mb-6">Add Vehicle</h1>

      <div class="app-card space-y-5">

        <!-- VIN lookup -->
        <div>
          <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3">
            VIN Lookup
          </p>
          <div class="flex gap-2">
            <mat-form-field appearance="outline" class="flex-1">
              <mat-label>VIN</mat-label>
              <input matInput [(ngModel)]="vin"
                     placeholder="e.g. 1HGBH41JXMN109186"
                     maxlength="17"
                     (keyup.enter)="lookupVin()" />
            </mat-form-field>
            <button mat-stroked-button
                    [disabled]="vin.length < 17 || lookingUp()"
                    (click)="lookupVin()"
                    class="h-14 mt-[2px]">
              @if (lookingUp()) {
                <mat-spinner diameter="16" />
              } @else {
                <mat-icon>search</mat-icon> Look up
              }
            </button>
          </div>
          @if (lookupError()) {
            <p class="text-red-400 text-sm -mt-2">{{ lookupError() }}</p>
          }
        </div>

        <div class="border-t border-white/10 pt-4 space-y-4">
          <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Vehicle Details
          </p>

          <div class="grid grid-cols-3 gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Year</mat-label>
              <input matInput type="number" [(ngModel)]="year" placeholder="2021" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Make</mat-label>
              <input matInput [(ngModel)]="make" placeholder="Toyota" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Model</mat-label>
              <input matInput [(ngModel)]="model" placeholder="Camry" />
            </mat-form-field>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Color (optional)</mat-label>
              <input matInput [(ngModel)]="colour" placeholder="Silver" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>License Plate (optional)</mat-label>
              <input matInput [(ngModel)]="registration" placeholder="ABC-1234" />
            </mat-form-field>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button mat-stroked-button [routerLink]="['/customers', customerId]">Cancel</button>
          <button mat-flat-button color="primary"
                  [disabled]="!make.trim() || !model.trim() || !year || saving()"
                  (click)="save()">
            @if (saving()) { <mat-spinner diameter="16" class="mr-2" /> }
            Add Vehicle
          </button>
        </div>

      </div>
    </div>
  `,
})
export class VehicleFormComponent {
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private http   = inject(HttpClient);
  private svc    = inject(CustomersService);
  private snack  = inject(MatSnackBar);

  customerId  = this.route.snapshot.paramMap.get('customerId')!;
  lookingUp   = signal(false);
  saving      = signal(false);
  lookupError = signal('');

  vin          = '';
  year         = '';
  make         = '';
  model        = '';
  colour       = '';
  registration = '';

  lookupVin() {
    if (this.vin.length < 17) return;
    this.lookingUp.set(true);
    this.lookupError.set('');

    this.http
      .get<any>(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${this.vin}?format=json`)
      .subscribe({
        next: (res) => {
          const result = res?.Results?.[0];
          if (!result || result.ErrorCode !== '0') {
            this.lookupError.set('VIN not found — please enter details manually.');
          } else {
            this.make  = result.Make  ?? '';
            this.model = result.Model ?? '';
            this.year  = result.ModelYear ?? '';
          }
          this.lookingUp.set(false);
        },
        error: () => {
          this.lookupError.set('Lookup failed — please enter details manually.');
          this.lookingUp.set(false);
        },
      });
  }

  save() {
    if (!this.make.trim() || !this.model.trim() || !this.year) return;
    this.saving.set(true);

    this.svc.addVehicle(this.customerId, {
      vin:          this.vin.trim() || undefined,
      year:         Number(this.year),
      make:         this.make.trim(),
      model:        this.model.trim(),
      colour:       this.colour.trim() || undefined,
      registration: this.registration.trim() || undefined,
    }).subscribe({
      next: () => this.router.navigate(['/customers', this.customerId]),
      error: () => {
        this.saving.set(false);
        this.snack.open('Failed to add vehicle', '', { duration: 3000 });
      },
    });
  }
}

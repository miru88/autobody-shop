import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CustomersService } from '../../../core/services/customers.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    RouterLink, FormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="max-w-2xl mx-auto">
      <button mat-button routerLink="/customers" class="text-slate-400 -ml-3 mb-4">
        <mat-icon>arrow_back</mat-icon> Customers
      </button>

      <h1 class="text-2xl font-bold text-white mb-6">New Customer</h1>

      <div class="app-card space-y-5">

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Full Name</mat-label>
          <input matInput [(ngModel)]="name" placeholder="e.g. Maria Garcia" required />
        </mat-form-field>

        <div class="grid grid-cols-2 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Email</mat-label>
            <input matInput type="email" [(ngModel)]="email" placeholder="maria@example.com" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Phone</mat-label>
            <input matInput [(ngModel)]="phone" placeholder="+44 7700 000000" />
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Address (optional)</mat-label>
          <input matInput [(ngModel)]="address" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Preferred notification channel</mat-label>
          <mat-select [(ngModel)]="preferredChannel">
            <mat-option value="email">Email</mat-option>
            <mat-option value="sms">SMS</mat-option>
            <mat-option value="whatsapp">WhatsApp</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="flex justify-end gap-3 pt-2">
          <button mat-stroked-button routerLink="/customers">Cancel</button>
          <button mat-flat-button color="primary"
                  [disabled]="!name.trim() || saving()"
                  (click)="save()">
            @if (saving()) { <mat-spinner diameter="16" class="mr-2" /> }
            Create Customer
          </button>
        </div>

      </div>
    </div>
  `,
})
export class CustomerFormComponent {
  private router = inject(Router);
  private svc    = inject(CustomersService);
  private snack  = inject(MatSnackBar);

  saving           = signal(false);
  name             = '';
  email            = '';
  phone            = '';
  address          = '';
  preferredChannel = 'email';

  save() {
    if (!this.name.trim()) return;
    this.saving.set(true);

    this.svc.create({
      name: this.name.trim(),
      email: this.email.trim() || undefined,
      phone: this.phone.trim() || undefined,
      address: this.address.trim() || undefined,
      preferred_channel: this.preferredChannel as any,
    }).subscribe({
      next: (customer) => this.router.navigate(['/customers', customer.id]),
      error: () => {
        this.saving.set(false);
        this.snack.open('Failed to create customer', '', { duration: 3000 });
      },
    });
  }
}

import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4">
      <div class="w-full max-w-sm">
        <!-- Logo -->
        <div class="text-center mb-10">
          <div class="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4">
            <mat-icon class="text-white !text-3xl !w-8 !h-8">directions_car</mat-icon>
          </div>
          <h1 class="text-2xl font-bold text-white">AutoBody Shop</h1>
          <p class="text-slate-400 text-sm mt-1">Sign in to your account</p>
        </div>

        <!-- Form -->
        <div class="app-card">
          @if (error()) {
            <div class="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm mb-4">
              {{ error() }}
            </div>
          }

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Email</mat-label>
            <input matInput type="email" [(ngModel)]="email" (keyup.enter)="login()" />
            <mat-icon matPrefix class="text-slate-400 mr-2">email</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full mt-2">
            <mat-label>Password</mat-label>
            <input matInput [type]="showPw() ? 'text' : 'password'"
                   [(ngModel)]="password" (keyup.enter)="login()" />
            <mat-icon matPrefix class="text-slate-400 mr-2">lock</mat-icon>
            <button mat-icon-button matSuffix (click)="showPw.set(!showPw())" type="button">
              <mat-icon>{{ showPw() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          <button mat-flat-button color="primary" class="w-full mt-4 h-12"
                  (click)="login()" [disabled]="loading()">
            @if (loading()) {
              <mat-spinner diameter="20" class="inline-block mr-2" />
            }
            Sign In
          </button>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router      = inject(Router);

  email    = '';
  password = '';
  loading  = signal(false);
  error    = signal('');
  showPw   = signal(false);

  login() {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');

    this.authService.login(this.email, this.password).subscribe({
      next:  () => this.router.navigate(['/']),
      error: (err) => {
        this.error.set(err?.error?.message || 'Invalid email or password');
        this.loading.set(false);
      },
    });
  }
}

import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule, MatTooltipModule,
  ],
  template: `
    <mat-sidenav-container class="h-screen">
      <!-- Sidenav -->
      <mat-sidenav mode="side" opened class="sidenav" [style.width]="'220px'">
        <!-- Logo -->
        <div class="logo-area px-5 py-6 border-b border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
              <mat-icon class="text-white text-lg !w-5 !h-5">directions_car</mat-icon>
            </div>
            <div>
              <div class="text-white font-bold text-sm leading-tight">AutoBody</div>
              <div class="text-slate-400 text-xs">Shop Manager</div>
            </div>
          </div>
        </div>

        <!-- Nav items -->
        <mat-nav-list class="pt-3">
          @for (item of navItems; track item.path) {
            <a mat-list-item
               [routerLink]="item.path"
               routerLinkActive="active-nav"
               class="nav-item mx-2 rounded-lg mb-1">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>

        <!-- User area -->
        <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-white font-medium truncate max-w-[120px]">
                {{ auth.user()?.name }}
              </div>
              <div class="text-xs text-slate-400 capitalize">{{ auth.user()?.role }}</div>
            </div>
            <button mat-icon-button (click)="auth.logout()" matTooltip="Logout">
              <mat-icon class="text-slate-400">logout</mat-icon>
            </button>
          </div>
        </div>
      </mat-sidenav>

      <!-- Main content -->
      <mat-sidenav-content class="bg-[#0f0f1a]">
        <div class="p-6 h-full overflow-auto">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    mat-sidenav-container { background: #0f0f1a; }
    .sidenav { background: #13132a; border-right: 1px solid rgba(255,255,255,0.08); }
    .nav-item { color: #94a3b8 !important; border-radius: 8px !important; }
    .nav-item:hover { background: rgba(255,255,255,0.06) !important; color: #e2e8f0 !important; }
    .active-nav { background: rgba(99,102,241,0.2) !important; color: #818cf8 !important; }
    .active-nav mat-icon { color: #818cf8 !important; }
  `],
})
export class ShellComponent {
  auth = inject(AuthService);

  navItems: NavItem[] = [
    { path: '/jobs',      icon: 'build',        label: 'Jobs'      },
    { path: '/customers', icon: 'people',        label: 'Customers' },
    { path: '/invoices',  icon: 'receipt_long',  label: 'Invoices'  },
  ];
}

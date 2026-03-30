import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { ApiService } from './api.service';
import { User, AuthResponse } from '../models/models';

const TOKEN_KEY = 'autobody_token';
const USER_KEY  = 'autobody_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _token  = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private _user   = signal<User | null>(this.loadUser());

  readonly token      = this._token.asReadonly();
  readonly user       = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());
  readonly isOwner    = computed(() => this._user()?.role === 'owner');

  constructor(private api: ApiService, private router: Router) {}

  login(email: string, password: string) {
    return this.api.post<AuthResponse>('auth/login', { email, password }).pipe(
      tap((res) => this.setSession(res)),
    );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  getToken() {
    return this._token();
  }

  private setSession(res: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, res.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this._token.set(res.access_token);
    this._user.set(res.user);
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}

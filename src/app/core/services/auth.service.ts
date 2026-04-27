import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  cin: string;
  motDePasse: string;
}

export interface LoginResponse {
  token: string;
  role: 'CLIENT' | 'AGENT';
  email: string;
  nom: string;
  prenom: string;
}

export interface CurrentUser {
  token: string;
  role: 'CLIENT' | 'AGENT';
  email: string;
  nom: string;
  prenom: string;
}

const TOKEN_KEY = 'bankify_token';
const USER_KEY  = 'bankify_user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly loginUrl = `${environment.apiUrl}/auth/login`;

  constructor(private http: HttpClient) {}

  // ── Auth API ────────────────────────────────────────────────────────────────

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginUrl, credentials).pipe(
      tap(response => this.storeSession(response))
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // ── Session helpers ─────────────────────────────────────────────────────────

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getCurrentUser(): CurrentUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CurrentUser;
    } catch {
      return null;
    }
  }

  getRole(): 'CLIENT' | 'AGENT' | null {
    return this.getCurrentUser()?.role ?? null;
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  private storeSession(response: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response));
  }
}
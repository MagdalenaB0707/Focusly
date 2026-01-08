import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthResponseData, AuthSession } from './auth.types';

const LS_KEY = 'focusly_auth_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private sessionSubject = new BehaviorSubject<AuthSession | null>(this.load());
  session$ = this.sessionSubject.asObservable();

  constructor(private http: HttpClient) {}

  get uid(): string | null {
    return this.sessionSubject.value?.uid ?? null;
  }

  get token(): string | null {
    const s = this.sessionSubject.value;
    if (!s) return null;
    if (Date.now() >= s.expiresAt) return null;
    return s.idToken;
  }

  get isAuthenticated(): boolean {
    return !!this.token;
  }

  register(email: string, password: string): Observable<AuthSession> {
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseApiKey}`,
        { email, password, returnSecureToken: true }
      )
      .pipe(
        map((res) => this.toSession(res)),
        tap((s) => this.save(s))
      );
  }

  login(email: string, password: string): Observable<AuthSession> {
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseApiKey}`,
        { email, password, returnSecureToken: true }
      )
      .pipe(
        map((res) => this.toSession(res)),
        tap((s) => this.save(s))
      );
  }

  logout() {
    localStorage.removeItem(LS_KEY);
    this.sessionSubject.next(null);
  }

  autoLogin() {
    const s = this.load();
    if (!s) return;
    if (Date.now() >= s.expiresAt) {
      this.logout();
      return;
    }
    this.sessionSubject.next(s);
  }

  private toSession(res: AuthResponseData): AuthSession {
    const expiresInSec = Number(res.expiresIn ?? '3600');
    return {
      idToken: res.idToken,
      refreshToken: res.refreshToken,
      email: res.email,
      uid: res.localId,
      expiresAt: Date.now() + expiresInSec * 1000,
    };
  }

  private save(s: AuthSession) {
    localStorage.setItem(LS_KEY, JSON.stringify(s));
    this.sessionSubject.next(s);
  }

  private load(): AuthSession | null {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  }
}

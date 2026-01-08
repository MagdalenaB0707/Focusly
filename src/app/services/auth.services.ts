import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type CurrentUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

const LS_KEY = 'focusly_current_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSubject = new BehaviorSubject<CurrentUser | null>(
    this.loadFromStorage()
  );

  currentUser$ = this.currentUserSubject.asObservable();

  get currentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  // privremeno: "fake login" (da menu radi)
  setDemoUser() {
    const demo: CurrentUser = {
      id: 'demo',
      firstName: 'Magdalena',
      lastName: 'Budimir',
      email: 'demo@focusly.app',
    };
    this.setCurrentUser(demo);
  }

  logout() {
    localStorage.removeItem(LS_KEY);
    this.currentUserSubject.next(null);
  }

  setCurrentUser(user: CurrentUser) {
    localStorage.setItem(LS_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private loadFromStorage(): CurrentUser | null {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CurrentUser;
    } catch {
      return null;
    }
  }
}

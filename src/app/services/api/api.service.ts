import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { FIREBASE_DB_URL } from './firebase-paths';
import { AuthService } from '../auth/auth.services'; 

type FirebaseDict<T> = Record<string, T>;

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  private url(path: string): string {
    const token = this.auth.token; // null ako nije ulogovan ili istekao
    const base = `${FIREBASE_DB_URL}/${path}.json`;
    return token ? `${base}?auth=${encodeURIComponent(token)}` : base;
  }

  getList<T>(path: string): Observable<(T & { id: string })[]> {
    return this.http.get<FirebaseDict<T> | null>(this.url(path)).pipe(
      map((res) => {
        if (!res) return [];
        return Object.entries(res).map(([id, value]) => ({
          ...(value as T),
          id,
        }));
      })
    );
  }

  create<T>(path: string, data: T): Observable<{ name: string }> {
    return this.http.post<{ name: string }>(this.url(path), data);
  }

  update<T>(path: string, id: string, patch: Partial<T>): Observable<void> {
    return this.http.patch<void>(this.url(`${path}/${id}`), patch);
  }

  remove(path: string, id: string): Observable<void> {
    return this.http.delete<void>(this.url(`${path}/${id}`));
  }

  getOne<T>(path: string): Observable<T | null> {
    return this.http.get<T | null>(this.url(path));
  }

  set<T>(path: string, data: T): Observable<T> {
    return this.http.put<T>(this.url(path), data);
  }
}

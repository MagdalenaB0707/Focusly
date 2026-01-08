import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { FIREBASE_DB_URL } from './firebase-paths';

type FirebaseDict<T> = Record<string, T>;

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  getList<T>(path: string): Observable<(T & { id: string })[]> {
    return this.http
      .get<FirebaseDict<T> | null>(`${FIREBASE_DB_URL}/${path}.json`)
      .pipe(
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
    return this.http.post<{ name: string }>(
      `${FIREBASE_DB_URL}/${path}.json`,
      data
    );
  }

  update<T>(path: string, id: string, patch: Partial<T>): Observable<void> {
    return this.http.patch<void>(
      `${FIREBASE_DB_URL}/${path}/${id}.json`,
      patch
    );
  }

  remove(path: string, id: string): Observable<void> {
    return this.http.delete<void>(`${FIREBASE_DB_URL}/${path}/${id}.json`);
  }

  getOne<T>(path: string): Observable<T | null> {
    return this.http.get<T | null>(`${FIREBASE_DB_URL}/${path}.json`);
  }

  
  set<T>(path: string, data: T): Observable<T> {
    return this.http.put<T>(`${FIREBASE_DB_URL}/${path}.json`, data);
  }
}

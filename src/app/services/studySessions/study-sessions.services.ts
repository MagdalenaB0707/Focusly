import { Injectable } from '@angular/core';
import { Observable, map, throwError } from 'rxjs';
import { ApiService } from '../api/api.service';
import { paths } from '../api/firebase-paths';
import { StudySession } from '../../models/study-session.model';
import { AuthService } from '../auth.services'; // prilagodi putanju ako je drugačije

export type StudySessionDTO = Omit<StudySession, 'id'>;
@Injectable({ providedIn: 'root' })
export class StudySessionsService {
  constructor(private api: ApiService, private auth: AuthService) {}

  // users/{userId}/studySessions
  private get userSessionsPath(): string {
    const userId = this.auth.currentUser?.id;
    if (!userId) {
      throw new Error('No logged in user. Cannot load study sessions.');
    }
    return `${paths.users}/${userId}/studySessions`;
  }


  getAll(): Observable<StudySession[]> {
    return this.api.getList<StudySessionDTO>(this.userSessionsPath);
  }


  getByCourse(courseId: string): Observable<StudySession[]> {
    return this.getAll().pipe(
      map((rows) => rows.filter((s) => s.courseId === courseId))
    );
  }


  create(data: StudySessionDTO): Observable<StudySession> {
    return this.api.create<StudySessionDTO>(this.userSessionsPath, data).pipe(
      map((res) => ({ ...data, id: res.name }))
    );
  }


  update(id: string, patch: Partial<StudySessionDTO>): Observable<void> {
    return this.api.update<StudySessionDTO>(this.userSessionsPath, id, patch);
  }


  remove(id: string): Observable<void> {
    return this.api.remove(this.userSessionsPath, id);
  }
}

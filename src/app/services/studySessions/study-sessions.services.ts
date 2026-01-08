import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../api/api.service';
import { paths } from '../api/firebase-paths';
import {
  StudySession,
  StudySessionDTO,
} from '../../models/study-session.model';
import { AuthService } from '../auth.services';

@Injectable({ providedIn: 'root' })
export class StudySessionsService {
  constructor(private api: ApiService, private auth: AuthService) {}

  private get userId(): string {
    const id = this.auth.currentUser?.id;
    if (!id) throw new Error('No logged in user.');
    return id;
  }

  // ✅ READ: sve sessions, pa filter na klijentu po userId
  getAll(): Observable<StudySession[]> {
    return this.api
      .getList<StudySessionDTO>(paths.studySessions)
      .pipe(map((rows) => rows.filter((s) => s.userId === this.userId)));
  }

  getByCourse(courseId: string): Observable<StudySession[]> {
    return this.getAll().pipe(
      map((rows) => rows.filter((s) => s.courseId === courseId))
    );
  }

  // ✅ CREATE: upis u /sessions i dodaj userId automatski
  create(data: Omit<StudySessionDTO, 'userId'>): Observable<StudySession> {
    const dto: StudySessionDTO = { ...data, userId: this.userId };

    return this.api
      .create<StudySessionDTO>(paths.studySessions, dto)
      .pipe(map((res) => ({ ...dto, id: res.name })));
  }

  // ✅ UPDATE: patch na /sessions/{id}
  update(id: string, patch: Partial<StudySessionDTO>): Observable<void> {
    return this.api.update<StudySessionDTO>(paths.studySessions, id, patch);
  }

  // ✅ DELETE: delete /sessions/{id}
  remove(id: string): Observable<void> {
    return this.api.remove(paths.studySessions, id);
  }
}

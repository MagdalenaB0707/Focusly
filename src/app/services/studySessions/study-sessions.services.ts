import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../api/api.service';
import { paths } from '../api/firebase-paths';
import { StudySession, StudySessionDTO } from '../../models/study-session.model';
import { AuthService } from '../auth/auth.services';

@Injectable({ providedIn: 'root' })
export class StudySessionsService {
  constructor(private api: ApiService, private auth: AuthService) {}

  private get userId(): string {
    const id = this.auth.uid;
    if (!id) throw new Error('No logged in user.');
    return id;
  }

  getAll(): Observable<StudySession[]> {
    return this.api.getList<any>(paths.studySessions).pipe(
      map((rows) =>
        rows
          .filter((s: any) => s.userId === this.userId)
          .map((s: any) => {
            // backward compatibility: ako nema targetType/targetId, pretvori iz courseId
            if (!s.targetType || !s.targetId) {
              if (s.courseId) {
                return {
                  ...s,
                  targetType: 'course',
                  targetId: s.courseId,
                } as StudySession;
              }
            }
            return s as StudySession;
          })
      )
    );
  }

  getByTarget(targetType: 'course' | 'activity', targetId: string): Observable<StudySession[]> {
    return this.getAll().pipe(
      map((rows) => rows.filter((s) => s.targetType === targetType && s.targetId === targetId))
    );
  }

  create(data: Omit<StudySessionDTO, 'userId'>): Observable<StudySession> {
    const dto: StudySessionDTO = { ...data, userId: this.userId };

    return this.api
      .create<StudySessionDTO>(paths.studySessions, dto)
      .pipe(map((res) => ({ ...dto, id: res.name })));
  }

  update(id: string, patch: Partial<StudySessionDTO>): Observable<void> {
    return this.api.update<StudySessionDTO>(paths.studySessions, id, patch);
  }

  remove(id: string): Observable<void> {
    return this.api.remove(paths.studySessions, id);
  }
}

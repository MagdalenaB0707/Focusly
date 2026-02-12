import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../api/api.service';
import { paths } from '../api/firebase-paths';
import { Course, CourseDTO } from 'src/app/models/course.model';
import { AuthService } from '../auth/auth.services';
import { StudySessionsService } from '../studySessions/study-sessions.services';
import { GoalsService } from '../goals/goals.services';
import { forkJoin, switchMap, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CoursesService {
  constructor(
    private api: ApiService,
    private auth: AuthService,
    private sessionsService: StudySessionsService,
    private goalsService: GoalsService,
  ) {}

  private get userId(): string {
    const id = this.auth.uid;
    if (!id) throw new Error('No logged in user.');
    return id;
  }

  getAll(): Observable<Course[]> {
    return this.api.getFilteredList<CourseDTO>(
      paths.courses,
      'userId',
      this.userId,
    );
  }

  create(data: Omit<CourseDTO, 'userId' | 'createdAt'>): Observable<Course> {
    const dto: CourseDTO = {
      ...data,
      userId: this.userId,
      createdAt: Date.now(),
    };

    return this.api
      .create<CourseDTO>(paths.courses, dto)
      .pipe(map((res) => ({ ...dto, id: res.name }) as Course));
  }

  update(id: string, patch: Partial<CourseDTO>): Observable<void> {
    return this.api.update<CourseDTO>(paths.courses, id, patch);
  }

  remove(id: string): Observable<void> {
    const sessions$ = this.sessionsService.getByTarget('course', id);
    const goals$ = this.goalsService.getByTarget('course', id);

    return forkJoin([sessions$, goals$]).pipe(
      switchMap(([sessions, goals]) => {
        const deleteRequests: Observable<any>[] = [
          this.api.remove(paths.courses, id), 
        ];

        sessions.forEach((s) =>
          deleteRequests.push(this.sessionsService.remove(s.id)),
        );
        goals.forEach((g) =>
          deleteRequests.push(this.goalsService.remove(g.id)),
        );

        return forkJoin(deleteRequests);
      }),
      map(() => void 0),
    );
  }
}

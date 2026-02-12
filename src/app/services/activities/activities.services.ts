import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { AuthService } from '../auth/auth.services';
import { Activity, ActivityDTO } from 'src/app/models/activity.model';
import { paths } from '../api/firebase-paths';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { StudySessionsService } from '../studySessions/study-sessions.services';
import { GoalsService } from '../goals/goals.services';
import { forkJoin, switchMap, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ActivitiesService {
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
  getAll(): Observable<Activity[]> {
    return this.api.getFilteredList<ActivityDTO>(
      paths.activities,
      'userId',
      this.userId,
    );
  }

  create(data: Omit<ActivityDTO, 'userId'>): Observable<Activity> {
    const dto: ActivityDTO = { ...data, userId: this.userId };

    return this.api
      .create<ActivityDTO>(paths.activities, dto)
      .pipe(map((res) => ({ ...dto, id: res.name })));
  }

  update(id: string, patch: Partial<ActivityDTO>): Observable<void> {
    return this.api.update<ActivityDTO>(paths.activities, id, patch);
  }

  remove(id: string): Observable<void> {
    return forkJoin([
      this.sessionsService.getByTarget('activity', id),
      this.goalsService.getByTarget('activity', id),
    ]).pipe(
      switchMap(([sessions, goals]) => {
        const deleteRequests: Observable<any>[] = [
          this.api.remove(paths.activities, id),
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

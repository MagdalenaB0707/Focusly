import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { AuthService } from '../auth/auth.services';
import { Activity, ActivityDTO } from 'src/app/models/activity.model';
import { paths } from '../api/firebase-paths';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { StudySessionDTO } from 'src/app/models/study-session.model';

@Injectable({ providedIn: 'root' })
export class ActivitiesService {
  constructor(private api: ApiService, private auth: AuthService) {}

  private get userId(): string {
    const id = this.auth.uid;
    if (!id) throw new Error('No logged in user.');
    return id;
  }
  getAll(): Observable<Activity[]> {
    return this.api
      .getList<ActivityDTO>(paths.activities)
      .pipe(map((rows) => rows.filter((a) => a.userId === this.userId)));
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
    return this.api.remove(paths.activities, id);
  }
}

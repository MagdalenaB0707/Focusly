import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiService } from '../api/api.service';
import { AuthService } from '../auth/auth.services';
import { paths } from '../api/firebase-paths';

import { Goal, GoalDTO } from 'src/app/models/goal.model';
import { key } from 'ionicons/icons';

@Injectable({ providedIn: 'root' })
export class GoalsService {
  constructor(
    private api: ApiService,
    private auth: AuthService,
  ) {}

  private get userId(): string {
    const id = this.auth.uid;
    if (!id) throw new Error('No logged in user.');
    return id;
  }

getByTarget(targetType: 'course' | 'activity', targetId: string): Observable<Goal[]> {
  return this.getAll().pipe(
    map(rows => rows.filter(g => (g as any).targetType === targetType && (g as any).targetId === targetId))
  );
}

  getAll(): Observable<Goal[]> {
    return this.api.getFilteredList<GoalDTO>(
      paths.goals,
      'userId',
      this.userId,
    );
  }

  create(data: Omit<GoalDTO, 'userId'>): Observable<Goal> {
    const dto: GoalDTO = {
      ...data,
      userId: this.userId,
    };

    return this.api
      .create<GoalDTO>(paths.goals, dto)
      .pipe(map((res) => ({ ...dto, id: res.name }) as Goal));
  }

  update(id: string, patch: Partial<GoalDTO>): Observable<void> {
    return this.api.update<GoalDTO>(paths.goals, id, patch);
  }

  remove(id: string): Observable<void> {
    return this.api.remove(paths.goals, id);
  }
}

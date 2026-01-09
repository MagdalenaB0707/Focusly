import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../api/api.service';
import { paths } from '../api/firebase-paths';
import { Course, CourseDTO } from 'src/app/models/course.model';
import { AuthService } from '../auth/auth.services';

@Injectable({ providedIn: 'root' })
export class CoursesService {
  constructor(private api: ApiService, private auth: AuthService) {}

  private get userId(): string {
    const id = this.auth.uid;
    if (!id) throw new Error('No logged in user.');
    return id;
  }

  getAll(): Observable<Course[]> {
    return this.api.getList<CourseDTO>(paths.courses).pipe(
      map(rows => rows.filter(c => c.userId === this.userId))
    );
  }

  create(data: Omit<CourseDTO, 'userId' | 'createdAt'>): Observable<Course> {
    const dto: CourseDTO = {
      ...data,
      userId: this.userId,
      createdAt: Date.now(),
    };

    return this.api.create<CourseDTO>(paths.courses, dto).pipe(
      map(res => ({ ...dto, id: res.name } as Course))
    );
  }

  update(id: string, patch: Partial<CourseDTO>): Observable<void> {
    return this.api.update<CourseDTO>(paths.courses, id, patch);
  }

  remove(id: string): Observable<void> {
    return this.api.remove(paths.courses, id);
  }
}

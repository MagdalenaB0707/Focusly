import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { paths } from '../api/firebase-paths';
import { Course } from '../../models/course.model';

export type CourseDTO = Omit<Course, 'id'>;

@Injectable({ providedIn: 'root' })
export class CoursesService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Course[]> {
    return this.api.getList<CourseDTO>(paths.courses);
  }
}

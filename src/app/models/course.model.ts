export interface Course {
  id: string;
  title: string;
  description?: string;
  estimatedTime?: number;
}
export type CourseDTO = Omit<Course, 'id'>;
export interface Course {
  id: string;
  userId: string;
  title: string;
  description?: string;
  estimatedTime?: number;
  createdAt: number;
}

export type CourseDTO = Omit<Course, 'id'>;

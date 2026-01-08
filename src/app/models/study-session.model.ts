export interface StudySession {
  id: string;
  userId: string;
  courseId: string;
  startedAt: number;
  durationMinutes: number;
  notes?: string;

}
export type StudySessionDTO = Omit<StudySession, 'id'>;

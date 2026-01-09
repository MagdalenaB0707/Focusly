export type SessionTargetType = 'course' | 'activity';

export interface StudySession {
  id: string;
  userId: string;

  targetType: SessionTargetType; // course | activity
  targetId: string;              // id kursa ili aktivnosti

  startedAt: number;
  durationMinutes: number;
  notes?: string;
}
export type StudySessionDTO = Omit<StudySession, 'id'>;

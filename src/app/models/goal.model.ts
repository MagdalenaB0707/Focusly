export type GoalPeriod = 'daily' | 'weekly' | 'monthly';
export type GoalTargetType = 'activity' | 'course';

export interface Goal {
  id: string;
  userId: string;

  targetType: GoalTargetType; // 'activity' | 'course'
  targetId: string;           // id aktivnosti ili kursa

  targetMinutes: number;
  period: GoalPeriod;
  createdAt: number;
}

export type GoalDTO = Omit<Goal, 'id'>;

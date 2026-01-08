export type GoalPeriod = "daily" | "weekly" | "monthly";

export interface Goal {
  id: string;
  userId: string;
  activityId: string;
  targetMinutes: number;  
  period: GoalPeriod;      
  createdAt: number;
}
export type GoalDTO = Omit<Goal, 'id'>;

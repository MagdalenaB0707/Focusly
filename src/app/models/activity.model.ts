export interface Activity {
  id: string;
  userId: string;
  title: string;
  description?: string; // optional
  createdAt: number;
}
export type ActivityDTO = Omit<Activity, 'id'>;

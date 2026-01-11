import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButtons,
  IonMenuButton,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonBadge,
} from '@ionic/angular/standalone';
import { Subject, takeUntil } from 'rxjs';

import { StudySession } from 'src/app/models/study-session.model';
import { Goal } from 'src/app/models/goal.model';
import { Course } from 'src/app/models/course.model';
import { Activity } from 'src/app/models/activity.model';
import { StudySessionsService } from 'src/app/services/studySessions/study-sessions.services';
import { GoalsService } from 'src/app/services/goals/goals.services';
import { ActivitiesService } from 'src/app/services/activities/activities.services';
import { CoursesService } from 'src/app/services/courses/courses.service';

type DayStat = {
  key: string; // YYYY-MM-DD
  label: string; // Mon / Tue...
  minutes: number;
  hitGoal: boolean;
};
type BreakdownRow = {
  id: string; // activityId
  label: string; // za sad activityId (kasnije title)
  minutes: number;
  pct: number;
};

@Component({
  selector: 'app-home-page',
  templateUrl: './home.page.html',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonBadge,
  ],
})
export class HomePage implements OnInit, OnDestroy {
  loading = false;
  errorMsg: string | null = null;

  sessions: StudySession[] = [];
  goals: Goal[] = [];
  courses: Course[] = [];
  activities: Activity[] = [];

  activeGoal: Goal | null = null;
  activeGoalTitle = '';
  activityBreakdown: BreakdownRow[] = [];
  activeGoalProgress = { done: 0, target: 0, pct: 0, remaining: 0 };

  courseBreakdown: BreakdownRow[] = [];

  sessionsCountInActivePeriod = 0;
  minutesInActivePeriod = 0;

  minutesToday = 0;
  minutesWeek = 0;
  minutesMonth = 0;

  dailyGoalMinutes = 0;

  last7Days: DayStat[] = [];
  streakDays = 0;

  sharePriceDiff = 0;

  medals = { bronze: 0, silver: 0, gold: 0 };

  private destroy$ = new Subject<void>();

  constructor(
    private sessionsService: StudySessionsService,
    private goalsService: GoalsService,
    private coursesService: CoursesService,
    private activitiesService: ActivitiesService
  ) {}

  ngOnInit() {
    this.loadAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private loadAll() {
    this.loading = true;
    this.errorMsg = null;

    this.coursesService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (courses) => {
          this.courses = courses;

          this.activitiesService
            .getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (activities) => {
                this.activities = activities;

                this.goalsService
                  .getAll()
                  .pipe(takeUntil(this.destroy$))
                  .subscribe({
                    next: (goals) => {
                      this.goals = goals;
                      this.dailyGoalMinutes = this.pickDailyGoalMinutes(goals);

                      this.sessionsService
                        .getAll()
                        .pipe(takeUntil(this.destroy$))
                        .subscribe({
                          next: (sessions) => {
                            this.sessions = sessions;
                            this.recompute();
                            this.loading = false;
                          },
                          error: (e) => {
                            console.error(e);
                            this.errorMsg = 'Failed to load sessions.';
                            this.loading = false;
                          },
                        });
                    },
                    error: (e) => {
                      console.error(e);
                      this.errorMsg = 'Failed to load goals.';
                      this.loading = false;
                    },
                  });
              },
              error: (e) => {
                console.error(e);
                this.errorMsg = 'Failed to load activities.';
                this.loading = false;
              },
            });
        },
        error: (e) => {
          console.error(e);
          this.errorMsg = 'Failed to load courses.';
          this.loading = false;
        },
      });
  }

  trackByBreakdownId(_: number, r: BreakdownRow) {
    return r.id;
  }

  private recompute() {
    const now = new Date();

    const dayRange = this.rangeToday(now);
    const weekRange = this.rangeThisWeek(now);
    const monthRange = this.rangeThisMonth(now);

    this.minutesToday = this.sumMinutesInRange(dayRange.from, dayRange.to);
    this.minutesWeek = this.sumMinutesInRange(weekRange.from, weekRange.to);
    this.minutesMonth = this.sumMinutesInRange(monthRange.from, monthRange.to);

    this.last7Days = this.buildLast7Days(now);
    this.streakDays = this.computeStreakDays(this.last7Days);

    this.sharePriceDiff = this.computeSharePriceDiff(
      this.last7Days,
      this.dailyGoalMinutes
    );

    this.medals = this.computeMedals(); // across all days in DB (simple)
    this.pickActiveGoal();
    this.computeActiveGoalWidget();
    this.computeActivityBreakdown();
    this.computeCourseBreakdown();
  }

  private computeActivityBreakdown() {
    const { from, to } = this.getPeriodRange('weekly');

    const rows = this.sessions
      .filter((s) => s.startedAt >= from && s.startedAt < to)
      .filter((s) => s.targetType === 'activity');

    const byId = new Map<string, number>();
    for (const s of rows) {
      const id = s.targetId;
      const minutes = s.durationMinutes || 0;
      byId.set(id, (byId.get(id) ?? 0) + minutes);
    }

    const total = Array.from(byId.values()).reduce((sum, m) => sum + m, 0);

    const result: BreakdownRow[] = Array.from(byId.entries())
      .map(([id, minutes]) => ({
        id,
        label: this.labelForTarget('activity', id),
        minutes,
        pct: total > 0 ? Math.round((minutes / total) * 100) : 0,
      }))
      .sort((a, b) => b.minutes - a.minutes);

    this.activityBreakdown = result;
  }

  labelForTarget(targetType: 'course' | 'activity', targetId: string): string {
    if (targetType === 'course') {
      return this.courses.find((c) => c.id === targetId)?.title ?? '(Course)';
    }

    return (
      this.activities.find((a) => a.id === targetId)?.title ?? '(Activity)'
    );
  }
  private computeCourseBreakdown() {
    const { from, to } = this.getPeriodRange('weekly');

    const rows = this.sessions
      .filter((s) => s.startedAt >= from && s.startedAt < to)
      .filter((s) => s.targetType === 'course');

    const byId = new Map<string, number>();
    for (const s of rows) {
      const id = s.targetId;
      const minutes = s.durationMinutes || 0;
      byId.set(id, (byId.get(id) ?? 0) + minutes);
    }

    const total = Array.from(byId.values()).reduce((sum, m) => sum + m, 0);

    const result: BreakdownRow[] = Array.from(byId.entries())
      .map(([id, minutes]) => ({
        id,
        label: this.labelForTarget('course', id), // ✅ OVDE title umesto id
        minutes,
        pct: total > 0 ? Math.round((minutes / total) * 100) : 0,
      }))
      .sort((a, b) => b.minutes - a.minutes);

    this.courseBreakdown = result;
  }

  private pickActiveGoal() {
    // Najjednostavnije: uzmi najnoviji goal (po createdAt)
    if (!this.goals || this.goals.length === 0) {
      this.activeGoal = null;
      this.activeGoalTitle = '';
      return;
    }

    const sorted = [...this.goals].sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
    );
    this.activeGoal = sorted[0];

    this.activeGoalTitle =
      `${this.activeGoal.targetType}: ` +
      this.labelForTarget(this.activeGoal.targetType, this.activeGoal.targetId);
  }

  private computeActiveGoalWidget() {
    if (!this.activeGoal) {
      this.activeGoalProgress = { done: 0, target: 0, pct: 0, remaining: 0 };
      this.sessionsCountInActivePeriod = 0;
      this.minutesInActivePeriod = 0;
      return;
    }

    const { from, to } = this.getPeriodRange(this.activeGoal.period);

    const sessionsInPeriod = this.sessions.filter(
      (s) =>
        s.startedAt >= from &&
        s.startedAt < to &&
        s.targetType === this.activeGoal!.targetType &&
        s.targetId === this.activeGoal!.targetId
    );

    const done = sessionsInPeriod.reduce(
      (sum, s) => sum + (s.durationMinutes || 0),
      0
    );
    const target = this.activeGoal.targetMinutes || 0;
    const pct =
      target > 0 ? Math.min(100, Math.round((done / target) * 100)) : 0;
    const remaining = Math.max(0, target - done);

    this.activeGoalProgress = { done, target, pct, remaining };

    // dodatni summary
    this.sessionsCountInActivePeriod = sessionsInPeriod.length;
    this.minutesInActivePeriod = done;
  }

  // isti helper kao u GoalsPage (kopiramo na dashboard)
  private getPeriodRange(period: 'daily' | 'weekly' | 'monthly'): {
    from: number;
    to: number;
  } {
    const now = new Date();

    if (period === 'daily') {
      const from = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0
      ).getTime();
      const to = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0,
        0
      ).getTime();
      return { from, to };
    }

    if (period === 'weekly') {
      const day = now.getDay(); // 0=Sun
      const diffToMonday = (day + 6) % 7;
      const monday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - diffToMonday,
        0,
        0,
        0,
        0
      );
      const from = monday.getTime();
      const to = new Date(
        monday.getFullYear(),
        monday.getMonth(),
        monday.getDate() + 7,
        0,
        0,
        0,
        0
      ).getTime();
      return { from, to };
    }

    // monthly
    const from = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0
    ).getTime();
    const to = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
      0,
      0,
      0,
      0
    ).getTime();
    return { from, to };
  }

  // ---------- Calculations ----------

  private sumMinutesInRange(from: number, to: number): number {
    return this.sessions
      .filter((s) => s.startedAt >= from && s.startedAt < to)
      .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  }

  private pickDailyGoalMinutes(goals: Goal[]): number {
    // najjednostavnije: uzmi najveći daily goal kao "daily target"
    const daily = goals.filter((g) => g.period === 'daily');
    if (daily.length === 0) return 0;
    return Math.max(...daily.map((g) => g.targetMinutes || 0));
  }

  private buildLast7Days(now: Date): DayStat[] {
    const days: DayStat[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = this.toDateKey(d);
      const { from, to } = this.rangeDay(d);

      const minutes = this.sumMinutesInRange(from, to);
      const hitGoal =
        this.dailyGoalMinutes > 0
          ? minutes >= this.dailyGoalMinutes
          : minutes > 0;

      days.push({
        key,
        label: d.toLocaleDateString(undefined, { weekday: 'short' }),
        minutes,
        hitGoal,
      });
    }

    return days;
  }

  private computeStreakDays(last7: DayStat[]): number {
    // streak: koliko uzastopnih dana unazad (od danas) ima "studied > 0"
    let streak = 0;
    for (let i = last7.length - 1; i >= 0; i--) {
      if (last7[i].minutes > 0) streak++;
      else break;
    }
    return streak;
  }

  private computeSharePriceDiff(last7: DayStat[], dailyGoal: number): number {
    if (!dailyGoal) return 0;
    return last7.reduce((sum, d) => sum + (d.minutes - dailyGoal), 0);
  }

  private computeMedals(): { bronze: number; silver: number; gold: number } {
    // medal per day based on total minutes that day (across all targets)
    const byDay = new Map<string, number>();

    for (const s of this.sessions) {
      const key = this.toDateKey(new Date(s.startedAt));
      byDay.set(key, (byDay.get(key) || 0) + (s.durationMinutes || 0));
    }

    let bronze = 0,
      silver = 0,
      gold = 0;

    for (const minutes of byDay.values()) {
      if (minutes >= 240) gold++;
      else if (minutes >= 180) silver++;
      else if (minutes >= 120) bronze++;
    }

    return { bronze, silver, gold };
  }

  // ---------- Date helpers ----------

  private rangeDay(d: Date): { from: number; to: number } {
    const from = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      0,
      0,
      0,
      0
    ).getTime();
    const to = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate() + 1,
      0,
      0,
      0,
      0
    ).getTime();
    return { from, to };
  }

  private rangeToday(now: Date) {
    return this.rangeDay(now);
  }

  private rangeThisWeek(now: Date): { from: number; to: number } {
    // Monday start
    const day = now.getDay(); // 0=Sun
    const diffToMonday = (day + 6) % 7;
    const monday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - diffToMonday
    );
    const from = new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate(),
      0,
      0,
      0,
      0
    ).getTime();
    const to = new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate() + 7,
      0,
      0,
      0,
      0
    ).getTime();
    return { from, to };
  }

  private rangeThisMonth(now: Date): { from: number; to: number } {
    const from = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0
    ).getTime();
    const to = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
      0,
      0,
      0,
      0
    ).getTime();
    return { from, to };
  }

  private toDateKey(d: Date): string {
    // YYYY-MM-DD in local time
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}

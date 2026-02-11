import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonButtons,
  IonMenuButton,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButton,
  IonList,
  IonLabel,
  IonSpinner,
  IonNote,
  IonIcon,
  IonCard,
  IonCardContent,
  IonModal,
  IonFab,
  IonFabButton,
} from '@ionic/angular/standalone';
import { Subject, takeUntil } from 'rxjs';

import { Activity } from 'src/app/models/activity.model';
import { Course } from 'src/app/models/course.model';
import { Goal, GoalPeriod, GoalTargetType } from 'src/app/models/goal.model';

import { ActivitiesService } from 'src/app/services/activities/activities.services';
import { CoursesService } from 'src/app/services/courses/courses.service';
import { GoalsService } from 'src/app/services/goals/goals.services';
import { StudySession } from 'src/app/models/study-session.model';
import { StudySessionsService } from 'src/app/services/studySessions/study-sessions.services';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    RouterLink,
    IonContent,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonButton,
    IonCard,
    IonCardContent,
    IonModal,
    IonFab,
    IonFabButton,
    IonList,
    IonLabel,
    IonSpinner,
    IonNote,
  ],
})
export class GoalsPage implements OnInit, OnDestroy {
  activities: Activity[] = [];
  courses: Course[] = [];
  goals: Goal[] = [];
  studySessions: StudySession[] = [];

  loading = false;
  saving = false;
  deletingId: string | null = null;
  uiError: string | null = null;
  // modals
  formOpen = false;
  actionsOpen = false;
  selected: Goal | null = null;

  get selectedId(): string | null {
    return this.selected?.id ?? null;
  }

  openCreate() {
    this.uiError = null;
    this.formOpen = true;
  }

  closeForm() {
    this.formOpen = false;
  }

  openActions(g: Goal) {
    this.selected = g;
    this.actionsOpen = true;
  }

  closeActions() {
    this.actionsOpen = false;
    this.selected = null;
  }

  form = {
    targetType: 'activity' as GoalTargetType,
    targetId: '',
    period: 'weekly' as GoalPeriod,

    targetHours: 0,
    targetMins: 0,
  };

  private destroy$ = new Subject<void>();

  constructor(
    private activitiesService: ActivitiesService,
    private coursesService: CoursesService,
    private goalsService: GoalsService,
    private studySessionsService: StudySessionsService,
  ) {}
  sessions: StudySession[] = [];

  loadSessions() {
    this.studySessionsService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => (this.sessions = data),
        error: (e) => console.error('Sessions load failed', e),
      });
  }

  getGoalProgress(g: Goal): {
    done: number;
    target: number;
    pct: number;
    remaining: number;
  } {
    const { from, to } = this.getPeriodRange(g.period);

    const done = this.sessions
      .filter(
        (s) =>
          s.targetType === g.targetType &&
          s.targetId === g.targetId &&
          s.startedAt >= from &&
          s.startedAt < to,
      )
      .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

    const target = g.targetMinutes || 0;
    const pct =
      target > 0 ? Math.min(100, Math.round((done / target) * 100)) : 0;
    const remaining = Math.max(0, target - done);

    return { done, target, pct, remaining };
  }

  ngOnInit() {
    this.loadActivities();
    this.loadCourses();
    this.loadGoals();
    this.loadSessions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTargetTypeChange() {
    this.form.targetId = '';
  }

  loadActivities() {
    this.activitiesService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => (this.activities = data),
        error: (e) => console.error(e),
      });
  }

  loadCourses() {
    this.coursesService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => (this.courses = data),
        error: (e) => console.error(e),
      });
  }

  loadGoals() {
    this.loading = true;
    this.uiError = null;

    this.goalsService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.goals = data;
          this.loading = false;
        },
        error: (e) => {
          console.error(e);
          this.uiError = 'Failed to load goals.';
          this.loading = false;
        },
      });
  }
  createGoal() {
    this.uiError = null;

    if (!this.form.targetId) {
      this.uiError = 'Select a target (activity/course).';
      return;
    }

    const hours = Number(this.form.targetHours ?? 0);
    const mins = Number(this.form.targetMins ?? 0);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(mins) ||
      hours < 0 ||
      mins < 0 ||
      mins > 59
    ) {
      this.uiError = 'Enter valid time (hours >= 0, minutes 0-59).';
      return;
    }

    const targetMinutes = hours * 60 + mins;

    if (targetMinutes <= 0) {
      this.uiError = 'Enter target time.';
      return;
    }

    this.saving = true;

    const period = 'weekly';

    this.goalsService
      .create({
        targetType: this.form.targetType,
        targetId: this.form.targetId,
        period,
        targetMinutes,
        createdAt: Date.now(),
      })
      .subscribe({
        next: (created) => {
          this.goals = [created, ...this.goals];
          this.saving = false;

          this.form.targetId = '';
          this.form.targetHours = 0;
          this.form.targetMins = 0;

          this.closeForm();
        },
        error: (e) => {
          console.error(e);
          this.uiError = 'Create failed.';
          this.saving = false;
        },
      });
  }

  deleteGoal(id: string) {
    this.uiError = null;
    this.deletingId = id;

    this.goalsService.remove(id).subscribe({
      next: () => {
        this.goals = this.goals.filter((g) => g.id !== id);
        this.deletingId = null;
      },
      error: (e) => {
        console.error(e);
        this.uiError = 'Delete failed.';
        this.deletingId = null;
      },
    });
  }

  labelForGoal(g: Goal): string {
    if (g.targetType === 'activity') {
      return (
        this.activities.find((a) => a.id === g.targetId)?.title ?? '(Activity)'
      );
    }
    return this.courses.find((c) => c.id === g.targetId)?.title ?? '(Course)';
  }

  trackByActivityId(_: number, a: Activity) {
    return a.id;
  }
  trackByCourseId(_: number, c: Course) {
    return c.id;
  }
  trackByGoalId(_: number, g: Goal) {
    return g.id;
  }

  private getPeriodRange(_: GoalPeriod): { from: number; to: number } {
    const now = new Date();

    // Monday start
    const day = now.getDay(); // 0=Sun
    const diffToMonday = (day + 6) % 7;

    const monday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - diffToMonday,
      0,
      0,
      0,
      0,
    );

    const from = monday.getTime();
    const to = new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate() + 7,
      0,
      0,
      0,
      0,
    ).getTime();

    return { from, to };
  }

  formatMinutes(total: number): string {
    const mins = Number(total || 0);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  }
}

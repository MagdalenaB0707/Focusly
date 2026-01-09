import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
} from '@ionic/angular/standalone';
import { Subject, takeUntil } from 'rxjs';

import { Activity } from 'src/app/models/activity.model';
import { Course } from 'src/app/models/course.model';
import { Goal, GoalPeriod, GoalTargetType } from 'src/app/models/goal.model';

import { ActivitiesService } from 'src/app/services/activities/activities.services';
import { CoursesService } from 'src/app/services/courses/courses.service';
import { GoalsService } from 'src/app/services/goals/goals.services';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,

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
  ],
})
export class GoalsPage implements OnInit, OnDestroy {
  activities: Activity[] = [];
  courses: Course[] = [];
  goals: Goal[] = [];

  loading = false;
  saving = false;
  deletingId: string | null = null;
  uiError: string | null = null;

  form: {
    targetType: GoalTargetType;
    targetId: string;
    period: GoalPeriod;
    targetMinutes: number | null;
  } = {
    targetType: 'activity',
    targetId: '',
    period: 'weekly',
    targetMinutes: null,
  };

  private destroy$ = new Subject<void>();

  constructor(
    private activitiesService: ActivitiesService,
    private coursesService: CoursesService,
    private goalsService: GoalsService
  ) {}

  ngOnInit() {
    this.loadActivities();
    this.loadCourses();
    this.loadGoals();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTargetTypeChange() {
    // kad promeni tip, resetuj target selection da user ne ostane na pogrešnom id-u
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
    if (!this.form.targetMinutes || this.form.targetMinutes <= 0) {
      this.uiError = 'Enter target minutes.';
      return;
    }

    this.saving = true;

    this.goalsService
      .create({
        targetType: this.form.targetType,
        targetId: this.form.targetId,
        period: this.form.period,
        targetMinutes: this.form.targetMinutes,
        createdAt: Date.now(),
      })
      .subscribe({
        next: (created) => {
          this.goals = [created, ...this.goals];
          this.saving = false;

          // reset minimalno
          this.form.targetId = '';
          this.form.targetMinutes = null;
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
      return this.activities.find((a) => a.id === g.targetId)?.title ?? '(Activity)';
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
}

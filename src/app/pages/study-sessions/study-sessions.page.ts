import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  IonNote,
  IonButton,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonTextarea,
  IonIcon,
} from '@ionic/angular/standalone';
import { Subject, takeUntil } from 'rxjs';

import { Course } from 'src/app/models/course.model';
import { Activity } from 'src/app/models/activity.model';
import {
  StudySession,
  StudySessionDTO,
  SessionTargetType,
} from 'src/app/models/study-session.model';

import { CoursesService } from 'src/app/services/courses/courses.service';
import { ActivitiesService } from 'src/app/services/activities/activities.services';
import { StudySessionsService } from 'src/app/services/studySessions/study-sessions.services';

@Component({
  selector: 'app-study-sessions',
  templateUrl: './study-sessions.page.html',
  styleUrls: ['./study-sessions.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    RouterLink,
    IonIcon,
    IonContent,
    IonItem,
    IonLabel,
    IonList,
    IonSpinner,
    IonNote,
    IonButton,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonTextarea,
  ],
})
export class StudySessionsPage implements OnInit, OnDestroy {
  courses: Course[] = [];
  activities: Activity[] = [];
  sessions: StudySession[] = [];

  loading = false;
  saving = false;
  deletingId: string | null = null;
  uiError: string | null = null;

  form: {
    targetType: SessionTargetType;
    targetId: string;
    durationHours: number;
    durationMins: number;

    notes: string;
  } = {
    targetType: 'course' as SessionTargetType,
    targetId: '',
    durationHours: 0,
    durationMins: 0,
    notes: '',
  };

  private destroy$ = new Subject<void>();

  constructor(
    private coursesService: CoursesService,
    private activitiesService: ActivitiesService,
    private studySessionsService: StudySessionsService,
  ) {}

  ngOnInit() {
    this.loadCourses();
    this.loadActivities();
    this.loadSessions();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTargetTypeChange() {
    this.form.targetId = ''; // reset target
  }

  loadCourses() {
    this.coursesService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => (this.courses = data),
        error: (e) => console.error('Courses load failed', e),
      });
  }

  loadActivities() {
    this.activitiesService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => (this.activities = data),
        error: (e) => console.error('Activities load failed', e),
      });
  }

  loadSessions() {
    this.loading = true;
    this.uiError = null;

    this.studySessionsService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.sessions = [...data].sort((a, b) => b.startedAt - a.startedAt);
          this.loading = false;
        },
        error: (e) => {
          console.error(e);
          this.uiError = 'Failed to load sessions.';
          this.loading = false;
        },
      });
  }

  createSession() {
    this.uiError = null;

    if (!this.form.targetId) {
      this.uiError = `Select a ${this.form.targetType}.`;
      return;
    }
    const h = Number(this.form.durationHours ?? 0);
    const m = Number(this.form.durationMins ?? 0);

    if (Number.isNaN(h) || Number.isNaN(m) || h < 0 || m < 0 || m > 59) {
      this.uiError = 'Enter valid duration (hours >= 0, minutes 0-59).';
      return;
    }

    const durationMinutes = h * 60 + m;
    if (durationMinutes <= 0) {
      this.uiError = 'Enter duration.';
      return;
    }

    const now = new Date();
    const startedAt = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    ).getTime();

    this.saving = true;

    this.studySessionsService
      .create({
        targetType: this.form.targetType,
        targetId: this.form.targetId,
        startedAt,
        durationMinutes,
        notes: this.form.notes.trim() || undefined,
      })
      .subscribe({
        next: (created) => {
          this.sessions = [created, ...this.sessions];
          this.saving = false;
          this.form.durationHours = 0;
          this.form.durationMins = 0;
          this.form.notes = '';
        },
        error: (e) => {
          console.error(e);
          this.uiError = 'Create failed.';
          this.saving = false;
        },
      });
  }

  deleteSession(id: string) {
    this.deletingId = id;
    this.uiError = null;

    this.studySessionsService.remove(id).subscribe({
      next: () => {
        this.sessions = this.sessions.filter((s) => s.id !== id);
        this.deletingId = null;
      },
      error: (e) => {
        console.error(e);
        this.uiError = 'Delete failed.';
        this.deletingId = null;
      },
    });
  }

  formatMinutes(mins: number): string {
    const total = mins || 0;
    if (total < 60) {
      return `${total}m`;
    }
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (m === 0) {
      return `${h}h`;
    }
    return `${h}h ${m}m`;
  }

  targetLabel(s: StudySession): string {
    if (s.targetType === 'course') {
      return this.courses.find((c) => c.id === s.targetId)?.title ?? s.targetId;
    }
    return (
      this.activities.find((a) => a.id === s.targetId)?.title ?? s.targetId
    );
  }

  formatDateTime(ms: number): string {
    return new Date(ms).toLocaleString();
  }

  editingId: string | null = null;
  savingId: string | null = null;

  editForm: { durationMinutes: number | null; notes: string } = {
    durationMinutes: null,
    notes: '',
  };

  startEdit(s: StudySession) {
    this.uiError = null;
    this.editingId = s.id;
    this.editForm = {
      durationMinutes: s.durationMinutes,
      notes: s.notes ?? '',
    };
  }

  cancelEdit() {
    this.uiError = null;
    this.editingId = null;
    this.savingId = null;
    this.editForm = { durationMinutes: null, notes: '' };
  }

  saveEdit() {
    if (!this.editingId) return;

    const duration = this.editForm.durationMinutes;
    if (!duration || duration <= 0) {
      this.uiError = 'Duration must be a positive number.';
      return;
    }

    const id = this.editingId;
    this.savingId = id;

    const patch: Partial<StudySessionDTO> = {
      durationMinutes: duration,
      notes: this.editForm.notes.trim() || undefined,
    };

    this.studySessionsService.update(id, patch).subscribe({
      next: () => {
        this.sessions = this.sessions.map((s) =>
          s.id === id ? { ...s, ...patch } : s,
        );
        this.savingId = null;
        this.editingId = null;
        this.editForm = { durationMinutes: null, notes: '' };
      },
      error: (e) => {
        console.error(e);
        this.uiError = 'Update failed.';
        this.savingId = null;
      },
    });
  }

  trackByCourseId(_: number, c: Course) {
    return c.id;
  }
  trackByActivityId(_: number, a: Activity) {
    return a.id;
  }
  trackBySessionId(_: number, s: StudySession) {
    return s.id;
  }
}

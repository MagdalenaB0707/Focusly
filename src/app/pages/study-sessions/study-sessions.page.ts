import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
} from '@ionic/angular/standalone';
import { Subject, takeUntil } from 'rxjs';

import { Course } from 'src/app/models/course.model';
import { StudySession, StudySessionDTO } from 'src/app/models/study-session.model';
import { CoursesService } from 'src/app/services/courses/courses.service';
import { StudySessionsService } from 'src/app/services/studySessions/study-sessions.services';

@Component({
  selector: 'app-study-sessions',
  templateUrl: './study-sessions.page.html',
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
  sessions: StudySession[] = [];

  loading = false;
  saving = false;
  deletingId: string | null = null;
  uiError: string | null = null;

  form: {
    courseId: string;
    startedAtIso: string; // ion-datetime radi sa ISO stringom
    durationMinutes: number | null;
    notes: string;
  } = {
    courseId: '',
    startedAtIso: new Date().toISOString(),
    durationMinutes: null,
    notes: '',
  };

  private destroy$ = new Subject<void>();

  constructor(
    private coursesService: CoursesService,
    private studySessionsService: StudySessionsService
  ) {}

  ngOnInit() {
    this.loadCourses();
    this.loadSessions();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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

  loadSessions() {
    this.loading = true;
    this.uiError = null;

    this.studySessionsService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          // (opciono) sortiraj najnovije prvo
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

    if (!this.form.courseId) {
      this.uiError = 'Select a course.';
      return;
    }
    if (!this.form.durationMinutes || this.form.durationMinutes <= 0) {
      this.uiError = 'Enter duration minutes.';
      return;
    }

    const startedAt = Date.parse(this.form.startedAtIso); // ms
    if (Number.isNaN(startedAt)) {
      this.uiError = 'Invalid date/time.';
      return;
    }

    this.saving = true;

    this.studySessionsService
      .create({
        courseId: this.form.courseId,
        startedAt,
        durationMinutes: this.form.durationMinutes,
        notes: this.form.notes.trim() || undefined,
      })
      .subscribe({
        next: (created) => {
          this.sessions = [created, ...this.sessions];
          this.saving = false;
          // reset minimalno
          this.form.durationMinutes = null;
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

  courseTitleById(courseId: string): string {
    return this.courses.find((c) => c.id === courseId)?.title ?? courseId;
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

  trackByCourseId(_: number, c: Course) {
    return c.id;
  }
  trackBySessionId(_: number, s: StudySession) {
    return s.id;
  }
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

    this.uiError = null;
    const id = this.editingId;
    this.savingId = id;

    const patch: Partial<StudySessionDTO> = {
      durationMinutes: duration,
      notes: this.editForm.notes.trim() || undefined,
    };

    this.studySessionsService.update(id, patch).subscribe({
      next: () => {
        // update local list (bez ponovnog fetch-a)
        this.sessions = this.sessions.map((s) =>
          s.id === id ? { ...s, ...patch } : s
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
}

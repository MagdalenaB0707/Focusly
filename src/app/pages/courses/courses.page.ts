// src/app/pages/courses/courses.page.ts
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
  IonInput,
  IonTextarea,
  IonButton,
  IonList,
  IonLabel,
  IonSpinner,
  IonNote,
} from '@ionic/angular/standalone';
import { Subject, takeUntil } from 'rxjs';

import { Course } from 'src/app/models/course.model';
import { CoursesService } from 'src/app/services/courses/courses.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.page.html',
  styleUrls: ['./courses.page.scss'],
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
    IonInput,
    IonTextarea,
    IonButton,

    IonList,
    IonLabel,
    IonSpinner,
    IonNote,
  ],
})
export class CoursesPage implements OnInit, OnDestroy {
  courses: Course[] = [];

  loading = false;
  saving = false;
  updating = false;
  deletingId: string | null = null;

  uiError: string | null = null;

  // Add form
  form: {
    title: string;
    description: string;
    estimatedTime: number | null;
  } = {
    title: '',
    description: '',
    estimatedTime: null,
  };

  // Edit state
  editingId: string | null = null;
  editForm: {
    title: string;
    description: string;
    estimatedTime: number | null;
  } = {
    title: '',
    description: '',
    estimatedTime: null,
  };

  private destroy$ = new Subject<void>();

  constructor(private coursesService: CoursesService) {}

  ngOnInit() {
    this.loadCourses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCourses() {
    this.loading = true;
    this.uiError = null;

    this.coursesService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          // opciono: sortiraj najnovije prvo ako imaš createdAt
          // this.courses = [...data].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
          this.courses = data;
          this.loading = false;
        },
        error: (e) => {
          console.error(e);
          this.uiError = 'Failed to load courses.';
          this.loading = false;
        },
      });
  }

  createCourse() {
    this.uiError = null;

    const title = this.form.title.trim();
    const description = this.form.description.trim();
    const estimatedTime = this.form.estimatedTime;

    if (!title) {
      this.uiError = 'Title is required.';
      return;
    }
    if (estimatedTime != null && estimatedTime < 0) {
      this.uiError = 'Estimated time cannot be negative.';
      return;
    }

    this.saving = true;

    // create() očekuje Omit<CourseDTO,'userId'|'createdAt'> u tvojoj user-specific verziji,
    // ali ako još nemaš userId/createdAt u modelu, samo ignoriši te komentare.
    this.coursesService
      .create({
        title,
        description: description || undefined,
        estimatedTime: estimatedTime ?? undefined,
      } as any)
      .subscribe({
        next: (created: Course) => {
          this.courses = [created, ...this.courses];
          this.saving = false;

          this.form.title = '';
          this.form.description = '';
          this.form.estimatedTime = null;
        },
        error: (e) => {
          console.error(e);
          this.uiError = 'Create failed.';
          this.saving = false;
        },
      });
  }

  startEdit(c: Course) {
    this.uiError = null;
    this.editingId = c.id;

    this.editForm.title = c.title;
    this.editForm.description = c.description ?? '';
    this.editForm.estimatedTime = (c as any).estimatedTime ?? null;
  }

  cancelEdit() {
    this.editingId = null;
    this.editForm.title = '';
    this.editForm.description = '';
    this.editForm.estimatedTime = null;
  }

  saveEdit(c: Course) {
    this.uiError = null;

    const title = this.editForm.title.trim();
    const description = this.editForm.description.trim();
    const estimatedTime = this.editForm.estimatedTime;

    if (!title) {
      this.uiError = 'Title is required.';
      return;
    }
    if (estimatedTime != null && estimatedTime < 0) {
      this.uiError = 'Estimated time cannot be negative.';
      return;
    }

    this.updating = true;

    this.coursesService
      .update(c.id, {
        title,
        description: description || undefined,
        estimatedTime: estimatedTime ?? undefined,
      } as any)
      .subscribe({
        next: () => {
          this.courses = this.courses.map((x) =>
            x.id === c.id
              ? {
                  ...x,
                  title,
                  description: description || undefined,
                  estimatedTime: estimatedTime ?? undefined,
                }
              : x
          );

          this.updating = false;
          this.cancelEdit();
        },
        error: (e) => {
          console.error(e);
          this.uiError = 'Update failed.';
          this.updating = false;
        },
      });
  }

  deleteCourse(id: string) {
    this.uiError = null;
    this.deletingId = id;

    this.coursesService.remove(id).subscribe({
      next: () => {
        this.courses = this.courses.filter((c) => c.id !== id);
        this.deletingId = null;
      },
      error: (e) => {
        console.error(e);
        this.uiError = 'Delete failed.';
        this.deletingId = null;
      },
    });
  }

  trackByCourseId(_: number, c: Course) {
    return c.id;
  }
}

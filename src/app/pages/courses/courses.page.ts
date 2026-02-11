import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonButtons,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonTextarea,
  IonButton,
  IonSpinner,
  IonNote,
  IonModal,
  IonCard,
  IonCardContent,
  IonFab,
  IonFabButton,
} from '@ionic/angular/standalone';
import { Subject, takeUntil } from 'rxjs';

import { Course } from 'src/app/models/course.model';
import { CoursesService } from 'src/app/services/courses/courses.service';

type FormMode = 'create' | 'edit';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.page.html',
  styleUrls: ['./courses.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,

    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonIcon,

    IonContent,
    IonNote,
    IonSpinner,

    IonCard,
    IonCardContent,

    IonModal,
    IonItem,
    IonInput,
    IonTextarea,
    IonButton,

    IonFab,
    IonFabButton,
  ],
})
export class CoursesPage implements OnInit, OnDestroy {
  courses: Course[] = [];

  loading = false;
  saving = false;
  updating = false;
  deletingId: string | null = null;
  uiError: string | null = null;

  // actions modal
  actionsOpen = false;
  selected: Course | null = null;

  // form modal
  formOpen = false;
  formMode: FormMode = 'create';
  editingId: string | null = null;

  form: { title: string; description: string; estimatedTime: number | null } = {
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
          this.courses = [...data].sort(
            (a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
          );
          this.loading = false;
        },
        error: (e) => {
          console.error(e);
          this.uiError = 'Failed to load courses.';
          this.loading = false;
        },
      });
  }

  // ---------- Create ----------
  openCreate() {
    this.uiError = null;
    this.formMode = 'create';
    this.editingId = null;
    this.form = { title: '', description: '', estimatedTime: null };
    this.formOpen = true;
  }

  // ---------- Actions ----------
  openActions(c: Course) {
    this.selected = c;
    this.actionsOpen = true;
  }

  closeActions() {
    this.actionsOpen = false;
    this.selected = null;
  }

  get selectedId(): string | null {
    return this.selected?.id ?? null;
  }

  openEditFromActions() {
    if (!this.selected) return;
    this.actionsOpen = false;

    this.uiError = null;
    this.formMode = 'edit';
    this.editingId = this.selected.id;

    this.form = {
      title: this.selected.title,
      description: this.selected.description ?? '',
      estimatedTime: (this.selected as any).estimatedTime ?? null,
    };

    this.formOpen = true;
  }

  // ---------- Form submit ----------
  closeForm() {
    this.formOpen = false;
    this.uiError = null;
    this.formMode = 'create';
    this.editingId = null;
    this.form = { title: '', description: '', estimatedTime: null };
  }

  submitForm() {
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

    // create
    if (this.formMode === 'create') {
      this.saving = true;

      this.coursesService
        .create({
          title,
          description: description || undefined,
          estimatedTime: estimatedTime ?? undefined,
          createdAt: Date.now(),
        } as any)
        .subscribe({
          next: (created: Course) => {
            this.courses = [created, ...this.courses];
            this.saving = false;
            this.closeForm();
          },
          error: (e) => {
            console.error(e);
            this.uiError = 'Create failed.';
            this.saving = false;
          },
        });

      return;
    }

    // edit
    if (!this.editingId) return;

    this.updating = true;
    const id = this.editingId;

    this.coursesService
      .update(id, {
        title,
        description: description || undefined,
        estimatedTime: estimatedTime ?? undefined,
      } as any)
      .subscribe({
        next: () => {
          this.courses = this.courses.map((x: any) =>
            x.id === id
              ? {
                  ...x,
                  title,
                  description: description || undefined,
                  estimatedTime: estimatedTime ?? undefined,
                }
              : x,
          );

          this.updating = false;
          this.closeForm();
        },
        error: (e) => {
          console.error(e);
          this.uiError = 'Update failed.';
          this.updating = false;
        },
      });
  }

  // ---------- Delete ----------
  deleteCourse(id: string) {
    this.uiError = null;
    this.deletingId = id;

    this.coursesService.remove(id).subscribe({
      next: () => {
        this.courses = this.courses.filter((c) => c.id !== id);
        this.deletingId = null;
        this.actionsOpen = false;

        if (this.formOpen && this.editingId === id) this.closeForm();
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

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

import { Activity } from 'src/app/models/activity.model';
import { ActivitiesService } from 'src/app/services/activities/activities.services';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.page.html',
  styleUrls: ['./activities.page.scss'],
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
export class ActivitiesPage implements OnInit, OnDestroy {
  activities: Activity[] = [];

  loading = false;
  saving = false;
  deletingId: string | null = null;

  uiError: string | null = null;

  form = {
    title: '',
    description: '',
  };

  editingId: string | null = null;

  editForm = {
    title: '',
    description: '',
  };

  updating = false;

  private destroy$ = new Subject<void>();

  constructor(private activitiesService: ActivitiesService) {}

  ngOnInit() {
    this.loadActivities();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  startEdit(a: Activity) {
    this.editingId = a.id;
    this.editForm.title = a.title;
    this.editForm.description = a.description ?? '';
  }

  cancelEdit() {
    this.editingId = null;
    this.editForm.title = '';
    this.editForm.description = '';
  }

  saveEdit(a: Activity) {
    this.uiError = null;

    const title = this.editForm.title.trim();
    const description = this.editForm.description.trim();

    if (!title) {
      this.uiError = 'Title is required.';
      return;
    }

    this.updating = true;

    this.activitiesService
      .update(a.id, {
        title,
        description: description || undefined,
      })
      .subscribe({
        next: () => {
          this.activities = this.activities.map((x) =>
            x.id === a.id
              ? { ...x, title, description: description || undefined }
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

  loadActivities() {
    this.loading = true;
    this.uiError = null;

    this.activitiesService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.activities = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to load activities', error);
          this.uiError = 'Failed to load activities.';
          this.loading = false;
        },
      });
  }

  createActivity() {
    this.uiError = null;

    const title = this.form.title.trim();
    const description = this.form.description.trim();

    if (!title) {
      this.uiError = 'Title is required.';
      return;
    }

    this.saving = true;

    this.activitiesService
      .create({
        title,
        description: description || undefined,
        createdAt: Date.now(),
      })
      .subscribe({
        next: (created) => {
          this.activities = [created, ...this.activities];
          this.saving = false;
          this.form.title = '';
          this.form.description = '';
        },
        error: (e) => {
          console.error(e);
          this.uiError = 'Create failed.';
          this.saving = false;
        },
      });
  }

  deleteActivity(id: string) {
    this.uiError = null;
    this.deletingId = id;

    this.activitiesService.remove(id).subscribe({
      next: () => {
        this.activities = this.activities.filter((a) => a.id !== id);
        this.deletingId = null;
      },
      error: (e) => {
        console.error(e);
        this.uiError = 'Delete failed.';
        this.deletingId = null;
      },
    });
  }

  trackByActivityId(_: number, a: Activity) {
    return a.id;
  }
}

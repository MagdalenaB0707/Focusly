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

import { Activity } from 'src/app/models/activity.model';
import { ActivitiesService } from 'src/app/services/activities/activities.services';

type FormMode = 'create' | 'edit';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.page.html',
  styleUrls: ['./activities.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonFab,
    IonFabButton,

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
  ],
})
export class ActivitiesPage implements OnInit, OnDestroy {
  activities: Activity[] = [];
  loading = false;
  saving = false;
  updating = false;
  deletingId: string | null = null;
  uiError: string | null = null;

  // actions
  actionsOpen = false;
  selected: Activity | null = null;

  // form modal
  formOpen = false;
  formMode: FormMode = 'create';
  editingId: string | null = null;

  form = { title: '', description: '' };

  private destroy$ = new Subject<void>();

  constructor(private activitiesService: ActivitiesService) {}

  ngOnInit() {
    this.loadActivities();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadActivities() {
    this.loading = true;
    this.uiError = null;

    this.activitiesService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.activities = [...data].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
          this.loading = false;
        },
        error: (e) => {
          console.error(e);
          this.uiError = 'Failed to load activities.';
          this.loading = false;
        },
      });
  }

  // ---------- Create ----------
  openCreate() {
    this.uiError = null;
    this.formMode = 'create';
    this.editingId = null;
    this.form = { title: '', description: '' };
    this.formOpen = true;
  }

  // ---------- Actions ----------
  openActions(a: Activity) {
    this.selected = a;
    this.actionsOpen = true;
  }

  closeActions() {
    this.actionsOpen = false;
    this.selected = null;
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
    };
    this.formOpen = true;
  }

  // ---------- Form submit ----------
  closeForm() {
    this.formOpen = false;
    this.uiError = null;
    this.formMode = 'create';
    this.editingId = null;
    this.form = { title: '', description: '' };
  }

  submitForm() {
    this.uiError = null;

    const title = this.form.title.trim();
    const description = this.form.description.trim();

    if (!title) {
      this.uiError = 'Title is required.';
      return;
    }

    if (this.formMode === 'create') {
      this.saving = true;
      this.activitiesService
        .create({ title, description: description || undefined, createdAt: Date.now() })
        .subscribe({
          next: (created) => {
            this.activities = [created, ...this.activities];
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

    this.activitiesService
      .update(id, { title, description: description || undefined })
      .subscribe({
        next: () => {
          this.activities = this.activities.map((x) =>
            x.id === id ? { ...x, title, description: description || undefined } : x
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
  confirmDeleteSelected() {
    if (!this.selectedId) return;
    this.deleteActivity(this.selectedId);
  }

  confirmDeleteFromModal() {
    if (!this.editingId) return;
    this.deleteActivity(this.editingId);
  }

   deleteActivity(id: string) {
    this.uiError = null;
    this.deletingId = id;

    this.activitiesService.remove(id).subscribe({
      next: () => {
        this.activities = this.activities.filter((a) => a.id !== id);
        this.deletingId = null;
        this.actionsOpen = false;
        // ako brišeš iz edit modala:
        if (this.formOpen && this.editingId === id) this.closeForm();
      },
      error: (e) => {
        console.error(e);
        this.uiError = 'Delete failed.';
        this.deletingId = null;
      },
    });
  }
  get selectedId(): string | null{
  return this.selected?.id ?? null;
}


  trackByActivityId(_: number, a: Activity) {
    return a.id;
  }
}

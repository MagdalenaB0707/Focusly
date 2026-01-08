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
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonNote,
  IonButton,
  IonInput,
} from '@ionic/angular/standalone';
import { Subject, takeUntil } from 'rxjs';
import { StudySessionsService } from 'src/app/services/studySessions/study-sessions.services';
import { StudySession } from 'src/app/models/study-session.model';

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
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonNote,
    IonButton,
    IonInput,
  ],
})
export class StudySessionsPage implements OnInit, OnDestroy {
  studySessions: StudySession[] = [];
  loading = false;

  saving = false;
  deletingId: string | null = null;
  uiError: string | null = null;

  form: { courseId: string; date: string; durationMinutes: number | null } = {
    courseId: '',
    date: '',
    durationMinutes: null,
  };

  private destroy$ = new Subject<void>();

  constructor(private studySessionsService: StudySessionsService) {}

  ngOnInit() {
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load() {
    this.loading = true;
    this.uiError = null;

    this.studySessionsService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.studySessions = data;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.uiError = 'Failed to load study sessions.';
          this.loading = false;
        },
      });
  }

  doRefresh(ev: CustomEvent) {
    this.studySessionsService.getAll().subscribe({
      next: (data) => {
        this.studySessions = data;
        (ev.target as HTMLIonRefresherElement).complete();
      },
      error: (err) => {
        console.error(err);
        this.uiError = 'Refresh failed.';
        (ev.target as HTMLIonRefresherElement).complete();
      },
    });
  }

  addSession() {
    this.uiError = null;

    const courseId = this.form.courseId.trim();
    const date = this.form.date.trim();
    const duration = this.form.durationMinutes;

    if (!courseId || !date || !duration || duration <= 0) {
      this.uiError = 'Fill Course ID, Date, and Duration (minutes).';
      return;
    }

    this.saving = true;

    this.studySessionsService
      .create({
        courseId,
        startedAt: date,
        durationMinutes: duration,
      })
      .subscribe({
        next: (created) => {
          // najjednostavnije: dodaj na vrh liste
          this.studySessions = [created, ...this.studySessions];

          // reset forme
          this.form = { courseId: '', date: '', durationMinutes: null };
          this.saving = false;
        },
        error: (err) => {
          console.error(err);
          this.uiError = 'Create failed.';
          this.saving = false;
        },
      });
  }

  deleteSession(id: string) {
    this.uiError = null;
    this.deletingId = id;

    this.studySessionsService.remove(id).subscribe({
      next: () => {
        this.studySessions = this.studySessions.filter((s) => s.id !== id);
        this.deletingId = null;
      },
      error: (err) => {
        console.error(err);
        this.uiError = 'Delete failed.';
        this.deletingId = null;
      },
    });
  }

  trackById(_: number, s: StudySession) {
    return s.id;
  }
}

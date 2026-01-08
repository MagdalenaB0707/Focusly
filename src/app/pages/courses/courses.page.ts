import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
} from '@ionic/angular/standalone';
import { Subject, takeUntil } from 'rxjs';
import { CoursesService } from '../../services/courses/courses.service';
import { Course } from '../../models/course.model';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.page.html',
  styleUrls: ['./courses.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
  ],
})
export class CoursesPage implements OnInit, OnDestroy {
  courses: Course[] = [];
  loading = false;
  errorMsg: string | null = null;

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
    this.errorMsg = null;

    this.coursesService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.courses = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load courses', err);
          this.errorMsg =
            'Failed to load courses. Check Firebase rules/URL and try again.';
          this.loading = false;
        },
      });
  }

  doRefresh(ev: CustomEvent) {
    this.coursesService.getAll().subscribe({
      next: (data) => {
        this.courses = data;
        (ev.target as HTMLIonRefresherElement).complete();
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Refresh failed.';
        (ev.target as HTMLIonRefresherElement).complete();
      },
    });
  }

  trackById(_: number, c: Course) {
    return c.id;
  }
}

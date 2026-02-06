import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButtons,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonNote,
  IonBackButton
} from '@ionic/angular/standalone';

import { Subject, takeUntil } from 'rxjs';

import { StudySession } from 'src/app/models/study-session.model';
import { Course } from 'src/app/models/course.model';
import { Activity } from 'src/app/models/activity.model';

import { StudySessionsService } from 'src/app/services/studySessions/study-sessions.services';
import { CoursesService } from 'src/app/services/courses/courses.service';
import { ActivitiesService } from 'src/app/services/activities/activities.services';

type Metric = 'sessions' | 'minutes';
type RowDim = 'courses' | 'activities';
type ColDim = 'months' | 'weeks';

type PivotRow = {
  id: string;
  label: string;
  values: number[]; 
  total: number;
};

@Component({
  selector: 'app-data-room',
  templateUrl: './data-room.page.html',
  styleUrls: ['./data-room.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,

    IonContent,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,

    IonSpinner,
    IonNote,
    IonBackButton

  ],
})
export class DataRoomPage implements OnInit, OnDestroy {
  loading = false;
  errorMsg: string | null = null;

  sessions: StudySession[] = [];
  courses: Course[] = [];
  activities: Activity[] = [];

  metric: Metric = 'minutes';        // Sessions | Minutes
  rowDim: RowDim = 'courses';        // Courses | Activities
  colDim: ColDim = 'months';         // Months | Calendar Weeks
  year = new Date().getFullYear();   // za months/weeks

  colKeys: string[] = [];           
  colLabels: string[] = [];        
  rows: PivotRow[] = [];
  colTotals: number[] = [];
  grandTotal = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private sessionsService: StudySessionsService,
    private coursesService: CoursesService,
    private activitiesService: ActivitiesService
  ) {}

  ngOnInit() {
    this.loadAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onControlsChanged() {
    this.recomputePivot();
  }

  private loadAll() {
    this.loading = true;
    this.errorMsg = null;

    this.coursesService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (courses) => {
        this.courses = courses;

        this.activitiesService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
          next: (acts) => {
            this.activities = acts;

            this.sessionsService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
              next: (sessions) => {
                this.sessions = sessions;
                this.recomputePivot();
                this.loading = false;
              },
              error: (e) => {
                console.error(e);
                this.errorMsg = 'Failed to load study sessions.';
                this.loading = false;
              },
            });
          },
          error: (e) => {
            console.error(e);
            this.errorMsg = 'Failed to load activities.';
            this.loading = false;
          },
        });
      },
      error: (e) => {
        console.error(e);
        this.errorMsg = 'Failed to load courses.';
        this.loading = false;
      },
    });
  }


  private recomputePivot() {
    const cols = this.colDim === 'months'
      ? this.buildMonthColumns(this.year)
      : this.buildWeekColumns(this.year);

    this.colKeys = cols.map((c) => c.key);
    this.colLabels = cols.map((c) => c.label);

    const wantedTargetType = this.rowDim === 'courses' ? 'course' : 'activity';

    const filtered = this.sessions.filter((s) => {
      if (s.targetType !== wantedTargetType) return false;
      const d = new Date(s.startedAt);
      return d.getFullYear() === this.year;
    });

    const byRow = new Map<string, number[]>(); 

    for (const s of filtered) {
      const colIndex = this.findColIndex(s.startedAt);
      if (colIndex === -1) continue;

      const rowId = s.targetId;
      if (!byRow.has(rowId)) byRow.set(rowId, new Array(this.colKeys.length).fill(0));

      const arr = byRow.get(rowId)!;

      const add = this.metric === 'sessions' ? 1 : (s.durationMinutes || 0);
      arr[colIndex] += add;
    }

    const pivotRows: PivotRow[] = Array.from(byRow.entries()).map(([id, values]) => {
      const total = values.reduce((sum, v) => sum + v, 0);
      return {
        id,
        label: this.labelForTarget(wantedTargetType, id),
        values,
        total,
      };
    });

    pivotRows.sort((a, b) => b.total - a.total);

    const colTotals = new Array(this.colKeys.length).fill(0);
    for (const r of pivotRows) {
      r.values.forEach((v, i) => (colTotals[i] += v));
    }
    const grand = colTotals.reduce((sum, v) => sum + v, 0);

    this.rows = pivotRows;
    this.colTotals = colTotals;
    this.grandTotal = grand;
  }

  private labelForTarget(targetType: 'course' | 'activity', targetId: string): string {
    if (targetType === 'course') {
      return this.courses.find((c) => c.id === targetId)?.title ?? targetId;
    }
    return this.activities.find((a) => a.id === targetId)?.title ?? targetId;
  }


  private buildMonthColumns(year: number): { key: string; label: string }[] {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const yy = String(year).slice(-2);

    return Array.from({ length: 12 }).map((_, idx) => {
      const m = String(idx + 1).padStart(2, '0');
      return {
        key: `${year}-${m}`,       // 2026-01
        label: `${labels[idx]} ${yy}`,
      };
    });
  }

  private buildWeekColumns(year: number): { key: string; label: string }[] {
    const weeks: { key: string; label: string }[] = [];
    const maxWeeks = 53;

    for (let w = 1; w <= maxWeeks; w++) {
      const ww = String(w).padStart(2, '0');
      weeks.push({ key: `${year}-W${ww}`, label: `W${ww}` });
    }
    return weeks;
  }

  private findColIndex(ms: number): number {
    const d = new Date(ms);

    if (this.colDim === 'months') {
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${d.getFullYear()}-${m}`;
      return this.colKeys.indexOf(key);
    }

    const iso = this.isoWeek(d);
    const key = `${iso.year}-W${String(iso.week).padStart(2, '0')}`;
    return this.colKeys.indexOf(key);
  }

  private isoWeek(date: Date): { year: number; week: number } {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return { year: d.getUTCFullYear(), week };
  }

  trackByRowId(_: number, r: PivotRow) { return r.id; }
  trackByIdx(i: number) { return i; }

  formatCell(v: number): string {
   return String(v);
  }
}

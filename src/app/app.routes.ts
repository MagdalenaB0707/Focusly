import { Routes } from '@angular/router';
import { authGuard } from './services/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth.page').then(m => m.AuthPage),
  },

  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
  },
  {
    path: 'study-sessions',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/study-sessions/study-sessions.page').then(m => m.StudySessionsPage),
  },
  {
    path: 'courses',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/courses/courses.page').then(m => m.CoursesPage),
  },
  {
    path: 'activities',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/activities/activities.page').then(m => m.ActivitiesPage),
  },
  {
    path: 'data-room',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/data-room/data-room.page').then(m => m.DataRoomPage),
  },
  {
    path: 'goals',
    loadComponent: () => import('./pages/goals/goals.page').then( m => m.GoalsPage)
  },
];

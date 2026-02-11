import { Routes } from '@angular/router';
import { TabsPage } from './pages/tabs/tabs.page';
import { authGuard } from './services/auth/auth.guard';

export const routes: Routes = [
  { path: 'auth', loadComponent: () => import('./pages/auth/auth.page').then(m => m.AuthPage) },

  {
    path: 'tabs',
    component: TabsPage,
    canActivate: [authGuard],
    children: [
      { path: 'home', loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage) },
      { path: 'courses', loadComponent: () => import('./pages/courses/courses.page').then(m => m.CoursesPage) },
      { path: 'activities', loadComponent: () => import('./pages/activities/activities.page').then(m => m.ActivitiesPage) },
      { path: 'study-sessions', loadComponent: () => import('./pages/study-sessions/study-sessions.page').then(m => m.StudySessionsPage) },
      { path: 'goals', loadComponent: () => import('./pages/goals/goals.page').then(m => m.GoalsPage) },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },

  { path: 'data-room', canActivate: [authGuard], loadComponent: () => import('./pages/data-room/data-room.page').then(m => m.DataRoomPage) },

  { path: '', redirectTo: 'tabs/home', pathMatch: 'full' },
  { path: '**', redirectTo: 'tabs/home' },
];

import { Routes } from '@angular/router';
import { TabsPage } from './tabs/tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'courses',
        loadComponent: () =>
          import('./pages/courses/courses.page').then((m) => m.CoursesPage),
      },
      {
        path: 'activities',
        loadComponent: () =>
          import('./pages/activities/activities.page').then(
            (m) => m.ActivitiesPage,
          ),
      },
      {
        path: 'study-sessions',
        loadComponent: () =>
          import('./pages/study-sessions/study-sessions.page').then(
            (m) => m.StudySessionsPage,
          ),
      },
      {
        path: 'goals',
        loadComponent: () =>
          import('./pages/goals/goals.page').then((m) => m.GoalsPage),
      },
      {
        path: 'data-room',
        loadComponent: () =>
          import('./pages/data-room/data-room.page').then(
            (m) => m.DataRoomPage,
          ),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },

  {
    path: 'auth',
    loadComponent: () =>
      import('./pages/auth/auth.page').then((m) => m.AuthPage),
  },

  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
];

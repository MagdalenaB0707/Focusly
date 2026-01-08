import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.page').then((m) => m.HomePage),
  },

  {
    path: 'studySessions',
    loadComponent: () =>
      import('./pages/study-sessions/study-sessions.page').then((m) => m.StudySessionsPage),
  },

  {
    path: 'courses',
    loadComponent: () =>
      import('./pages/courses/courses.page').then((m) => m.CoursesPage),
  },

  {
    path: 'data-room',
    loadComponent: () =>
      import('./pages/data-room/data-room.page').then((m) => m.DataRoomPage),
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/home/home.page').then((m) => m.HomePage),
  },
];

import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonApp,
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

import { AuthService, CurrentUser } from './services/auth.services'; // <-- OVDE

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    IonApp,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonMenuToggle,
    IonRouterOutlet,
    IonFooter,
    IonButton,
    RouterLink,
  ],
})
export class AppComponent {
  currentUser: CurrentUser | null = null;

  constructor(private auth: AuthService, private router: Router) {
    // da odmah vidiš korisnika u meniju
    if (!this.auth.currentUser) {
      this.auth.setDemoUser();
    }

    this.auth.currentUser$.subscribe((u) => (this.currentUser = u));
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}

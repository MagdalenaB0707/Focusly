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
  IonToolbar,
} from '@ionic/angular/standalone';

import { AuthService } from './services/auth/auth.services'; 

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

  constructor(private auth: AuthService, private router: Router) {
  this.auth.autoLogin();

  this.auth.session$.subscribe((s) => {
    if (!s || !this.auth.isAuthenticated) {
      this.router.navigateByUrl('/auth', { replaceUrl: true });
    }
  });
}


  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/auth', { replaceUrl: true });
  }
}

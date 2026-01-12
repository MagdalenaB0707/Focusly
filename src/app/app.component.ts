import { Component, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import {
  IonApp, IonButton, IonContent, IonFooter, IonHeader, IonItem, IonLabel,
  IonList, IonMenu, IonMenuToggle, IonRouterOutlet, IonTitle, IonToolbar, IonIcon, IonButtons
} from '@ionic/angular/standalone';

import { AuthService } from './services/auth/auth.services';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    IonApp, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList,
    IonItem, IonLabel, IonMenuToggle, IonRouterOutlet, IonFooter, IonButton,
    RouterLink, IonIcon, IonButtons
  ],
})
export class AppComponent implements OnDestroy {
  userEmail: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(private auth: AuthService, private router: Router) {
    this.auth.autoLogin();

    this.auth.session$
      .pipe(takeUntil(this.destroy$))
      .subscribe((s) => {
        this.userEmail = s?.email ?? null;

        if (!s || !this.auth.isAuthenticated) {
          this.router.navigateByUrl('/auth', { replaceUrl: true });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/auth', { replaceUrl: true });
  }
}

import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

import { AuthService } from './services/auth/auth.services';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private auth: AuthService, private router: Router) {
    this.auth.autoLogin();

    this.auth.session$.pipe(takeUntil(this.destroy$)).subscribe((s) => {
      if (!s || !this.auth.isAuthenticated) {
        this.router.navigateByUrl('/auth', { replaceUrl: true });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

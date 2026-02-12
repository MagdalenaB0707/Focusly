import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.services';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonPopover,
  IonContent
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonPopover,
    IonContent,
    CommonModule,
  ]
})
export class AppHeaderComponent {
  @Input() title = '';

  email$ = this.auth.session$.pipe(map(s => s?.email ?? null));

  menuOpen = false;
  menuEvent: any = null; 

  constructor(private auth: AuthService, private router: Router) {}

  openUserMenu(ev: Event) {
    this.menuEvent = ev;
    this.menuOpen = true;
  }

  onLogout() {
    this.menuOpen = false;

    this.auth.logout();
    this.router.navigateByUrl('/auth', { replaceUrl: true });
  }
}

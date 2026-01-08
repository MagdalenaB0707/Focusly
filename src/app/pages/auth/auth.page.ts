import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonItem, IonInput, IonButton, IonNote,
  IonSegment, IonSegmentButton, IonLabel
} from '@ionic/angular/standalone';

import { AuthService } from 'src/app/services/auth/auth.services';
import { UsersService } from 'src/app/services/users/users.services';

type Mode = 'login' | 'register';

@Component({
  selector: 'app-auth',
  standalone: true,
  templateUrl: './auth.page.html',
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonItem, IonInput, IonButton, IonNote,
    IonSegment, IonSegmentButton, IonLabel
  ],
})
export class AuthPage {
  mode: Mode = 'login';
  loading = false;
  errorMsg: string | null = null;

  form = { firstName: '', lastName: '', email: '', password: '' };

  constructor(
    private auth: AuthService,
    private users: UsersService,
    private router: Router
  ) {}

  submit() {
    this.errorMsg = null;

    const email = this.form.email.trim();
    const password = this.form.password;

    if (!email || password.length < 6) {
      this.errorMsg = 'Email is required and password must be at least 6 characters.';
      return;
    }

    this.loading = true;

    if (this.mode === 'login') {
      this.auth.login(email, password).subscribe({
        next: async () => {
          this.loading = false;
          await this.router.navigateByUrl('/home', { replaceUrl: true });
        },
        error: (e) => {
          console.error(e);
          this.errorMsg = 'Login failed.';
          this.loading = false;
        },
      });
      return;
    }

    // register
    if (!this.form.firstName.trim() || !this.form.lastName.trim()) {
      this.errorMsg = 'First name and last name are required.';
      this.loading = false;
      return;
    }

    this.auth.register(email, password).subscribe({
      next: (session) => {
        this.users.setProfile(session.uid, {
          firstName: this.form.firstName.trim(),
          lastName: this.form.lastName.trim(),
          email,
          createdAt: Date.now(),
        }).subscribe({
          next: async () => {
            this.loading = false;
            await this.router.navigateByUrl('/home', { replaceUrl: true });
          },
          error: (e) => {
            console.error(e);
            this.errorMsg = 'Profile save failed.';
            this.loading = false;
          },
        });
      },
      error: (e) => {
        console.error(e);
        this.errorMsg = 'Register failed.';
        this.loading = false;
      },
    });
  }
}

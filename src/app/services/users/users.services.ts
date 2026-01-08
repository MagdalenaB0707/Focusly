import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../api/api.service';
import { paths } from '../api/firebase-paths';

export type UserProfileDTO = {
  firstName: string;
  lastName: string;
  email: string;
  createdAt: number;
};

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private api: ApiService) {}

  private userPath(uid: string) {
    return `${paths.users}/${uid}`;
  }

  setProfile(uid: string, dto: UserProfileDTO): Observable<void> {
    return this.api.set<UserProfileDTO>(this.userPath(uid), dto).pipe(map(() => void 0));
  }

  getProfile(uid: string): Observable<UserProfileDTO | null> {
    return this.api.getOne<UserProfileDTO>(this.userPath(uid));
  }
}

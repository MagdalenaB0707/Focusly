// src/app/services/users/users.service.ts
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../api/api.service';
import { paths } from '../api/firebase-paths';
import { User } from '../../models/user.model';

export type UserDTO = Omit<User, 'id'>;

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private api: ApiService) {}

  private userPath(userId: string) {
    return `${paths.users}/${userId}`;
  }

  // ✅ READ: vrati user-a po id (users/{id})
  getById(userId: string): Observable<User | null> {
    return this.api.getOne<UserDTO>(this.userPath(userId)).pipe(
      map((u) => (u ? ({ ...u, id: userId } as User) : null))
    );
  }

  // ✅ CREATE: kreira user na users/{id}
  // (Firebase RTDB: PUT na known key)
  create(user: User): Observable<User> {
    const { id, ...dto } = user;
    return this.api.set<UserDTO>(this.userPath(id), dto).pipe(
      map(() => user)
    );
  }

  // ✅ UPDATE: patch na users/{id}
  update(userId: string, patch: Partial<UserDTO>): Observable<void> {
    // koristi update(path, id, patch) pa path=users, id=userId
    return this.api.update<UserDTO>(paths.users, userId, patch);
  }

  // ✅ DELETE: obriši users/{id}
  remove(userId: string): Observable<void> {
    return this.api.remove(paths.users, userId);
  }
}

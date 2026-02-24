import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import {
  Auth,
  authState,
  UserInfo,
  updateProfile,
  signInWithEmailAndPassword,
  User
} from '@angular/fire/auth';
import { Observable, from, of, concatMap, Subject } from 'rxjs';

@Injectable({
  providedIn: 'any'
})
export class AuthenticationService {

  currentUser$!: Observable<User | null>;
  userData: Subject<any> = new Subject<any>();
  private env = inject(EnvironmentInjector);

  constructor(private auth: Auth) {
    this.currentUser$ = authState(this.auth);
    this.currentUser$.subscribe((user) => {
      if (user) {
        this.userData.next(user);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        this.userData.next(null);
        localStorage.removeItem('user');
      }
    });
  }

  async login(email: string, password: string) {
    return runInInjectionContext(this.env, async () => {
      return await signInWithEmailAndPassword(this.auth, email, password);
    });
  }

  logout() {
    console.log('Logging out...');
    return from(this.auth.signOut());
  }

  updateProfileData(profileData: Partial<UserInfo>): Observable<any> {
    return runInInjectionContext(this.env, () => {
      const currentUser = this.auth.currentUser;
      return of(currentUser).pipe(
        concatMap(user =>
          runInInjectionContext(this.env, () => {
            if (!user) throw new Error('Not Authenticated');
            return from(updateProfile(user, profileData));
          })
        )
      );
    });
  }

  get loggedInUserId(): string {
    const userData = localStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData).uid;
    }
    return '';
  }
}

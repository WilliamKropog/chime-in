import { Injectable } from '@angular/core';
import {
  Auth,
  authState,
  UserInfo,
  updateProfile,
  signInWithEmailAndPassword
} from '@angular/fire/auth';
import { Observable, from, of, concatMap, Subject } from 'rxjs';

@Injectable({
  providedIn: 'any'
})
export class AuthenticationService {

  currentUser$ = authState(this.auth);

  userData: Subject<any> = new Subject<any>();

  constructor(private auth: Auth) {
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
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    console.log('Logging out...');
    return from(this.auth.signOut());
  }

  updateProfileData(profileData: Partial<UserInfo>): Observable<any> {
    const currentUser = this.auth.currentUser;
    return of(currentUser).pipe(
      concatMap(user => {
        if (!user) throw new Error('Not Authenticated');
        return updateProfile(user, profileData);
      })
    );
  }

  get loggedInUserId(): string {
    const userData = localStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData).uid;
    }
    return '';
  }
}

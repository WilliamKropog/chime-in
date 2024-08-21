import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from, of, concatMap, Subject } from 'rxjs';
import {
  UserInfo,
  updateProfile,
  Auth,
  authState
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'any'
})
export class AuthenticationService {

  //Angular 16 Auth:
  currentUser$ = authState(this.auth);

  userData: Subject<any> = new Subject<any>();

  constructor(private auth: Auth, private afAuth: AngularFireAuth, private afs: AngularFirestore) {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userData.next(user);
        localStorage.setItem('user', JSON.stringify(user));
      }
      else {
        this.userData.next(null);
        localStorage.removeItem('user');
      }
    });
  }

  async login(email: string, password: string): Promise<any> {
    return await this.afAuth.signInWithEmailAndPassword(email, password);
  }

  //Angular 16 Logout:
  logout() {
    console.log("Logging out...");
    return from(this.auth.signOut());
  }


  // afAuth LOGOUT

  // logout(): void {
  //   this.afAuth.signOut().then((res) => {
  //     localStorage.removeItem('user');
  //   });
  // }

  //Angular 16 updateProfileData:
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
      return JSON.parse(userData).uid
    }
    return '';
  }

  //OLD AUTH:
  // currentUser$ = authState(this.auth);

  // constructor(private auth: Auth) { 

  // }

  // login(username: string, password: string){
  //   return from(signInWithEmailAndPassword(this.auth, username, password));
  // }

  // updateProfileData(profileData: Partial<UserInfo>): Observable<any>{
  //   const currentUser = this.auth.currentUser;
  //   return of(currentUser).pipe(
  //     concatMap(user => {
  //       if (!user) throw new Error('Not Authenticated');

  //       return updateProfile(user, profileData);
  //     })
  //   );
  // }


}


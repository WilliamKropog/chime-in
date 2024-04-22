import { Injectable } from '@angular/core';
import { Observable, from, of, concatMap } from 'rxjs';
import { 
  UserInfo,
  updateProfile, 
  signInWithEmailAndPassword,
  Auth,
  authState
 } from '@angular/fire/auth';

@Injectable({
  providedIn: 'any'
})
export class AuthenticationService {

  currentUser$ = authState(this.auth);
 
  constructor(private auth: Auth) { 

  }

  login(username: string, password: string){
    return from(signInWithEmailAndPassword(this.auth, username, password));
  }

  updateProfileData(profileData: Partial<UserInfo>): Observable<any>{
    const currentUser = this.auth.currentUser;
    return of(currentUser).pipe(
      concatMap(user => {
        if (!user) throw new Error('Not Authenticated');

        return updateProfile(user, profileData);
      })
    );
  }

  logout(){
    return from(this.auth.signOut());
  }

}


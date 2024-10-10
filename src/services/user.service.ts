import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { User } from 'firebase/auth';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private firestore: AngularFirestore, private storage: AngularFireStorage) {}

  getUserProfile(uid: string): Observable<any> {
    return this.firestore.collection('users').doc(uid).valueChanges();
  }

  setUserProfile(uid: string, data: any, options: { merge: boolean }): Promise<void> {
    return this.firestore.collection('users').doc(uid).set(data, options);
  }

  updateUserProfile(uid: string, data: any): Promise<void> {
    return this.firestore.collection('users').doc(uid).update(data);
  }

  getUserByUsername(username: string): Observable<any> {
    if (!username || typeof username !== 'string' || username.trim() === '') {
      console.error('Invalid or undefined username passted to Firestore query.');
      return of(null);
    }
    return this.firestore.collection('users', ref => ref.where('username', '==', username))
      .valueChanges({ idField: 'uid'});
  }

  getUserProfileImageUrl(uid: string): Observable<string> {
    const path = `images/profile/${uid}`;
    return this.storage.ref(path).getDownloadURL().pipe(
      catchError(error => {
        console.error('Error fetching profile image URL:', error);
        return of('assets/images/png-transparent-default-avatar.png');
      })
    )
  }
}

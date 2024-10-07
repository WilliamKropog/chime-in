import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from 'firebase/auth';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private firestore: AngularFirestore) {}

  getUserProfile(uid: string): Observable<any> {
    return this.firestore.collection('users').doc(uid).valueChanges();
  }

  setUserProfile(uid: string, data: any, options: { merge: boolean }): Promise<void> {
    return this.firestore.collection('users').doc(uid).set(data, options);
  }

  updateUserProfile(uid: string, data: any): Promise<void> {
    return this.firestore.collection('users').doc(uid).update(data);
  }
}

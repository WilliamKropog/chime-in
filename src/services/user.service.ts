import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentData, DocumentReference } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
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
    );
  }

  followUser(targetUserId: string, loggedInUserId: string): Promise<void> {
    const userRef: DocumentReference<any> = this.firestore.collection('users').doc(targetUserId).ref;
    return this.firestore.firestore.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if(!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const followers = userData?.['followers'] || [];
      const followerCount = userData?.['followerCount'] || 0;

      if (!followers.includes(loggedInUserId)) {
        transaction.update(userRef, {
          followers: [...followers, loggedInUserId],
          followerCount: followerCount + 1
        });
        console.log('Successfully followed', targetUserId);
      }
    });
  }

  unfollowUser(targetUserId: string, loggedInUserId: string): Promise<void> {
    const userRef: DocumentReference<any> = this.firestore.collection('users').doc(targetUserId).ref;
    return this.firestore.firestore.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const followers = userData?.['followers'] || [];
      const followerCount = userData?.['followerCount'] || 0;

      if (followers.includes(loggedInUserId)) {
        transaction.update(userRef, {
          followers: followers.filter((id: string) => id !== loggedInUserId),
          followerCount: followerCount - 1
        });
        console.log('Successfully unfollowed', targetUserId);
      }
    });
  }

  isFollowing(targetUserId: string, loggedInUserId: string): Observable<boolean> {
    return this.firestore.doc(`users/${targetUserId}`).valueChanges().pipe(
      switchMap((userData: any) => {
        const followers = userData?.followers || [];
        return of(followers.includes(loggedInUserId));
      })
    );
  }
}

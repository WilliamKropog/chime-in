import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentData, DocumentReference } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { firestore } from 'firebase-admin';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

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

  getRandomRecommendedUser(): Observable<any> {
    return this.firestore.collection('users', ref => ref.where('followerCount', '>=', 1))
      .get().pipe(map(snapshot => {
        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as firestore.DocumentData)
        }))
        return users.length ? users[Math.floor(Math.random() * users.length)] : null;
      }));
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
    const targetUserRef: DocumentReference<any> = this.firestore.collection('users').doc(targetUserId).ref;
    const loggedInUserRef: DocumentReference<any> = this.firestore.collection('users').doc(loggedInUserId).ref;

    return this.firestore.firestore.runTransaction(async (transaction) => {
      const targetUserDoc = await transaction.get(targetUserRef);
      const loggedInUserDoc = await transaction.get(loggedInUserRef);

      if(!targetUserDoc.exists || !loggedInUserDoc.exists) {
        throw new Error('User not found');
      }

      const targetUserData = targetUserDoc.data();
      const targetFollowers = targetUserData?.['followers'] || [];
      const targetFollowerCount = targetUserData?.['followerCount'] || 0;

      if (!targetFollowers.includes(loggedInUserId)) {
        transaction.update(targetUserRef, {
          followers: [...targetFollowers, loggedInUserId],
          followerCount: targetFollowerCount + 1
        });
      }

      const loggedInUserData = loggedInUserDoc.data();
      const loggedInFollowing = loggedInUserData?.['following'] || [];
      const loggedInFollowingCount = loggedInUserData?.['followingCount'] || 0;

      if (!loggedInFollowing.includes(targetUserId)) {
        transaction.update(loggedInUserRef, {
          following: [...loggedInFollowing, targetUserId],
          followingCount: loggedInFollowingCount + 1
        });
      }

      console.log('Successfully followed', targetUserId);
    });
  }

  unfollowUser(targetUserId: string, loggedInUserId: string): Promise<void> {
    const targetUserRef: DocumentReference<any> = this.firestore.collection('users').doc(targetUserId).ref;
    const loggedInUserRef: DocumentReference<any> = this.firestore.collection('users').doc(loggedInUserId).ref;

    return this.firestore.firestore.runTransaction(async (transaction) => {
      const targetUserDoc = await transaction.get(targetUserRef);
      const loggedInUserDoc = await transaction.get(loggedInUserRef);

      if(!targetUserDoc.exists || !loggedInUserDoc.exists) {
        throw new Error('User not found');
      }

      const targetUserData = targetUserDoc.data();
      const targetFollowers = targetUserData?.['followers'] || [];
      const targetFollowerCount = targetUserData?.['followerCount'] || 0;

      if (targetFollowers.includes(loggedInUserId)) {
        transaction.update(targetUserRef, {
          followers: targetFollowers.filter((id: string) => id !== loggedInUserId),
          followerCount: targetFollowerCount - 1
        });
      }

      const loggedInUserData = loggedInUserDoc.data();
      const loggedInFollowing = loggedInUserData?.['following'] || [];
      const loggedInFollowingCount = loggedInUserData?.['followingCount'] || 0;

      if (loggedInFollowing.includes(targetUserId)) {
        transaction.update(loggedInUserRef, {
          following: loggedInFollowing.filter((id: string) => id !== targetUserId),
          followingCount: loggedInFollowingCount - 1
        });
      }

      console.log('Successfully unfollowed', targetUserId);
    });
  }

  isFollowing(loggedInUserId: string, targetUserId: string): Observable<boolean> {
    return this.firestore.doc(`users/${targetUserId}`).valueChanges().pipe(
      switchMap((userData: any) => {
        const followers = userData?.followers || [];
        return of(followers.includes(loggedInUserId));
      })
    );
  }
}

import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, DocumentData, DocumentReference } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { firestore } from 'firebase-admin';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { catchError, debounceTime, last, map, switchMap } from 'rxjs/operators';
import { PostsService } from './posts.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private lastVisitToFollowingPage: Date | null = null;
  private unseenPostsCount$ = new BehaviorSubject<number>(0);
  private unseenPostsSubscription: Subscription | null = null;

  constructor(
    private firestore: AngularFirestore, 
    private storage: AngularFireStorage, 
    private afAuth: AngularFireAuth,
    private postsService: PostsService
  ) {  }

  getUserProfile(uid: string): Observable<any> {
    return this.firestore.collection('users').doc(uid).valueChanges();
  }

  setUserProfile(uid: string, data: any, options: { merge: boolean }): Promise<void> {
    return this.firestore.collection('users').doc(uid).set(data, options);
  }

  updateUserProfile(uid: string, data: any): Promise<void> {
    return this.firestore.collection('users').doc(uid).update(data);
  }

  //Following Notification Methods

  getLastVisitToFollowingPage(): Date | null {
    const storedTimestamp = localStorage.getItem('lastVisitToFollowingPage');
    this.lastVisitToFollowingPage = storedTimestamp ? new Date(storedTimestamp) : null;
    return this.lastVisitToFollowingPage;
  }

  updateLastVisitToFollowingPage(): void {
    const now = new Date();
    console.log('Updating last visit to FOllowing page: ', now);
    this.lastVisitToFollowingPage = now;
    localStorage.setItem('lastVisitToFollowingPage', now.toISOString());
  }

  getUnseenPostsCount$(): Observable<number> {
    return this.unseenPostsCount$.asObservable();
  }

  startTrackingUnseenPosts(): void {
    console.log('starting startTrackingUnseenPosts');
  
    if (this.unseenPostsSubscription) {
      this.unseenPostsSubscription.unsubscribe();
    }
  
    this.unseenPostsSubscription = this.afAuth.authState.pipe(
      switchMap(user => {
        if (!user) return of([]); 
        return this.getFollowedUserIds();
      }),
      switchMap(userIds => {
        const lastVisit = this.getLastVisitToFollowingPage();
        return this.postsService.getUnseenPostsCount(userIds, lastVisit);
      })
    ).subscribe(count => {
      console.log('Updating startTracking UnseenPosts count: ', count);
      this.unseenPostsCount$.next(count);
    });
  }
  
  clearUnseenPostsCount(): void {
    console.log('Clearing unseen posts count and stopping tracking.');
    this.unseenPostsCount$.next(0);
    this.updateLastVisitToFollowingPage();
  
    if (this.unseenPostsSubscription) {
      this.unseenPostsSubscription.unsubscribe();
      this.unseenPostsSubscription = null;
    }
  
    setTimeout(() => this.startTrackingUnseenPosts(), 1000);
  }

  //Get User's Profile Page

  getUserByUsername(username: string): Observable<any> {
    if (!username || typeof username !== 'string' || username.trim() === '') {
      console.error('Invalid or undefined username passted to Firestore query.');
      return of(null);
    }
    return this.firestore.collection('users', ref => ref.where('username', '==', username))
      .valueChanges({ idField: 'uid'});
  }

  //Select random User to recommend

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

  getMultipleRandomRecommendedUsers(limit: number): Observable<any> {
    return this.firestore.collection('users', ref => ref.where('followerCount', '>=', limit))
      .get().pipe(map(snapshot => {
        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as firestore.DocumentData)
        }))
        return users.length ? users[Math.floor(Math.random() * users.length)] : null;
      }));
  }

  //Get User's Profile Picture by UserID

  getUserProfileImageUrl(uid: string): Observable<string> {
    const path = `images/profile/${uid}`;
    return this.storage.ref(path).getDownloadURL().pipe(
      catchError(error => {
        console.error('Error fetching profile image URL:', error);
        return of('assets/images/png-transparent-default-avatar.png');
      })
    );
  }

  //Get logged-in User's UserID

  getCurrentUserId(): Observable<string | null> {
    return this.afAuth.authState.pipe(
      map(user => user ? user.uid : null)
    );
  }

  //Get logged-in User's list of follows

  getFollowedUserIds(): Observable<string[]> {
    return this.getCurrentUserId().pipe(
      switchMap((userId) => {
        if (!userId) {
          return of([]);
        }
        return this.firestore.collection('users').doc(userId).valueChanges().pipe(
          map((userData: any) => userData?.following || [])
        );
      })
    );
  }

  //Follow button for Profile Page

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

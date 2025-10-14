import { Injectable, NgZone, EnvironmentInjector, runInInjectionContext, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { map, switchMap, debounceTime } from 'rxjs/operators';
import { Auth, authState } from '@angular/fire/auth';

import {
  Firestore,
  doc,
  docData,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  runTransaction,
  DocumentReference,
} from '@angular/fire/firestore';

import { Storage, ref as storageRef, getDownloadURL } from '@angular/fire/storage';
import { PostsService } from './posts.service';
import { User } from 'src/interface';

@Injectable({ providedIn: 'root' })
export class UserService {

  private lastVisitToFollowingPage: Date | null = null;
  private unseenPostsCount$ = new BehaviorSubject<number>(0);
  private unseenPostsSubscription: Subscription | null = null;

  private env = inject(EnvironmentInjector);

  constructor(
    private db: Firestore,
    private storage: Storage,
    private auth: Auth,
    private postsService: PostsService,
    private ngZone: NgZone
  ) {}

  // ---------- Profiles ----------
  user$(uid: string): Observable<User | undefined> {
    const ref = doc(this.db, 'users', uid);
    return docData(ref) as Observable<User | undefined>; 
  }

  getUserProfile(uid: string): Observable<any> {
    const ref = doc(this.db, `users/${uid}`);
    return runInInjectionContext(this.env, () => docData(ref));
  }

  setUserProfile(uid: string, data: any, options: { merge: boolean }): Promise<void> {
    return runInInjectionContext(this.env, async () => {
      await setDoc(doc(this.db, `users/${uid}`), data, options);
    });
  }

  updateUserProfile(uid: string, data: any): Promise<void> {
    return runInInjectionContext(this.env, async () => {
      await updateDoc(doc(this.db, `users/${uid}`), data);
    });
  }

  // ---------- Following notifications ----------
  getLastVisitToFollowingPage(): Date | null {
    const stored = localStorage.getItem('lastVisitToFollowingPage');
    this.lastVisitToFollowingPage = stored ? new Date(stored) : null;
    return this.lastVisitToFollowingPage;
  }

  updateLastVisitToFollowingPage(): void {
    const now = new Date();
    this.lastVisitToFollowingPage = now;
    localStorage.setItem('lastVisitToFollowingPage', now.toISOString());
  }

  getUnseenPostsCount$(): Observable<number> {
    return this.unseenPostsCount$.asObservable();
  }

  startTrackingUnseenPosts(): void {
  if (this.unseenPostsSubscription) this.unseenPostsSubscription.unsubscribe();

  const user$ = runInInjectionContext(this.env, () => authState(this.auth));

  this.unseenPostsSubscription = user$.pipe(
    switchMap(user => user ? this.getFollowedUserIds() : of([])),
    switchMap(userIds => this.postsService.getUnseenPostsCount(userIds, this.getLastVisitToFollowingPage())),
    debounceTime(250)
  ).subscribe(count => this.unseenPostsCount$.next(count));
}

  clearUnseenPostsCount(): void {
    this.unseenPostsCount$.next(0);
    this.updateLastVisitToFollowingPage();
    if (this.unseenPostsSubscription) {
      this.unseenPostsSubscription.unsubscribe();
      this.unseenPostsSubscription = null;
    }
    setTimeout(() => this.ngZone.run(() => this.startTrackingUnseenPosts()), 1000);
  }

  // ---------- Profile lookups ----------
  getUserByUsername(username: string): Observable<any> {
    if (!username || typeof username !== 'string' || username.trim() === '') {
      console.error('Invalid or undefined username passed to Firestore query.');
      return of(null);
    }

    return new Observable<any>(subscriber => {
      runInInjectionContext(this.env, async () => {
        try {
          const q = query(
            collection(this.db, 'users'),
            where('username', '==', username)
          );
          const snap = await getDocs(q);
          const results = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
          subscriber.next(results);
          subscriber.complete();
        } catch (err) {
          subscriber.error(err);
        }
      });
    });
  }

  // ---------- Recommendations ----------
  getRandomRecommendedUser(): Observable<any> {
    return new Observable<any>(subscriber => {
      runInInjectionContext(this.env, async () => {
        try {
          const q = query(
            collection(this.db, 'users'),
            where('followerCount', '>=', 1)
          );
          const snap = await getDocs(q);

          const users = snap.docs.map(d => ({ ...(d.data() as any), id: d.id }));
          const pick = users.length ? users[Math.floor(Math.random() * users.length)] : null;

          subscriber.next(pick);
          subscriber.complete();
        } catch (err) {
          subscriber.error(err);
        }
      });
    });
  }

  getMultipleRandomRecommendedUsers(limitCount: number): Observable<any> {
    const q = query(collection(this.db, 'users'), where('followerCount', '>=', limitCount));
    return new Observable<any>(subscriber => {
      runInInjectionContext(this.env, async () => {
        try {
          const snap = await getDocs(q);
          const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          const pick = users.length ? users[Math.floor(Math.random() * users.length)] : null;
          subscriber.next(pick);
          subscriber.complete();
        } catch (err) {
          subscriber.error(err);
        }
      });
    });
  }

  // ---------- Profile images ----------
  getUserProfileImageUrl(uid: string): Observable<string> {
    const path = `images/profile/${uid}`;
    return new Observable<string>(subscriber => {
      runInInjectionContext(this.env, async () => {
        try {
          const url = await getDownloadURL(storageRef(this.storage, path));
          subscriber.next(url);
          subscriber.complete();
        } catch (error) {
          // fall back to local default avatar
          subscriber.next('assets/images/png-transparent-default-avatar.png');
          subscriber.complete();
        }
      });
    });
  }

  // ---------- Logged-in user ----------
  getCurrentUserId(): Observable<string | null> {
    const user$ = runInInjectionContext(this.env, () => authState(this.auth));
    return user$.pipe(map(user => user ? user.uid : null));
  }

  getFollowedUserIds(): Observable<string[]> {
    return this.getCurrentUserId().pipe(
      switchMap(uid => {
        if (!uid) return of(null);
        return runInInjectionContext(this.env, () => {
          const ref = doc(this.db, `users/${uid}`);
          return docData(ref);
        });
      }),
      map((userData: any) => userData?.following || [])
    );
  }

  // ---------- User Permissions -------------
  promoteToMod(targetUid: string) { return this.setModerator(targetUid, true); }
  demoteFromMod(targetUid: string) { return this.setModerator(targetUid, false); }

  async setModerator(targetUid: string, value: boolean): Promise<void> {
    return runInInjectionContext(this.env, async () => {
      const ref = doc(this.db, `users/${targetUid}`);
      await updateDoc(ref, { isMod: value });
    });
  }

  // ---------- Follow / Unfollow (transaction) ----------
  async followUser(targetUserId: string, loggedInUserId: string): Promise<void> {
    const targetRef = doc(this.db, `users/${targetUserId}`) as DocumentReference<any>;
    const meRef = doc(this.db, `users/${loggedInUserId}`) as DocumentReference<any>;

    await runInInjectionContext(this.env, async () => {
      await runTransaction(this.db, async (tx) => {
        const targetSnap = await tx.get(targetRef);
        const meSnap = await tx.get(meRef);
        if (!targetSnap.exists() || !meSnap.exists()) throw new Error('User not found');

        const target = targetSnap.data() || {};
        const me = meSnap.data() || {};

        const targetFollowers: string[] = target.followers || [];
        const targetFollowerCount: number = target.followerCount || 0;

        const meFollowing: string[] = me.following || [];
        const meFollowingCount: number = me.followingCount || 0;

        if (!targetFollowers.includes(loggedInUserId)) {
          tx.update(targetRef, {
            followers: [...targetFollowers, loggedInUserId],
            followerCount: targetFollowerCount + 1
          });
        }

        if (!meFollowing.includes(targetUserId)) {
          tx.update(meRef, {
            following: [...meFollowing, targetUserId],
            followingCount: meFollowingCount + 1
          });
        }
      });
    });
  }

  async unfollowUser(targetUserId: string, loggedInUserId: string): Promise<void> {
    const targetRef = doc(this.db, `users/${targetUserId}`) as DocumentReference<any>;
    const meRef = doc(this.db, `users/${loggedInUserId}`) as DocumentReference<any>;

    await runInInjectionContext(this.env, async () => {
      await runTransaction(this.db, async (tx) => {
        const targetSnap = await tx.get(targetRef);
        const meSnap = await tx.get(meRef);
        if (!targetSnap.exists() || !meSnap.exists()) throw new Error('User not found');

        const target = targetSnap.data() || {};
        const me = meSnap.data() || {};

        const targetFollowers: string[] = target.followers || [];
        const targetFollowerCount: number = target.followerCount || 0;

        const meFollowing: string[] = me.following || [];
        const meFollowingCount: number = me.followingCount || 0;

        if (targetFollowers.includes(loggedInUserId)) {
          tx.update(targetRef, {
            followers: targetFollowers.filter(id => id !== loggedInUserId),
            followerCount: Math.max(0, targetFollowerCount - 1)
          });
        }

        if (meFollowing.includes(targetUserId)) {
          tx.update(meRef, {
            following: meFollowing.filter(id => id !== targetUserId),
            followingCount: Math.max(0, meFollowingCount - 1)
          });
        }
      });
    });
  }

  isFollowing(loggedInUserId: string, targetUserId: string): Observable<boolean> {
    return runInInjectionContext(this.env, () => {
      const ref = doc(this.db, `users/${targetUserId}`);
      const src$ = docData(ref);
      return src$.pipe(
        map((userData: any) => {
          const followers: string[] = userData?.followers || [];
          return followers.includes(loggedInUserId);
        })
      );
    });
  }
}

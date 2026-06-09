import { Injectable, EnvironmentInjector, runInInjectionContext, inject } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import {
  Firestore,
  doc,
  docData,
  collection,
  collectionData,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  Query,
  QueryDocumentSnapshot,
  setDoc,
  serverTimestamp,
  writeBatch,
  deleteDoc,
} from '@angular/fire/firestore';
import {
  Functions,
  httpsCallable,
} from '@angular/fire/functions';

import { Post, Comment } from '../interface';
import { AuthenticationService } from './authentication.service';
import { AnonymousViewerIdService } from './anonymous-viewer-id.service';

@Injectable({ providedIn: 'root' })
export class PostsService {

  private static readonly FEED_PAGE_SIZE = 10;

  private homeLastVisible: QueryDocumentSnapshot | null = null;
  private userLastVisible = new Map<string, QueryDocumentSnapshot>();
  private followingLastVisible: QueryDocumentSnapshot | null = null;
  private env = inject(EnvironmentInjector);

  private openEditorSubject = new Subject<string | null>();
  openEditor$ = this.openEditorSubject.asObservable();

  constructor(
    private db: Firestore,
    private fns: Functions,
    private authService: AuthenticationService,
    private anonymousViewerIdService: AnonymousViewerIdService,
  ) {}

  openEditor(postId: string): void {
    this.openEditorSubject.next(postId);
  }

  closeEditor(): void {
    this.openEditorSubject.next(null);
  }

  // ---------- Post Creation ----------
  async savePost(data: Post): Promise<string> {
    return runInInjectionContext(this.env, async () => {
      const postsCol = collection(this.db, 'posts');
      const docRef   = doc(postsCol);
      const postId   = docRef.id;

      const payload: Post & { clientCreatedAt: number } = {
        ...data,
        postId,
        createdAt: serverTimestamp(),
        clientCreatedAt: Date.now(),
        isHidden: data.isHidden ?? false,
      };

      await setDoc(docRef, payload as any);
      return postId;
    });
  }

  async saveComment(postId: string, data: Comment): Promise<string> {
    return runInInjectionContext(this.env, async () => {
      const commentsCol = collection(this.db, `posts/${postId}/comments`);
      const commentRef = doc(commentsCol);
      data.commentId = commentRef.id;

      await setDoc(commentRef, data as any);
      await this.incrementCommentCount(postId);
      return commentRef.id;
    });
  }
  //----------- Post Delete -------
  async deletePost(postId: string): Promise<void> {
    if (!postId) return;

    await runInInjectionContext(this.env, async () => {
      const postRef = doc(this.db, `posts/${postId}`);

      const deleteSubcollection = async (sub: string) => {
        const PAGE = 300;
        while (true) {
          const snap = await getDocs(query(collection(this.db, `posts/${postId}/${sub}`), limit(PAGE)));
          if (snap.empty) break;
          const batch = writeBatch(this.db);
          snap.docs.forEach(d => batch.delete(d.ref));
          await batch.commit();
          if (snap.size < PAGE) break;
        }
      };
 
      await deleteSubcollection('likes');
      await deleteSubcollection('dislikes');
      await deleteSubcollection('comments');

      await deleteDoc(postRef);
    });
  }

  // ---------- Post Page: get by ID ----------
  getPostById(postId: string): Observable<Post | undefined> {
  return runInInjectionContext(this.env, () => {
    const ref = doc(this.db, `posts/${postId}`);
     return docData(ref, { idField: 'postId' }) as Observable<Post | undefined>
  });
}

  // ---------- Following Page notifications ----------
  getUnseenPostsCount(userIds: string[], lastVisit: Date | null): Observable<number> {
    if (!userIds || userIds.length === 0) return of(0);

    return runInInjectionContext(this.env, () => {
      const base = collection(this.db, 'posts');
      let q: Query = query(base, where('userId', 'in', userIds));

      if (lastVisit) {
        q = query(q, where('createdAt', '>', lastVisit));
      }

      return collectionData(q).pipe(
        map(posts => posts.length)
      );
    });
  }

  // ---------- Home: initial list ----------
  getMostRecentPosts(): Observable<Post[]> {
    return new Observable<Post[]>(subscriber => {
      runInInjectionContext(this.env, async () => {
        try {
          this.homeLastVisible = null;
          const q = query(
            collection(this.db, 'posts'),
            orderBy('createdAt', 'desc'),
            limit(PostsService.FEED_PAGE_SIZE),
            where('isHidden', '==', false)
          );
          const snapshot = await getDocs(q);
          if (snapshot.size > 0) {
            this.homeLastVisible = snapshot.docs[snapshot.docs.length - 1];
          }
          subscriber.next(this.mapPostDocs(snapshot.docs));
          subscriber.complete();
        } catch (err) {
          subscriber.error(err);
        }
      });
    });
  }

  // ---------- Home: load more (infinite scroll) ----------
  getMorePosts(): Observable<Post[]> {
    return new Observable<Post[]>(subscriber => {
      runInInjectionContext(this.env, async () => {
        try {
          if (!this.homeLastVisible) {
            subscriber.next([]);
            subscriber.complete();
            return;
          }

          const q = query(
            collection(this.db, 'posts'),
            orderBy('createdAt', 'desc'),
            limit(PostsService.FEED_PAGE_SIZE),
            where('isHidden', '==', false),
            startAfter(this.homeLastVisible)
          );

          const snapshot = await getDocs(q);
          if (snapshot.size > 0) {
            this.homeLastVisible = snapshot.docs[snapshot.docs.length - 1];
          }

          subscriber.next(this.mapPostDocs(snapshot.docs));
          subscriber.complete();
        } catch (err) {
          subscriber.error(err);
        }
      });
    });
  }

  // ---------- Profile: posts ----------
  getUserPosts(userId: string): Observable<Post[]> {
    return new Observable<Post[]>(subscriber => {
      runInInjectionContext(this.env, async () => {
        try {
          this.userLastVisible.delete(userId);
          const q = query(
            collection(this.db, 'posts'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(PostsService.FEED_PAGE_SIZE)
          );
          const snapshot = await getDocs(q);
          if (snapshot.size > 0) {
            this.userLastVisible.set(userId, snapshot.docs[snapshot.docs.length - 1]);
          }
          subscriber.next(this.mapPostDocs(snapshot.docs));
          subscriber.complete();
        } catch (err) {
          subscriber.error(err);
        }
      });
    });
  }

  getMoreUserPosts(userId: string): Observable<Post[]> {
    return new Observable<Post[]>(subscriber => {
      runInInjectionContext(this.env, async () => {
        try {
          const lastVisible = this.userLastVisible.get(userId);
          if (!lastVisible) {
            subscriber.next([]);
            subscriber.complete();
            return;
          }

          const q = query(
            collection(this.db, 'posts'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(PostsService.FEED_PAGE_SIZE),
            startAfter(lastVisible)
          );

          const snapshot = await getDocs(q);
          if (snapshot.size > 0) {
            this.userLastVisible.set(userId, snapshot.docs[snapshot.docs.length - 1]);
          }
          subscriber.next(this.mapPostDocs(snapshot.docs));
          subscriber.complete();
        } catch (err) {
          subscriber.error(err);
        }
      });
    });
  }

  private mapPostDocs(docs: QueryDocumentSnapshot[]): Post[] {
    return docs.map(d => {
      const data = d.data() as Omit<Post, 'postId'>;
      return { ...data, postId: d.id };
    });
  }

  // ---------- Comments ----------
  getCommentsForPost(postId: string, topCommentId?: string): Observable<Comment[]> {
    return runInInjectionContext(this.env, () => {
      const q = query(
        collection(this.db, `posts/${postId}/comments`),
        orderBy('createdAt', 'asc')
      );

      const src$ = collectionData(q, { idField: 'commentId' }) as Observable<Comment[]>;

      return src$.pipe(
        map(comments => topCommentId ? comments.filter(c => c.commentId !== topCommentId) : comments),
        debounceTime(500),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      );
    });
  }

  getTopCommentForPost(postId: string): Observable<Comment | undefined> {
    return new Observable<Comment | undefined>(subscriber => {
      runInInjectionContext(this.env, async () => {
        try {
          const q = query(
            collection(this.db, `posts/${postId}/comments`),
            orderBy('likeCount', 'desc'),
            limit(1)
          );
          const snap = await getDocs(q);
          const item = snap.docs.length ? (snap.docs[0].data() as Comment) : undefined;
          subscriber.next(item);
          subscriber.complete();
        } catch (err) {
          subscriber.error(err);
        }
      });
    });
  }

  // ---------- Recommended profile ----------
  getThreeMostRecentPostsByUser(userId: string): Observable<Post[]> {
    return runInInjectionContext(this.env, () => {
      const q = query(
        collection(this.db, 'posts'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(3)
      );

      const src$ = collectionData(q, { idField: 'postId' }) as Observable<Post[]>;
      return src$.pipe(map(posts => posts ?? []));
    });
  }

  getPostsFromUsers(userIds: string[], lim: number): Observable<Post[]> {
    if (!userIds || userIds.length === 0) return of([]);

    return new Observable<Post[]>(subscriber => {
      runInInjectionContext(this.env, async () => {
        try {
          this.followingLastVisible = null;
          const q = query(
            collection(this.db, 'posts'),
            where('userId', 'in', userIds),
            orderBy('createdAt', 'desc'),
            limit(lim)
          );

          const snapshot = await getDocs(q);
          if (snapshot.docs.length > 0) {
            this.followingLastVisible = snapshot.docs[snapshot.docs.length - 1];
          }

          subscriber.next(snapshot.docs.map(d => d.data() as Post));
          subscriber.complete();
        } catch (err) {
          subscriber.error(err);
        }
      });
    });
  }

  getMorePostsFromUsers(userIds: string[], lim: number): Observable<Post[]> {
    if (!userIds || userIds.length === 0) return of([]);
    if (!this.followingLastVisible) {
      return of([]);
    }

    return new Observable<Post[]>(subscriber => {
      runInInjectionContext(this.env, async () => {
        try {
          const q = query(
            collection(this.db, 'posts'),
            where('userId', 'in', userIds),
            orderBy('createdAt', 'desc'),
            limit(lim),
            startAfter(this.followingLastVisible!)
          );

          const snapshot = await getDocs(q);
          if (snapshot.docs.length > 0) {
            this.followingLastVisible = snapshot.docs[snapshot.docs.length - 1];
          }
          subscriber.next(snapshot.docs.map(d => d.data() as Post));
          subscriber.complete();
        } catch (err) {
          subscriber.error(err);
        }
      });
    });
  }

  // ---------- Cloud Functions / Interactions ----------
  async incrementView(postId: string): Promise<void> {
    await runInInjectionContext(this.env, async () => {
      const fn = httpsCallable(this.fns, 'incrementPostView');
      const uid = this.authService.loggedInUserId;
      const payload = uid
        ? { postId }
        : { postId, anonymousViewerId: this.anonymousViewerIdService.getOrCreateAnonymousViewerId() };
      await fn(payload);
    });
  }

  async incrementCommentCount(postId: string): Promise<void> {
    await runInInjectionContext(this.env, async () => {
      const fn = httpsCallable(this.fns, 'incrementCommentCount');
      await fn({ postId });
    });
  }

  async addLike(postId: string | undefined): Promise<void> {
    await runInInjectionContext(this.env, async () => {
      const fn = httpsCallable(this.fns, 'addLike');
      await fn({ postId });
    });
  }

  async removeLike(postId: string | undefined): Promise<void> {
    await runInInjectionContext(this.env, async () => {
      const fn = httpsCallable(this.fns, 'removeLike');
      await fn({ postId });
    });
  }

  async checkIfUserLiked(postId: string, userId: string): Promise<boolean> {
    return await runInInjectionContext(this.env, async () => {
      const ref = doc(this.db, `posts/${postId}/likes/${userId}`);
      const snap = await getDoc(ref);
      return snap.exists();
    });
  }

  async addDislike(postId: string | undefined): Promise<void> {
    await runInInjectionContext(this.env, async () => {
      const fn = httpsCallable(this.fns, 'addDislike');
      await fn({ postId });
    });
  }

  async removeDislike(postId: string | undefined): Promise<void> {
    await runInInjectionContext(this.env, async () => {
      const fn = httpsCallable(this.fns, 'removeDislike');
      await fn({ postId });
    });
  }

  async checkIfUserDisliked(postId: string, userId: string): Promise<boolean> {
    return await runInInjectionContext(this.env, async () => {
      const ref = doc(this.db, `posts/${postId}/dislikes/${userId}`);
      const snap = await getDoc(ref);
      return snap.exists();
    });
  }
}

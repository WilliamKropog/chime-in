import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
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
  setDoc
} from '@angular/fire/firestore';

import {
  Functions,
  httpsCallable,
} from '@angular/fire/functions';

import { Post, Comment } from '../interface';

@Injectable({ providedIn: 'root' })
export class PostsService {

  private lastVisible: QueryDocumentSnapshot | null = null;

  constructor(
    private db: Firestore,
    private fns: Functions
  ) {}


  async savePost(data: Post): Promise<string> {
  const postsCol = collection(this.db, 'posts');
  const docRef = doc(postsCol);      
  data.postId = docRef.id;
  await setDoc(docRef, data as any);   
  return docRef.id;
}

async saveComment(postId: string, data: Comment): Promise<string> {
  const commentsCol = collection(this.db, `posts/${postId}/comments`);
  const commentRef = doc(commentsCol);
  data.commentId = commentRef.id;
  await setDoc(commentRef, data as any);  
  await this.incrementCommentCount(postId);
  return commentRef.id;
}


  getPostById(postId: string): Observable<Post | undefined> {
    const ref = doc(this.db, `posts/${postId}`);
    return docData(ref, { idField: 'postId' }) as Observable<Post | undefined>;
  }


  getUnseenPostsCount(userIds: string[], lastVisit: Date | null): Observable<number> {
    const base = collection(this.db, 'posts');
    let q: Query = query(base, where('userId', 'in', userIds));
    if (lastVisit) q = query(q, where('createdAt', '>', lastVisit));
    return collectionData(q).pipe(map(posts => posts.length));
  }


  getMostRecentPosts(): Observable<Post[]> {
    const q = query(
      collection(this.db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    return (collectionData(q, { idField: 'postId' }) as Observable<Post[]>)
      .pipe(
        debounceTime(1000),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      );
  }


  getMorePosts(): Observable<Post[]> {
    const base = query(collection(this.db, 'posts'), orderBy('createdAt', 'desc'), limit(10));
    const q = this.lastVisible ? query(base, startAfter(this.lastVisible)) : base;

    return new Observable<Post[]>(subscriber => {
      getDocs(q)
        .then(snapshot => {
          if (snapshot.size > 0) {
            this.lastVisible = snapshot.docs[snapshot.docs.length - 1];
          }
          subscriber.next(snapshot.docs.map(d => d.data() as Post));
          subscriber.complete();
        })
        .catch(err => subscriber.error(err));
    });
  }


  getUserPosts(userId: string): Observable<Post[]> {
    const q = query(
      collection(this.db, 'posts'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    return (collectionData(q, { idField: 'postId' }) as Observable<Post[]>)
      .pipe(
        debounceTime(1000),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      );
  }

  getMoreUserPosts(userId: string): Observable<Post[]> {
    const base = query(
      collection(this.db, 'posts'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const q = this.lastVisible ? query(base, startAfter(this.lastVisible)) : base;

    return new Observable<Post[]>(subscriber => {
      getDocs(q)
        .then(snapshot => {
          if (snapshot.size > 0) {
            this.lastVisible = snapshot.docs[snapshot.docs.length - 1];
          }
          subscriber.next(snapshot.docs.map(d => d.data() as Post));
          subscriber.complete();
        })
        .catch(err => subscriber.error(err));
    });
  }


  getCommentsForPost(postId: string, topCommentId?: string): Observable<Comment[]> {
    const q = query(
      collection(this.db, `posts/${postId}/comments`),
      orderBy('createdAt', 'asc')
    );

    return (collectionData(q, { idField: 'commentId' }) as Observable<Comment[]>)
      .pipe(
        map(comments => topCommentId ? comments.filter(c => c.commentId !== topCommentId) : comments),
        debounceTime(500),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      );
  }

  getTopCommentForPost(postId: string): Observable<Comment | undefined> {
    const q = query(
      collection(this.db, `posts/${postId}/comments`),
      orderBy('likeCount', 'desc'),
      limit(1)
    );
    return (new Observable<Comment | undefined>(subscriber => {
      getDocs(q)
        .then(snap => {
          const item = snap.docs.length ? (snap.docs[0].data() as Comment) : undefined;
          subscriber.next(item);
          subscriber.complete();
        })
        .catch(err => subscriber.error(err));
    }));
  }


  getThreeMostRecentPostsByUser(userId: string): Observable<Post[]> {
    const q = query(
      collection(this.db, 'posts'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(3)
    );
    return (collectionData(q, { idField: 'postId' }) as Observable<Post[]>)
      .pipe(map(posts => posts || []));
  }


  getPostsFromUsers(userIds: string[], lim: number): Observable<Post[]> {
    const q = query(
      collection(this.db, 'posts'),
      where('userId', 'in', userIds),
      orderBy('createdAt', 'desc'),
      limit(lim)
    );

    return new Observable<Post[]>(subscriber => {
      getDocs(q)
        .then(snapshot => {
          if (snapshot.docs.length > 0) {
            this.lastVisible = snapshot.docs[snapshot.docs.length - 1];
          }
          subscriber.next(snapshot.docs.map(d => d.data() as Post));
          subscriber.complete();
        })
        .catch(err => subscriber.error(err));
    });
  }

  getMorePostsFromUsers(userIds: string[], lim: number): Observable<Post[]> {
    if (!this.lastVisible) {
      console.error('No reference for the next page. Load initial posts first');
      return of([]);
    }

    const base = query(
      collection(this.db, 'posts'),
      where('userId', 'in', userIds),
      orderBy('createdAt', 'desc'),
      limit(lim)
    );
    const q = query(base, startAfter(this.lastVisible));

    return new Observable<Post[]>(subscriber => {
      getDocs(q)
        .then(snapshot => {
          if (snapshot.docs.length > 0) {
            this.lastVisible = snapshot.docs[snapshot.docs.length - 1];
          }
          subscriber.next(snapshot.docs.map(d => d.data() as Post));
          subscriber.complete();
        })
        .catch(err => subscriber.error(err));
    });
  }


  async incrementView(postId: string): Promise<void> {
    const fn = httpsCallable(this.fns, 'incrementPostView');
    await fn({ postId });
  }

  async incrementCommentCount(postId: string): Promise<void> {
    const fn = httpsCallable(this.fns, 'incrementCommentCount');
    await fn({ postId });
  }

  async addLike(postId: string | undefined, userId: string): Promise<void> {
    const fn = httpsCallable(this.fns, 'addLike');
    await fn({ postId, userId });
  }

  async removeLike(postId: string | undefined, userId: string): Promise<void> {
    const fn = httpsCallable(this.fns, 'removeLike');
    await fn({ postId, userId });
  }

  async checkIfUserLiked(postId: string, userId: string): Promise<boolean> {
    const ref = doc(this.db, `posts/${postId}/likes/${userId}`);
    const snap = await getDoc(ref);
    return snap.exists();
  }

  async addDislike(postId: string | undefined, userId: string): Promise<void> {
    const fn = httpsCallable(this.fns, 'addDislike');
    await fn({ postId, userId });
  }

  async removeDislike(postId: string | undefined, userId: string): Promise<void> {
    const fn = httpsCallable(this.fns, 'removeDislike');
    await fn({ postId, userId });
  }

  async checkIfUserDisliked(postId: string, userId: string): Promise<boolean> {
    const ref = doc(this.db, `posts/${postId}/dislikes/${userId}`);
    const snap = await getDoc(ref);
    return snap.exists();
  }
}

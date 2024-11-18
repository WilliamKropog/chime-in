import { Injectable } from '@angular/core';
import { AngularFirestore, QuerySnapshot } from '@angular/fire/compat/firestore';
import { Observable, of, pipe } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Post } from '../interface';
import { Comment } from '../interface';
import { AngularFireFunctions } from '@angular/fire/compat/functions';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  private lastVisible: any = null;

  constructor(private afs: AngularFirestore, private fns: AngularFireFunctions) { }

  savePost(data: Post): Promise<string> {
    const postRef = this.afs.collection<Post>('posts').doc();
    data.postId = postRef.ref.id;
    return postRef.set(data).then(() => {
      console.log("Post saved with ID:", data.postId);
      return postRef.ref.id;
    })
  }

  saveComment(postId: string, data: Comment): Promise<string> {
    const commentRef = this.afs.collection<Post>('posts')
      .doc(postId)
      .collection<Comment>('comments')
      .doc();

    data.commentId = commentRef.ref.id;

    return commentRef.set(data).then(() => {
      console.log('Comment saved with ID:', data.commentId);

      return this.incrementCommentCount(postId).then(() => {
        return commentRef.ref.id;
      });
    }).catch(error => {
      console.error('Error saving comment or incrementing comment count:', error);
      throw error;
    })
  }

  //Home Page initial list of Posts.

  getMostRecentPosts(): Observable<Post[]> {
    return this.afs.collection<Post>('posts', ref => ref.orderBy('createdAt', 'desc').limit(10))
    .valueChanges()
    .pipe(
      debounceTime(1000),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)));
  }

  //Home Page load more Posts when user scrolls to the bottom of page.

  getMorePosts(): Observable<Post[]> {
    return this.afs.collection<Post>('posts', ref => {
      let query = ref.orderBy('createdAt', 'desc').limit(10);
      if (this.lastVisible) {
        query = query.startAfter(this.lastVisible);
      }
      return query;
    }).get()
    .pipe(
      map((querySnapShot: QuerySnapshot<Post>) => {
        if (querySnapShot.size > 0) {
          this.lastVisible = querySnapShot.docs[querySnapShot.docs.length - 1];
        }
        return querySnapShot.docs.map(doc => doc.data());
      })
    )
  }

  //Posts for Profile Page

  getUserPosts(userId: string): Observable<Post[]> {
    return this.afs.collection<Post>('posts', ref => 
      ref.where('userId', '==', userId).orderBy('createdAt', 'desc').limit(10)
    ).valueChanges().pipe(
      debounceTime(1000),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    );
  }

  getMoreUserPosts(userId: string): Observable<Post[]> {
    return this.afs.collection<Post>('posts', ref => {
      let query = ref.where('userId', '==', userId).orderBy('createdAt', 'desc').limit(10);
      if (this.lastVisible) {
        query = query.startAfter(this.lastVisible);
      }
      return query;
    }).get().pipe(
      map((querySnapShot: QuerySnapshot<Post>) => {
        if (querySnapShot.size > 0) {
          this.lastVisible = querySnapShot.docs[querySnapShot.docs.length - 1];
        }
        return querySnapShot.docs.map(doc => doc.data());
      })
    )
  }

  //Comments for Posts

  getCommentsForPost(postId: string, topCommentId?: string): Observable<Comment[]> {
    return this.afs.collection<Post>('posts')
      .doc(postId)
      .collection<Comment>('comments', ref => ref.orderBy('createdAt', 'asc'))
      .valueChanges()
      .pipe(
        map(comments => {
          return topCommentId ? comments.filter(comment => comment.commentId !== topCommentId) : comments;
        }),
        debounceTime(500),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      );
  }

  getTopCommentForPost(postId: string): Observable<Comment | undefined> {
    return this.afs.collection('posts').doc(postId)
      .collection<Comment>('comments', ref => ref.orderBy('likeCount', 'desc').limit(1))
      .valueChanges()
      .pipe(map(comments => comments.length > 0 ? comments[0] : undefined));
  }

  //Posts for Recommended Profile

  getThreeMostRecentPostsByUser(userId: string): Observable<Post[]> {
    return this.afs.collection<Post>('posts', ref => 
      ref.where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(3)
    )
    .valueChanges()
    .pipe(
      map((posts: Post[]) => posts || [])
    );
  }

  //Posts for Featured Page

  getPostsFromUsers(userIds: string[], limit: number): Observable<Post[]> {
    return this.afs.collection<Post>('posts', ref => 
      ref.where('userId', 'in', userIds)
      .orderBy('createdAt', 'desc')
      .limit(limit)
    ).get().pipe(
      map((snapshot) => {
        if (snapshot.docs.length > 0) {
          this.lastVisible = snapshot.docs[snapshot.docs.length - 1];
        }
        return snapshot.docs.map((doc) => doc.data());
      })
    );
  }

  getMorePostsFromUsers(userIds: string[], limit: number): Observable<Post[]> {
    if (!this.lastVisible) {
      console.error('No reference for the next page. Load initial posts first');
      return of([]);
    }

    return this.afs.collection<Post>('posts', (ref) => 
      ref.where('userId', 'in', userIds)
      .orderBy('createdAt', 'desc')
      .startAfter(this.lastVisible)
      .limit(limit)  
    ).get().pipe(
      map((snapshot) => {
        if (snapshot.docs.length > 0) {
          this.lastVisible = snapshot.docs[snapshot.docs.length - 1];
        }
        return snapshot.docs.map((doc) => doc.data());
      })
    )
  }

  //Posts Functionalities

  incrementView(postId: string): Promise<void> {
    const incrementViewFn = this.fns.httpsCallable('incrementPostView');
    return incrementViewFn({ postId }).toPromise();
  }

  incrementCommentCount(postId: string): Promise<void> {
    const incrementCommentCountFn = this.fns.httpsCallable('incrementCommentCount');
    return incrementCommentCountFn({ postId }).toPromise();
  }

  addLike(postId: string | undefined, userId: string): Promise<void> {
    const addLikeFn = this.fns.httpsCallable('addLike');
    return addLikeFn({ postId, userId}).toPromise();
  }

  removeLike(postId: string | undefined, userId: string): Promise<void> {
    const removeLikeFn = this.fns.httpsCallable('removeLike');
    return removeLikeFn({ postId, userId }).toPromise();
  }

  checkIfUserLiked(postId: string, userId: string): Promise<boolean | undefined>{
    return this.afs.collection('posts').doc(postId).collection('likes').doc(userId).get().toPromise()
      .then(doc => doc?.exists);
  }

  addDislike(postId: string | undefined, userId: string): Promise<void> {
    const addDislikeFn = this.fns.httpsCallable('addDislike');
    return addDislikeFn({ postId, userId }).toPromise();
  }

  removeDislike(postId: string | undefined, userId: string): Promise<void> {
    const removeDislikeFn = this.fns.httpsCallable('removeDislike');
    return removeDislikeFn({ postId, userId }).toPromise();
  }
  
  checkIfUserDisliked(postId: string, userId: string): Promise<boolean | undefined>{
    return this.afs.collection('posts').doc(postId).collection('dislikes').doc(userId).get().toPromise()
    .then(doc => doc?.exists);
  }

}
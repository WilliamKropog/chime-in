import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, pipe } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Post } from '../interface';
import { Comment } from '../interface';
import { AngularFireFunctions } from '@angular/fire/compat/functions';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

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

  getMostRecentPosts(): Observable<Post[]> {
    return this.afs.collection<Post>('posts', ref => ref.orderBy('createdAt', 'desc').limit(10))
    .valueChanges()
    .pipe(debounceTime(1000),
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)));
  }

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
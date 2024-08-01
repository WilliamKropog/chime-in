import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, pipe } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Post } from '../interface';
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
  // Old savePost function:
  // savePost(data: Post) {
  //   console.log('sending data...');
  //   return this.afs.collection<Post>('posts').add(data);
  // }

  getMostRecentPosts(): Observable<Post[]> {
    return this.afs.collection<Post>('posts', ref => ref.orderBy('createdAt', 'desc').limit(10))
    .valueChanges()
    .pipe(debounceTime(1000),
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)));
  }

  incrementView(postId: string): Promise<void> {
    const incrementViewFn = this.fns.httpsCallable('incrementPostView');
    return incrementViewFn({ postId }).toPromise();
  }

  addLike(postId: string | undefined, userId: string): Promise<void> {
    const addLikeFn = this.fns.httpsCallable('addLike');
    return addLikeFn({ postId, userId}).toPromise();
  }

  checkIfUserLiked(postId: string, userId: string): Promise<boolean | undefined>{
    return this.afs.collection('posts').doc(postId).collection('likes').doc(userId).get().toPromise()
      .then(doc => doc?.exists);
  }

}
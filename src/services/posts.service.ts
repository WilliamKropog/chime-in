import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

  // savePost(data: Post) {
  //   console.log('sending data...');
  //   return this.afs.collection<Post>('posts').add(data);
  // }

  getMostRecentPost(): Observable<Post | undefined> {
    console.log('Fetching most recent post...');
    return this.afs.collection<Post>('posts', ref => ref.orderBy("createdAt", "desc").limit(1))
      .snapshotChanges()
      .pipe(
        map(actions => {
          const posts = actions.map(a => {
            const data = a.payload.doc.data() as Post;
            const id = a.payload.doc.id;
            return { id, ...data };
          });
          return posts.length > 0 ? posts[0] : undefined;
        })
      );
  }

  getMostRecentPosts(): Observable<Post[]> {
    return this.afs.collection<Post>('posts', ref => ref.orderBy('createdAt', 'desc').limit(3)).valueChanges();
  }

  incrementView(postId: string): Promise<void> {
    const incrementViewFn = this.fns.httpsCallable('incrementPostView');
    return incrementViewFn({ postId }).toPromise();
  }

}
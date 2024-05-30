import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Post } from '../interface';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  constructor(private afs: AngularFirestore) { }

  savePost(data: Post) {
    console.log('sending data...');
    return this.afs.collection<Post>('posts').add(data);
  }

  // getMostRecentPost(): Observable<Post | undefined> {
  //   console.log('Fetching most recent post...');
  //   return this.afs.collection<Post>('posts', ref => ref.orderBy("createdAt", "desc").limit(1))
  //     .snapshotChanges()
  //     .pipe(
  //       map(actions => {
  //         const data: any = actions.map(a => {
  //           const id = a.payload.doc.data() as Post;
  //           return { id, ...data };
  //         });
  //         return data.length > 0 ? data[0] : undefined;
  //       })
  //     );
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

}

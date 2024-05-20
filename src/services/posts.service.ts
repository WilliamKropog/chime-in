import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Post } from '../interface';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  constructor(private afs: AngularFirestore) { }

  // savePost(data: Post) {
  //   console.log('sending data...');
  //   return this.afs.collection('posts').add(data);
  // }

  savePost(data: Post) {
    console.log('sending data...');
    return this.afs.collection<Post>('posts').add(data);
  }

}

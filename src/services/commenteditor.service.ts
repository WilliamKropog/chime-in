import { Injectable } from '@angular/core';
import { user } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommentEditorService {

  private openEditorSubject = new Subject<string | null>();
  openEditor$ = this.openEditorSubject.asObservable();

  constructor(private afs: AngularFirestore, private fns: AngularFireFunctions) { }

  openEditor(postId: string): void {
    this.openEditorSubject.next(postId);
  }

  closeEditor(): void {
    this.openEditorSubject.next(null);
  }

  addLikeToComment(postId: string, commentId: string, userId: string): Promise<void> {
    const addLikeFn = this.fns.httpsCallable('addLikeToComment');
    return addLikeFn({ postId, commentId, userId }).toPromise();
  }

  removeLikeFromComment(postId: string, commentId: string, userId: string): Promise<void> {
    const removeLikeFn = this.fns.httpsCallable('removeLikeFromComment');
    return removeLikeFn({ postId, commentId, userId }).toPromise();
  }

  addDislikeToComment(postId: string, commentId: string, userId: string): Promise<void> {
    const addDislikeFn = this.fns.httpsCallable('addDislikeToComment');
    return addDislikeFn({ postId, commentId, userId }).toPromise();
  }

  removeDislikeFromComment(postId: string, commentId: string, userId: string): Promise<void> {
    const removeDislikeFn = this.fns.httpsCallable('removeDislikeFromComment');
    return removeDislikeFn({ postId, commentId, userId }).toPromise();
  }

  checkIfUserLikedComment(postId: string, commentId: string, userId: string): Promise<boolean | undefined> {
    return this.afs.collection('posts').doc(postId)
      .collection('comments').doc(commentId)
      .collection('likes').doc(userId).get().toPromise()
      .then(doc => doc?.exists);
  }

  checkIfUserDislikedComment(postId: string, commentId: string, userId: string): Promise<boolean | undefined> {
    return this.afs.collection('posts').doc(postId)
      .collection('comments').doc(commentId)
      .collection('dislikes').doc(userId).get().toPromise()
      .then(doc => doc?.exists);
  }

}

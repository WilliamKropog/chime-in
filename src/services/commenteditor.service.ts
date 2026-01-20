import { Injectable, EnvironmentInjector, runInInjectionContext, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';

@Injectable({ providedIn: 'root' })
export class CommentEditorService {

  private openEditorSubject = new Subject<string | null>();
  openEditor$ = this.openEditorSubject.asObservable();

  private env = inject(EnvironmentInjector);

  constructor(
    private db: Firestore,
    private fns: Functions
  ) {}

  openEditor(postId: string): void {
    this.openEditorSubject.next(postId);
  }

  closeEditor(): void {
    this.openEditorSubject.next(null);
  }

  async addLikeToComment(postId: string, commentId: string): Promise<void> {
    await runInInjectionContext(this.env, async () => {
      const fn = httpsCallable(this.fns, 'addLikeToComment');
      await fn({ postId, commentId });
    });
  }

  async removeLikeFromComment(postId: string, commentId: string): Promise<void> {
    await runInInjectionContext(this.env, async () => {
      const fn = httpsCallable(this.fns, 'removeLikeFromComment');
      await fn({ postId, commentId });
    });
  }

  async addDislikeToComment(postId: string, commentId: string): Promise<void> {
    await runInInjectionContext(this.env, async () => {
      const fn = httpsCallable(this.fns, 'addDislikeToComment');
      await fn({ postId, commentId });
    });
  }

  async removeDislikeFromComment(postId: string, commentId: string): Promise<void> {
    await runInInjectionContext(this.env, async () => {
      const fn = httpsCallable(this.fns, 'removeDislikeFromComment');
      await fn({ postId, commentId });
    });
  }

  async checkIfUserLikedComment(postId: string, commentId: string, userId: string): Promise<boolean> {
    return await runInInjectionContext(this.env, async () => {
      const ref = doc(this.db, `posts/${postId}/comments/${commentId}/likes/${userId}`);
      const snap = await getDoc(ref);
      return snap.exists();
    });
  }

  async checkIfUserDislikedComment(postId: string, commentId: string, userId: string): Promise<boolean> {
    return await runInInjectionContext(this.env, async () => {
      const ref = doc(this.db, `posts/${postId}/comments/${commentId}/dislikes/${userId}`);
      const snap = await getDoc(ref);
      return snap.exists();
    });
  }
}

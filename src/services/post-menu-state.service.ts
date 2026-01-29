import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PostMenuStateService {
  private openPostIdSubject = new Subject<string | null>();
  menuOpen$ = this.openPostIdSubject.asObservable();

  openMenu(postId: string): void {
    this.openPostIdSubject.next(postId);
  }

  closeMenu(): void {
    this.openPostIdSubject.next(null);
  }
}

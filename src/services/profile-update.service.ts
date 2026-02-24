import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Emit when the current user updates their profile (e.g. pfp) so Post/Comment
 * can refetch the author's photo without a full page refresh.
 */
@Injectable({ providedIn: 'root' })
export class ProfileUpdateService {
  /** Emits the userId whose profile was just updated (current user). */
  readonly profileUpdated$ = new Subject<string>();
}

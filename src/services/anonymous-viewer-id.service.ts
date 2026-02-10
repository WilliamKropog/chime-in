import { Injectable } from '@angular/core';

const STORAGE_KEY = 'chime_anon_viewer_id';

@Injectable({ providedIn: 'root' })
export class AnonymousViewerIdService {

  getOrCreateAnonymousViewerId(): string {
    if (typeof sessionStorage === 'undefined') {
      return this.generateId();
    }
    let id = sessionStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = this.generateId();
      sessionStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  }

  private generateId(): string {
    return 'anon_' + crypto.randomUUID();
  }
}

import { Injectable, inject, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { ref, Storage } from '@angular/fire/storage';
import { getDownloadURL, uploadBytes } from 'firebase/storage';
import { from, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {

  private env = inject(EnvironmentInjector);

  constructor(private storage: Storage) { }

  uploadImage(image: File, path: string): Observable<string> {
    return runInInjectionContext(this.env, () => {
      const storageRef = ref(this.storage, path);
      return from(uploadBytes(storageRef, image)).pipe(
        switchMap((result) => from(runInInjectionContext(this.env, () => getDownloadURL(result.ref))))
      );
    });
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthenticationService } from 'src/services/authentication.service';
import { ImageUploadService } from 'src/services/image-upload.service';
import { User } from 'firebase/auth';
import { UserService } from 'src/services/user.service';
import { ProfileUpdateService } from 'src/services/profile-update.service';
import { concatMap, switchMap, map, of, from } from 'rxjs';
import { HotToastService } from '@ngneat/hot-toast';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-profile-editor',
    templateUrl: './profile-editor.component.html',
    styleUrls: ['./profile-editor.component.css'],
    standalone: false
})
export class ProfileEditorComponent {
  @Input() isVisible: boolean = false;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();

  hasBackgroundImage: boolean = false;
  isLoading: boolean = false;
  bioText: string = '';
  characterCount: number = 0;
  /** Pending profile picture file (preview only until Save). */
  pfpFile: File | null = null;
  /** Object URL for pfp preview; revoked on clear/close. */
  pfpPreviewUrl: string | null = null;
  /** Pending background image file (preview only until Save). */
  backgroundFile: File | null = null;
  /** Object URL for background preview; revoked on clear/close. */
  backgroundPreviewUrl: string | null = null;
  /** Only set bioText from Firestore on first emission; later emissions (e.g. after background upload) must not overwrite user's typed bio. */
  private bioInitialized = false;

  user$ = this.authService.currentUser$.pipe(
    switchMap((authUser: User | null) => {
      if (authUser) {
        this.bioInitialized = false;
        return this.userService.getUserProfile(authUser.uid).pipe(
          map((firestoreData: any) => {
            this.hasBackgroundImage = !!firestoreData?.backgroundImageURL;
            if (!this.bioInitialized) {
              this.bioText = firestoreData?.bio || '';
              this.updateCharacterCount();
              this.bioInitialized = true;
            }
            return { ...authUser, ...firestoreData };
          })
        );
      } else {
        return of(null);
      }
    })
  );
  
  userSubscription: Subscription | null = null;

  constructor(
    private authService: AuthenticationService,
    private userService: UserService,
    private imageUploadService: ImageUploadService,
    private toast: HotToastService,
    private profileUpdateService: ProfileUpdateService
  ) { }

  updateCharacterCount(): void {
    this.characterCount = this.bioText.length;
  }

  updateBioText(value: string): void {
    this.bioText = value;
    this.updateCharacterCount();
  }

  unsubscribeUser(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
      this.userSubscription = null;
    }
  }

  /** Called when user selects a file: show preview only; no upload until Save. */
  onPfpFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (this.pfpPreviewUrl) {
      URL.revokeObjectURL(this.pfpPreviewUrl);
      this.pfpPreviewUrl = null;
    }
    this.pfpFile = file ?? null;
    this.pfpPreviewUrl = file ? URL.createObjectURL(file) : null;
    input.value = '';
  }

  clearPfpPreview(): void {
    if (this.pfpPreviewUrl) {
      URL.revokeObjectURL(this.pfpPreviewUrl);
      this.pfpPreviewUrl = null;
    }
    this.pfpFile = null;
  }

  /** Called when user selects a background file: show preview only; no upload until Save. */
  onBackgroundFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (this.backgroundPreviewUrl) {
      URL.revokeObjectURL(this.backgroundPreviewUrl);
      this.backgroundPreviewUrl = null;
    }
    this.backgroundFile = file ?? null;
    this.backgroundPreviewUrl = file ? URL.createObjectURL(file) : null;
    input.value = '';
  }

  clearBackgroundPreview(): void {
    if (this.backgroundPreviewUrl) {
      URL.revokeObjectURL(this.backgroundPreviewUrl);
      this.backgroundPreviewUrl = null;
    }
    this.backgroundFile = null;
  }

  private saveBioAndClose(user: User): void {
    from(this.userService.setUserProfile(user.uid, { bio: this.bioText }, { merge: true }))
      .pipe(
        this.toast.observe({
          loading: 'Saving...',
          success: 'Saved successfully!',
          error: 'Error saving.'
        })
      )
      .subscribe({
        next: () => this.onClose(),
        error: (error) => console.error('Error saving:', error)
      });
  }

  saveProfile(user: User): void {
    const doAfterBackground = () => {
      if (this.pfpFile) {
        this.imageUploadService.uploadImage(this.pfpFile, `images/profile/${user.uid}`).pipe(
          this.toast.observe({
            loading: 'Uploading profile picture...',
            success: 'Profile picture saved!',
            error: 'Error uploading profile picture.'
          }),
          concatMap((photoURL) =>
            from(this.userService.setUserProfile(user.uid, { profileImageURL: photoURL }, { merge: true })).pipe(
              concatMap(() => this.authService.updateProfileData({ photoURL }))
            )
          )
        ).subscribe({
          next: () => {
            this.clearPfpPreview();
            this.profileUpdateService.profileUpdated$.next(user.uid);
            this.saveBioAndClose(user);
          },
          error: () => this.clearPfpPreview()
        });
      } else {
        this.saveBioAndClose(user);
      }
    };

    if (this.backgroundFile) {
      this.imageUploadService.uploadImage(this.backgroundFile, `images/backgrounds/${user.uid}`).pipe(
        this.toast.observe({
          loading: 'Uploading background...',
          success: 'Background saved!',
          error: 'Error uploading background.'
        }),
        concatMap((backgroundImageURL) =>
          from(this.userService.setUserProfile(user.uid, { backgroundImageURL }, { merge: true }))
        )
      ).subscribe({
        next: () => {
          this.clearBackgroundPreview();
          doAfterBackground();
        },
        error: () => this.clearBackgroundPreview()
      });
    } else {
      doAfterBackground();
    }
  }

  onClose(): void {
    this.clearPfpPreview();
    this.clearBackgroundPreview();
    this.isVisible = false;
    this.close.emit();
  }

}

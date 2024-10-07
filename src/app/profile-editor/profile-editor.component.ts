import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthenticationService } from 'src/services/authentication.service';
import { ImageUploadService } from 'src/services/image-upload.service';
import { User } from 'firebase/auth';
import { UserService } from 'src/services/user.service';
import { concatMap, switchMap, map, of, from } from 'rxjs';
import { HotToastService } from '@ngneat/hot-toast';
import { Subscription } from 'rxjs';
import { user } from '@angular/fire/auth';

@Component({
  selector: 'app-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.css']
})
export class ProfileEditorComponent {
  @Input() isVisible: boolean = false;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();

  hasBackgroundImage: boolean = false;
  isLoading: boolean = false;
  bioText: string = '';
  characterCount: number = 0;

  user$ = this.authService.currentUser$.pipe(
    switchMap((authUser: User | null) => {
      if (authUser) {
        return this.userService.getUserProfile(authUser.uid).pipe(
          map((firestoreData: any) => {
            this.hasBackgroundImage = !!firestoreData?.backgroundImageURL;
            this.bioText = firestoreData?.bio || '';
            this.updateCharacterCount();
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
    private toast: HotToastService
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

  saveProfile(user: User) {
    const updates = { bio: this.bioText };

    from(this.userService.setUserProfile(user.uid, updates, { merge: true }))
      .pipe(
        this.toast.observe({
          loading: 'Saving bio...',
          success: 'Bio saved successfully!',
          error: 'Error saving bio.'
        })
      )
      .subscribe({
        next: () => {
          this.onClose();
        },
        error: (error) => {
          console.error('Error saving bio:', error);
        }
      });
  }

  uploadImage(event: any, user: User) {
    this.imageUploadService.uploadImage(event.target.files[0], `images/profile/${user.uid}`).pipe(
      this.toast.observe(
        {
          loading: 'Uploading image...',
          success: 'Image uploaded!',
          error: 'Error uploading'
        }
      ),
      concatMap((photoURL) => this.authService.updateProfileData({ photoURL }))
    ).subscribe();
  }

  uploadBackgroundImage(event: any, user: User) {
    const file = event.target.files[0];
    if (file) {
      this.imageUploadService.uploadImage(file, `images/backgrounds/${user.uid}`).pipe(
        this.toast.observe({
          loading: 'Uploading background image...',
          success: 'Background image uploaded!',
          error: 'Error uploading background image'
        }),
        concatMap((backgroundImageURL) => 
          this.userService.setUserProfile(user.uid, { backgroundImageURL }, { merge: true }))
      ).subscribe({
        next: () => console.log('Background image updated successfully'),
        error: (error) => console.error('Error updating background image:', error)
      });
    }
  }

  onClose(): void {
    this.isVisible = false;
    this.close.emit();
    console.log('Profile Modal closed.')
  }

}

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/services/authentication.service';
import { User } from 'firebase/auth';
import { concatMap } from 'rxjs';
import { ImageUploadService } from 'src/services/image-upload.service';
import { HotToastService } from '@ngneat/hot-toast';
import { Post } from 'src/interface';

@Component({
    selector: 'app-side-nav',
    templateUrl: './side-nav.component.html',
    styleUrls: ['./side-nav.component.css'],
    standalone: false
})
export class SideNavComponent implements OnInit {

  @Output() postCreated = new EventEmitter<Post>();

  user$ = this.authService.currentUser$;
  isPostEditorOpen: boolean = false;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private imageUploadService: ImageUploadService,
    private toast: HotToastService,
  ) { }

  ngOnInit(): void {

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

  //POST EDITOR BUTTON
  openPostEditor(): void {
    this.isPostEditorOpen = true;
  }

  closePostEditor(): void {
    this.isPostEditorOpen = false;
  }

  onPostCreated(newPost: Post) {
    this.isPostEditorOpen = false;
    this.postCreated.emit(newPost); 
  }

  //LOGOUT BUTTON

  logout() {
    console.log("Logout button clicked...");
    this.authService.logout();
    this.router.navigate(['']).then(() => {
      window.location.reload();
    });
  }


}

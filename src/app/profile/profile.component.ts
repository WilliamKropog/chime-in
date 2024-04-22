import { Component, OnInit } from '@angular/core';
import { HotToastService } from '@ngneat/hot-toast';
import { User } from 'firebase/auth';
import { concatMap } from 'rxjs';
import { AuthenticationService } from 'src/services/authentication.service';
import { ImageUploadService } from 'src/services/image-upload.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit{

  user$ = this.authService.currentUser$;

  constructor(private authService: AuthenticationService,
    private imageUploadService: ImageUploadService, 
    private toast: HotToastService,
  ){}

  ngOnInit(): void {
    
  }

  uploadImage(event: any, user: User){

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
}

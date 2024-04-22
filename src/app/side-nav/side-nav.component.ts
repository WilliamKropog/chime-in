import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/services/authentication.service';
import { User } from 'firebase/auth';
import { concatMap } from 'rxjs';
import { ImageUploadService } from 'src/services/image-upload.service';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit{

  user$ = this.authService.currentUser$;

  constructor(
    private authService: AuthenticationService, 
    private router: Router,
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

  // ngOnInit(): void{
  //   this.afAuth.authState.subscribe(user => {
  //     if (user) {
  //       this.userDataSubscription = this.firestore.collection('users').doc(user.uid).valueChanges().subscribe((userData: any) =>{
  //         if (userData && userData.userProfilePictureURL){
  //           this.userProfilePictureURL = userData.userProfilePictureURL;
  //         }
  //       })
  //     }
  //   })
  // }

  // ngOnDestroy(): void{
  //   if (this.userDataSubscription){
  //     this.userDataSubscription.unsubscribe();
  //   }
  // }

  //PFP UPLOAD

  // openFileExplorer(): void{
  //   const input = document.createElement('input');
  //   input.type = 'file';
  //   input.accept = 'image/png', 'image/jpeg';
  //   input.onchange = (event: any) => {
  //     const file = event.target.files[0];
  //     if (file) {
  //       this.uploadProfilePicture(file);
  //     }
  //   };
  //   input.click();
  // }

  // uploadProfilePicture(file: File): void {
  //   const fileName = `${new Date().getTime()}_${file.name}`;
  //   const filePath = `profile_pictures/${fileName}`;
  //   const storageRef = this.storage.ref(filePath);
  //   const uploadTask = this.storage.upload(filePath, file);

  //   uploadTask.snapshotChanges().pipe(
  //     finalize(() => {
  //       storageRef.getDownloadURL().subscribe((downloadURL) => {
  //         this.userProfilePictureURL = downloadURL;
  //         console.log('Uploaded profile picture URL:', downloadURL);
  //       });
  //     })
  //   ).subscribe();
  // }

  // saveProfilePictureURL(url: string): void{
  //   this.afAuth.authState.subscribe(user => {
  //     if (user) {
  //       this.firestore.collection('users').doc(user.uid).set({
  //         profilePictureURL: url
  //       }, {merge: true});
  //     }
  //   })
  // }
  
  //POST EDITOR BUTTON
  
  isPostEditorOpen: boolean = false;

  openPostEditor(): void {
    this.isPostEditorOpen = true;
  }

  closePostEditor(): void {
    this.isPostEditorOpen = false;
  }

  //LOGOUT BUTTON

  logout(){
    this.authService.logout().subscribe(() => {
    this.router.navigate(['']);
    });
  }


}

import { Component, EventEmitter, Input, Output, OnDestroy, inject, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { take } from 'rxjs/operators';
import { AuthenticationService } from 'src/services/authentication.service';
import { PostsService } from 'src/services/posts.service';
import { Post } from '../../interface';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-post-editor',
  templateUrl: './post-editor.component.html',
  styleUrls: ['./post-editor.component.css'],
  standalone: false
})
export class PostEditorComponent implements OnDestroy {
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() postCreated = new EventEmitter<Post>();   

  public user$ = this.authService.currentUser$;

  isLoading = false;
  postText = '';
  characterCount = 0;
  selectedImageUrl: string | ArrayBuffer | null | undefined = null;
  selectedFile: File | null = null;
  profileImageUrl = 'assets/images/png-transparent-default-avatar.png';
  errorMessage = '';
  activeMode: 'text' | 'image' = 'text';

  private env = inject(EnvironmentInjector);

  constructor(
    private authService: AuthenticationService,
    private postService: PostsService,
    private storage: Storage
  ) {}

  ngOnDestroy(): void {
  }

  switchToTextMode(): void {
    this.activeMode = 'text';
    this.selectedImageUrl = null;
  }

  async createPost(): Promise<void> {
  if (this.isLoading) return;
  this.isLoading = true;
  this.errorMessage = '';

  try {
    const user = await firstValueFrom(this.authService.currentUser$);
    if (!user) {
      this.errorMessage = 'You must be logged in to post.';
      return;
    }

    const draft: Post = {
      userId: user.uid,
      body: (this.postText || '').trim(),
      createdAt: new Date(),            
      photoURL: user.photoURL ?? null,
      displayName: user.displayName ?? null,
      postId: '',                       
      likeCount: 0,
      dislikeCount: 0,
      bookmarkCount: 0,
      repostCount: 0,
      commentCount: 0,
      views: 0,
      imageUrl: '',
    };

    if (this.selectedFile) {
      await runInInjectionContext(this.env, async () => {
        const fileRef = ref(this.storage, `posts/${user.uid}_${Date.now()}`);
        await uploadBytes(fileRef, this.selectedFile!);
        draft.imageUrl = await getDownloadURL(fileRef);
      });
    }

    const postId = await this.postService.savePost(draft);
    draft.postId = postId;

    this.postText = '';
    this.characterCount = 0;
    this.selectedFile = null;
    this.selectedImageUrl = null;

  } catch (err) {
    console.error('createPost failed', err);
    this.errorMessage = 'Failed to create post. Please try again.';
  } finally {
    this.close.emit();
    this.isLoading = false;
  }
}


// async createPost(): Promise<void> {
//     this.isLoading = true;
//     this.errorMessage = '';

//     try {
//       const user = await this.authService.currentUser$.pipe(take(1)).toPromise();
//       if (!user) {
//         this.isLoading = false;
//         this.errorMessage = 'You must be logged in to post.';
//         return;
//       }

//       const base: Post = {
//         body: this.postText.trim(),
//         photoURL: user.photoURL,
//         displayName: user.displayName,
//         userId: user.uid,
//         createdAt: new Date(),   
//         views: 0,
//         likeCount: 0,
//         dislikeCount: 0,
//         bookmarkCount: 0,
//         repostCount: 0,
//         commentCount: 0,
//         postId: '',
//         imageUrl: '',
//       };

//       let imageUrl = '';
//       if (this.selectedFile) {
//         await runInInjectionContext(this.env, async () => {
//           const fileRef = ref(this.storage, `posts/${Date.now()}_${user.uid}`);
//           const result = await uploadBytes(fileRef, this.selectedFile!);
//           imageUrl = await getDownloadURL(result.ref);
//         });
//       }

//       const toSave: Post = { ...base, imageUrl };

//       const postId = await this.postService.savePost(toSave);

//       const newPost: Post = { ...toSave, postId };
//       this.postCreated.emit(newPost);

//       this.postText = '';
//       this.selectedFile = null;
//       this.selectedImageUrl = null;
//       this.activeMode = 'text';
//       this.close.emit();
//     } catch (err) {
//       console.error('Error creating post:', err);
//       this.errorMessage = 'Failed to create post. Please try again.';
//     } finally {
//       this.isLoading = false;
//     }
//   }

  updateCharacterCount(): void {
    this.characterCount = this.postText.length;
  }

  updatePostText(value: string): void {
    this.postText = value;
    this.updateCharacterCount();
  }

  // unsubscribeUser(): void {
  //   if (this.userSubscription) {
  //     this.userSubscription.unsubscribe();
  //     this.userSubscription = null;
  //   }
  // }

  uploadImage(event: any): void {
    this.errorMessage = '';
    const file = event.target.files[0];
    if (!file) return;

    if (!this.isValidImage(file)) {
      this.errorMessage = 'Invalid file type. Please upload a valid image file.';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'File size exceeds the 5MB limit. Please choose a smaller file.';
      return;
    }

    this.activeMode = 'image';
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedImageUrl = e.target?.result;
    };
    reader.readAsDataURL(file);
  }

  isValidImage(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    return allowedTypes.includes(file.type);
  }

  onClose(): void {
    this.isVisible = false;
    this.close.emit();
    this.resetState();
  }

  resetState(): void {
    this.postText = '';
    this.characterCount = 0;
    this.selectedImageUrl = null;
    this.selectedFile = null;
    this.errorMessage = '';
    this.isLoading = false;
  }
}

//Old versions of methods:

  // chimein(): void {
  //   this.isLoading = true;
  //   this.errorMessage = '';

  //   this.userSubscription = this.authService.currentUser$.subscribe(user => {
  //     if (user) {
  //       const body: Post = {
  //         body: this.postText,
  //         photoURL: user.photoURL,
  //         displayName: user.displayName,
  //         userId: user.uid,
  //         createdAt: new Date(),
  //         views: 0,
  //         likeCount: 0,
  //         dislikeCount: 0,
  //         bookmarkCount: 0,
  //         repostCount: 0,
  //         commentCount: 0,
  //         postId: '',
  //         imageUrl: this.selectedImageUrl,
  //       };

  //       if (this.postText.length > 0 || this.selectedImageUrl) {
  //         this.postService.savePost(body).then((docId) => {
  //           body.postId = docId;
  //           this.onClose();
  //         }).catch(error => {
  //           console.error('Error saving post: ', error);
  //         }).finally(() => {
  //           this.isLoading = false;
  //           this.unsubscribeUser();
  //         });
  //       }
  //     } else {
  //       console.error('No user is logged in');
  //       this.isLoading = false;
  //     }
  //   })
  // }

  // uploadImage(event: any): void {
  //   const file = event.target.files[0];
  //   if (file && this.isValidImage(file)) {
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       this.selectedImageUrl = e.target?.result;
  //     };
  //     reader.readAsDataURL(file);
  //   } else {
  //     console.error('Invalid file type. Please upload a valid image file.');
  //   }
  // }

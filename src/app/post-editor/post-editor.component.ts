import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthenticationService } from 'src/services/authentication.service';
import { PostsService } from 'src/services/posts.service';
import { Post } from '../../interface';
import { ImageUploadService } from 'src/services/image-upload.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-post-editor',
  templateUrl: './post-editor.component.html',
  styleUrls: ['./post-editor.component.css']
})
export class PostEditorComponent {
  @Input() isVisible: boolean = false;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();

  isLoading: boolean = false;
  postText: string = '';
  characterCount: number = 0;
  selectedImageUrl: string | ArrayBuffer | null | undefined = null;
  profileImageUrl: string = 'assets/images/png-transparent-default-avatar.png';

  user$ = this.authService.currentUser$;
  userSubscription: Subscription | null = null;

  constructor(
    private authService: AuthenticationService,
    private postService: PostsService,
    private imageUploadService: ImageUploadService
  ) { }

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if(user) {
        this.profileImageUrl = user.photoURL ?? this.profileImageUrl;
      }
    });
  }

  chimein(): void {
    this.isLoading = true;

    this.userSubscription?.unsubscribe();

    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        const body: Post = {
          body: this.postText,
          photoURL: user.photoURL,
          displayName: user.displayName,
          userId: user.uid,
          createdAt: new Date(),
          views: 0,
          likeCount: 0,
          dislikeCount: 0,
          bookmarkCount: 0,
          repostCount: 0,
          commentCount: 0,
          postId: '',
          imageUrl: this.selectedImageUrl,
        };

        if (this.postText.length > 0 || this.selectedImageUrl) {
          this.postService.savePost(body).then((docId) => {
            body.postId = docId;
            this.onClose();
          }).catch(error => {
            console.error('Error saving post: ', error);
          }).finally(() => {
            this.isLoading = false;
            this.unsubscribeUser();
          });
        }
      } else {
        console.error('No user is logged in');
        this.isLoading = false;
      }
    })
  }

  updateCharacterCount(): void {
    this.characterCount = this.postText.length;
  }

  updatePostText(value: string): void {
    this.postText = value;
    this.updateCharacterCount();
  }

  unsubscribeUser(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
      this.userSubscription = null;
    }
  }

  uploadImage(event: any): void {
    const file = event.target.files[0];
    if (file && this.isValidImage(file)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImageUrl = e.target?.result;
      };
      reader.readAsDataURL(file);
    } else {
      console.error('Invalid file type. Please upload a valid image file.');
    }
  }

  isValidImage(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    return allowedTypes.includes(file.type);
  }

  onClose(): void {
    this.isVisible = false;
    this.close.emit();
    console.log('Post Modal closed.')
  }
}

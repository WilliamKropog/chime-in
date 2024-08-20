import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { Post } from 'src/interface';
import { AuthenticationService } from 'src/services/authentication.service';
import { PostsService } from 'src/services/posts.service';

@Component({
  selector: 'app-comment-editor',
  templateUrl: './comment-editor.component.html',
  styleUrl: './comment-editor.component.css'
})
export class CommentEditorComponent {
  @Input() isVisible: boolean = false;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();

  isLoading: boolean = false;
  commentText: string = '';
  characterCount: number = 0;

  user$ = this.authService.currentUser$;
  userSubscription: Subscription | null = null;

  constructor(
    private authService: AuthenticationService,
    private postService: PostsService,
  ) { }

  // chimein(): void {
  //   this.isLoading = true;

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
  //       };

  //       if (this.postText.length > 0) {
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


  updateCharacterCount(): void {
    this.characterCount = this.commentText.length;
  }

  updateCommentText(value: string): void {
    this.commentText = value;
    this.updateCharacterCount();
  }

  unsubscribeUser(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
      this.userSubscription = null;
    }
  }

  onClose(): void {
    this.isVisible = false;
    this.close.emit();
    console.log('Post Modal closed.')
  }
}
